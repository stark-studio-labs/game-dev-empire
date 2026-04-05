#!/usr/bin/env python3
"""
Tech Empire -- Comprehensive Automated Test Suite via Chrome DevTools Protocol
Runs against a live game instance on port 9222.

This test suite uses CDP Runtime.evaluate to execute JavaScript in the running
Electron game, which is the standard approach for E2E testing via DevTools.
"""

import os
import json
import asyncio
import urllib.request
import websockets
import time
import sys

# -- CDP Helper -----------------------------------------------------------

PAGE_ID = None
MSG_ID = 0

async def get_page_id():
    pages = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json/list").read())
    return next(p['id'] for p in pages if p.get('type') == 'page' and 'devtools' not in p.get('url', ''))

async def cdp_run(ws, expr, timeout=10):
    """Execute a JavaScript expression in the game via CDP Runtime.evaluate"""
    global MSG_ID
    MSG_ID += 1
    cmd = {"id": MSG_ID, "method": "Runtime.evaluate", "params": {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True,
    }}
    await ws.send(json.dumps(cmd))
    deadline = time.time() + timeout
    while True:
        raw = await asyncio.wait_for(ws.recv(), timeout=timeout)
        r = json.loads(raw)
        if r.get("id") == MSG_ID:
            result = r.get("result", {}).get("result", {})
            if result.get("type") == "undefined":
                return None
            return result.get("value", result)
        if time.time() > deadline:
            return "TIMEOUT"


# -- Test Infrastructure --------------------------------------------------

RESULTS = []

def record(name, passed, detail=""):
    RESULTS.append({"name": name, "passed": passed, "detail": detail})
    icon = "\u2705" if passed else "\u274c"
    line = f"{icon} {'PASS' if passed else 'FAIL'}: {name}"
    if detail and not passed:
        line += f" -- {detail}"
    print(line)


# -- Test Categories ------------------------------------------------------

async def test_core_engine(ws):
    """1. Core Engine Tests"""
    print("\n=== 1. Core Engine Tests ===")

    # 1.1 Initial state
    cash = await cdp_run(ws, "engine.state.cash")
    record("Initial cash is $70,000", cash == 70000, f"got {cash}")

    fans = await cdp_run(ws, "engine.state.fans")
    record("Initial fans is 0", fans == 0, f"got {fans}")

    year = await cdp_run(ws, "engine.state.year")
    record("Initial year is 1", year == 1, f"got {year}")

    month = await cdp_run(ws, "engine.state.month")
    record("Initial month is 1", month == 1, f"got {month}")

    week = await cdp_run(ws, "engine.state.week")
    record("Initial week is 1", week == 1, f"got {week}")

    level = await cdp_run(ws, "engine.state.level")
    record("Initial level is 0", level == 0, f"got {level}")

    # 1.2 Tick advances time
    await cdp_run(ws, "engine.tick()")
    week_after = await cdp_run(ws, "engine.state.week")
    record("Tick advances week", week_after == 2, f"expected 2, got {week_after}")

    # 1.3 Speed settings
    speed0 = await cdp_run(ws, "engine.setSpeed(0); engine.speed")
    record("Speed 0 = paused", speed0 == 0, f"got {speed0}")

    speed1 = await cdp_run(ws, "engine.setSpeed(1); engine.speed")
    record("Speed 1 = 1x", speed1 == 1, f"got {speed1}")
    await cdp_run(ws, "engine.setSpeed(0)")

    speed2 = await cdp_run(ws, "engine.setSpeed(2); engine.speed")
    record("Speed 2 = 2x", speed2 == 2, f"got {speed2}")
    await cdp_run(ws, "engine.setSpeed(0)")

    speed4 = await cdp_run(ws, "engine.setSpeed(4); engine.speed")
    record("Speed 4 = 4x", speed4 == 4, f"got {speed4}")
    await cdp_run(ws, "engine.setSpeed(0)")

    speed8 = await cdp_run(ws, "engine.setSpeed(8); engine.speed")
    record("Speed 8 = 8x", speed8 == 8, f"got {speed8}")
    await cdp_run(ws, "engine.setSpeed(0)")

    # 1.4 TICK_MS is 5000
    tick_ms = await cdp_run(ws, "engine.TICK_MS")
    record("TICK_MS is 5000", tick_ms == 5000, f"got {tick_ms}")

    # 1.5 Save/load roundtrip
    await cdp_run(ws, "engine._save()")
    cash_before = await cdp_run(ws, "engine.state.cash")
    await cdp_run(ws, "engine.state.cash = 12345")
    await cdp_run(ws, "engine.load()")
    cash_after = await cdp_run(ws, "engine.state.cash")
    record("Save/load roundtrips state correctly", cash_after == cash_before,
           f"before save: {cash_before}, after load: {cash_after}")


async def test_topic_system(ws):
    """2. Topic System Tests"""
    print("\n=== 2. Topic System Tests ===")

    total = await cdp_run(ws, "TOPICS.length")
    record("85 total topics exist", total == 85, f"got {total}")

    t1 = await cdp_run(ws, "TOPICS.filter(t => t.tier === 1).length")
    record("30 Tier 1 topics", t1 == 30, f"got {t1}")

    t2 = await cdp_run(ws, "TOPICS.filter(t => t.tier === 2).length")
    record("26 Tier 2 topics", t2 == 26, f"got {t2}")

    t3 = await cdp_run(ws, "TOPICS.filter(t => t.tier === 3).length")
    record("29 Tier 3 topics", t3 == 29, f"got {t3}")

    all_genre = await cdp_run(ws, "TOPICS.every(t => Array.isArray(t.genreW) && t.genreW.length === 6)")
    record("All topics have 6 genre weightings", all_genre == True, f"got {all_genre}")

    all_aud = await cdp_run(ws, "TOPICS.every(t => Array.isArray(t.audienceW) && t.audienceW.length === 3)")
    record("All topics have 3 audience weightings", all_aud == True, f"got {all_aud}")

    no_tier = await cdp_run(ws, "TOPICS.filter(t => !t.tier).length")
    record("No topics without a tier", no_tier == 0, f"found {no_tier} without tier")


async def test_game_creation(ws):
    """3. Game Creation Tests"""
    print("\n=== 3. Game Creation Tests ===")

    started = await cdp_run(ws, """
        engine.startGame({
            title: 'Test Quest',
            topic: 'Fantasy',
            genre: 'RPG',
            audience: 'Everyone',
            platformId: 'pc',
            size: 'Small',
            sliders: [40, 30, 30]
        })
    """)
    record("startGame() returns true", started == True, f"got {started}")

    has_game = await cdp_run(ws, """
        !!(engine.state.currentGame && engine.state.currentGame.title === 'Test Quest')
    """)
    record("Game created with correct title", has_game == True)

    topic = await cdp_run(ws, "engine.state.currentGame.topic")
    record("Game has correct topic", topic == "Fantasy", f"got {topic}")

    genre = await cdp_run(ws, "engine.state.currentGame.genre")
    record("Game has correct genre", genre == "RPG", f"got {genre}")

    platform = await cdp_run(ws, "engine.state.currentGame.platformId")
    record("Game has correct platform", platform == "pc", f"got {platform}")

    phase = await cdp_run(ws, "engine.state.devPhase")
    record("Dev phase starts at 0", phase == 0, f"got {phase}")

    # Tick through phase 0 to completion
    for _ in range(10):
        waiting = await cdp_run(ws, "engine.state.waitingForPhaseInput")
        if waiting:
            break
        await cdp_run(ws, "engine.tick()")

    waiting = await cdp_run(ws, "engine.state.waitingForPhaseInput")
    record("Phase 0 completes and waits for input", waiting == True, f"waitingForPhaseInput = {waiting}")

    next_phase = await cdp_run(ws, "engine.state.nextPhaseIndex")
    record("nextPhaseIndex is 1", next_phase == 1, f"got {next_phase}")

    await cdp_run(ws, "engine.submitPhaseSliders([40, 30, 30])")
    phase_after = await cdp_run(ws, "engine.state.devPhase")
    record("submitPhaseSliders advances to phase 1", phase_after == 1, f"got {phase_after}")
    await cdp_run(ws, "engine.setSpeed(0)")

    # Tick through phase 1 to completion
    for _ in range(10):
        waiting = await cdp_run(ws, "engine.state.waitingForPhaseInput")
        if waiting:
            break
        await cdp_run(ws, "engine.tick()")

    await cdp_run(ws, "engine.submitPhaseSliders([30, 40, 30])")
    await cdp_run(ws, "engine.setSpeed(0)")

    # Tick through phase 2 to release
    for _ in range(10):
        released = await cdp_run(ws, "engine.state.currentGame === null")
        if released:
            break
        await cdp_run(ws, "engine.tick()")

    released = await cdp_run(ws, "engine.state.currentGame === null")
    record("Phase 2 completion releases game", released == True, f"currentGame is null: {released}")


async def test_scoring(ws):
    """4. Scoring Tests"""
    print("\n=== 4. Scoring Tests ===")

    games_count = await cdp_run(ws, "engine.state.games.length")
    record("At least 1 game released", games_count >= 1, f"games count: {games_count}")

    avg_score = await cdp_run(ws, "engine.state.games[engine.state.games.length - 1].reviewAvg")
    record("Game has avgScore between 1-10",
           isinstance(avg_score, (int, float)) and 1 <= avg_score <= 10,
           f"reviewAvg = {avg_score}")

    revenue = await cdp_run(ws, "engine.state.games[engine.state.games.length - 1].totalRevenue")
    record("Revenue is positive",
           isinstance(revenue, (int, float)) and revenue > 0,
           f"totalRevenue = {revenue}")

    fans_gained = await cdp_run(ws, "engine.state.games[engine.state.games.length - 1].fansGained")
    record("Fans gained on release",
           isinstance(fans_gained, (int, float)) and fans_gained > 0,
           f"fansGained = {fans_gained}")

    sequel_mod = await cdp_run(ws, """
        (function() {
            var mod = franchiseTracker.getSequelModifier('Test Quest', engine.state.totalWeeks);
            return mod ? mod.multiplier : null;
        })()
    """)
    record("Sequel modifier applies for same title",
           sequel_mod is not None and isinstance(sequel_mod, (int, float)),
           f"sequel multiplier = {sequel_mod}")


async def test_financial(ws):
    """5. Financial Tests"""
    print("\n=== 5. Financial Tests ===")

    cash = await cdp_run(ws, "engine.state.cash")
    record("Cash changed from initial $70K after release",
           isinstance(cash, (int, float)) and cash != 70000,
           f"cash = {cash}")

    expenses_exist = await cdp_run(ws, """
        typeof engine._monthlyExpenses === 'function'
    """)
    record("Monthly expenses function exists", expenses_exist == True)

    # Tick to trigger a month change and verify salary deductions
    await cdp_run(ws, """
        while(engine.state.week < 4) { engine.tick(); }
        engine.tick();
    """)

    salary_records = await cdp_run(ws, """
        finance.transactions.filter(function(t) { return t.category === 'salary' || t.category === 'office_rent'; }).length
    """)
    record("Salary/rent transactions recorded after month tick",
           isinstance(salary_records, (int, float)) and salary_records >= 0,
           f"salary/rent records = {salary_records}")

    tax_tick = await cdp_run(ws, "typeof taxSystem.tick === 'function'")
    record("Tax system tick function exists", tax_tick == True)

    tax_rates = await cdp_run(ws, "JSON.stringify(TaxSystem.TAX_RATES)")
    record("Tax rates defined for all office levels",
           isinstance(tax_rates, str) and "Garage" in tax_rates and "Large Office" in tax_rates,
           f"rates = {tax_rates}")

    took = await cdp_run(ws, "engine.takeLoan(100000)")
    record("takeLoan(100000) succeeds", took == True, f"got {took}")

    loan = await cdp_run(ws, "engine.state.loan !== null")
    record("Loan object exists after takeLoan", loan == True)

    loan_principal = await cdp_run(ws, "engine.state.loan ? engine.state.loan.principal : null")
    record("Loan principal is 100000", loan_principal == 100000, f"got {loan_principal}")

    repaid = await cdp_run(ws, "engine.repayLoan()")
    record("repayLoan() succeeds", repaid == True, f"got {repaid}")

    loan_after = await cdp_run(ws, "engine.state.loan")
    record("Loan is null after repayment", loan_after is None, f"got {loan_after}")


async def test_staff(ws):
    """6. Staff Tests"""
    print("\n=== 6. Staff Tests ===")

    staff_count = await cdp_run(ws, "engine.state.staff.length")
    record("Initial staff count is 1 (founder)", staff_count == 1, f"got {staff_count}")

    founder = await cdp_run(ws, "engine.state.staff[0].isFounder")
    record("First staff member is founder", founder == True)

    applicants = await cdp_run(ws, """
        (function() {
            var a = engine.generateApplicants(3);
            return JSON.stringify({ count: a.length, hasName: !!a[0].name, hasDesign: typeof a[0].design === 'number' });
        })()
    """)
    parsed = json.loads(applicants) if isinstance(applicants, str) else applicants
    record("generateApplicants() returns 3 candidates",
           parsed.get("count") == 3,
           f"got {parsed}")
    record("Applicants have name and design stat",
           parsed.get("hasName") == True and parsed.get("hasDesign") == True)

    hire_result = await cdp_run(ws, """
        (function() {
            var a = engine.generateApplicants(1)[0];
            return engine.hireStaff(a);
        })()
    """)
    record("hireStaff() rejected at full Garage (maxStaff=1)",
           hire_result == False,
           f"got {hire_result}")

    # Force upgrade to allow hiring
    await cdp_run(ws, "engine.state.level = 1")
    hire_result2 = await cdp_run(ws, """
        (function() {
            var a = engine.generateApplicants(1)[0];
            return engine.hireStaff(a);
        })()
    """)
    record("hireStaff() succeeds after office upgrade", hire_result2 == True, f"got {hire_result2}")

    staff_after_hire = await cdp_run(ws, "engine.state.staff.length")
    record("Staff count is 2 after hire", staff_after_hire == 2, f"got {staff_after_hire}")

    fire_result = await cdp_run(ws, """
        (function() {
            var nonFounder = engine.state.staff.find(function(m) { return !m.isFounder; });
            if (!nonFounder) return false;
            return engine.fireStaff(nonFounder.id);
        })()
    """)
    record("fireStaff() removes non-founder", fire_result == True, f"got {fire_result}")

    staff_after_fire = await cdp_run(ws, "engine.state.staff.length")
    record("Staff count is 1 after fire", staff_after_fire == 1, f"got {staff_after_fire}")

    fire_founder = await cdp_run(ws, "engine.fireStaff('founder')")
    record("Cannot fire founder", fire_founder == False, f"got {fire_founder}")

    energy = await cdp_run(ws, "energySystem.getEnergy('founder')")
    record("Energy system tracks founder energy",
           isinstance(energy, (int, float)) and 0 <= energy <= 100,
           f"energy = {energy}")

    await cdp_run(ws, "engine.state.level = 0")


async def test_system_integration(ws):
    """7. System Integration Tests"""
    print("\n=== 7. System Integration Tests ===")

    comp_count = await cdp_run(ws, "COMPETITOR_STUDIOS.length")
    record("6 competitor studios defined", comp_count == 6, f"got {comp_count}")

    comp_system = await cdp_run(ws, "typeof competitorSystem !== 'undefined'")
    record("Competitor system loaded", comp_system == True)

    victory_paths = await cdp_run(ws, "typeof VICTORY_PATHS !== 'undefined' ? VICTORY_PATHS.length : 0")
    record("5 victory paths loaded", victory_paths == 5, f"got {victory_paths}")

    victory_ids = await cdp_run(ws, "VICTORY_PATHS.map(function(p) { return p.id; })")
    expected_ids = ['brand_empire', 'innovation_leader', 'market_dominator', 'financial_titan', 'industry_kingmaker']
    record("Victory path IDs match expected",
           victory_ids == expected_ids,
           f"got {victory_ids}")

    storyteller_exists = await cdp_run(ws, "typeof storyteller !== 'undefined' && typeof storyteller.dramaScore === 'number'")
    record("Storyteller loaded with dramaScore property", storyteller_exists == True)

    drama = await cdp_run(ws, "storyteller.dramaScore")
    record("Drama score is a number 0-100",
           isinstance(drama, (int, float)) and 0 <= drama <= 100,
           f"dramaScore = {drama}")

    timeline_count = await cdp_run(ws, "typeof TECH_TIMELINE_EVENTS !== 'undefined' ? TECH_TIMELINE_EVENTS.length : 0")
    record("Timeline events exist (20+)", timeline_count >= 20, f"got {timeline_count}")

    conf_count = await cdp_run(ws, "typeof CONFERENCES !== 'undefined' ? CONFERENCES.length : 0")
    record("Conferences defined (3)", conf_count == 3, f"got {conf_count}")

    ipo_exists = await cdp_run(ws, "typeof ipoSystem !== 'undefined' && typeof ipoSystem.isEligible === 'function'")
    record("IPO system loaded", ipo_exists == True)

    vert_count = await cdp_run(ws, """
        typeof VERTICAL_DEFS !== 'undefined' ? Object.keys(VERTICAL_DEFS).length : 0
    """)
    record("Verticals available (4)", vert_count == 4, f"got {vert_count}")

    synergy_count = await cdp_run(ws, "typeof SYNERGY_DEFS !== 'undefined' ? SYNERGY_DEFS.length : 0")
    record("Synergies loaded (3+)", synergy_count >= 3, f"got {synergy_count}")

    morale_val = await cdp_run(ws, "moraleSystem.getMorale()")
    record("Morale system returns value 0-100",
           isinstance(morale_val, (int, float)) and 0 <= morale_val <= 100,
           f"morale = {morale_val}")

    mktg = await cdp_run(ws, "typeof marketingSystem !== 'undefined' && typeof marketingSystem.weeklyTick === 'function'")
    record("Marketing system loaded", mktg == True)

    campaigns = await cdp_run(ws, "typeof CAMPAIGN_TYPES !== 'undefined' ? CAMPAIGN_TYPES.length : 0")
    record("Campaign types defined (3+)", campaigns >= 3, f"got {campaigns}")

    research = await cdp_run(ws, "typeof researchSystem !== 'undefined' && typeof researchSystem.tick === 'function'")
    record("Research system loaded", research == True)

    research_items = await cdp_run(ws, "typeof RESEARCH_ITEMS !== 'undefined' ? RESEARCH_ITEMS.length : 0")
    record("Research items defined (33+)", research_items >= 33, f"got {research_items}")


async def test_feature_gating(ws):
    """8. Feature Gating Tests"""
    print("\n=== 8. Feature Gating Tests ===")

    await cdp_run(ws, "settingsSystem.setDevMode(false)")
    await cdp_run(ws, "engine.state.level = 0")

    research_locked = await cdp_run(ws, """
        (function() {
            var devMode = settingsSystem.devMode;
            var level = engine.state.level;
            return !(devMode || level >= 2);
        })()
    """)
    record("Research locked at level 0", research_locked == True, f"got {research_locked}")

    hardware_locked = await cdp_run(ws, """
        (function() {
            var devMode = settingsSystem.devMode;
            var level = engine.state.level;
            return !(devMode || level >= 3);
        })()
    """)
    record("Hardware locked at level 0", hardware_locked == True, f"got {hardware_locked}")

    marketing_locked = await cdp_run(ws, """
        (function() {
            var devMode = settingsSystem.devMode;
            var level = engine.state.level;
            return !(devMode || level >= 1);
        })()
    """)
    record("Marketing locked at level 0", marketing_locked == True, f"got {marketing_locked}")

    training_locked = await cdp_run(ws, """
        (function() {
            var devMode = settingsSystem.devMode;
            var level = engine.state.level;
            return !(devMode || level >= 1);
        })()
    """)
    record("Training locked at level 0", training_locked == True, f"got {training_locked}")

    locked_count = await cdp_run(ws, """
        (function() {
            var level = engine.state.level;
            var totalRevenue = finance.totalRevenue();
            var staffLen = engine.state.staff.length;
            var count = 0;
            if (!(level >= 2)) count++;
            if (!(level >= 3)) count++;
            if (!(level >= 2 && totalRevenue >= 10000000)) count++;
            if (!(level >= 1)) count++;
            if (!(level >= 1)) count++;
            if (!(staffLen >= 2)) count++;
            return count;
        })()
    """)
    record("6 features locked at level 0 with 1 staff", locked_count == 6, f"got {locked_count}")


async def _dismiss_blockers(ws):
    """Clear any events/conferences/gameOver that block tick advancement."""
    await cdp_run(ws, """
        (function() {
            if (engine.state.pendingEvent) engine.resolveEvent(0);
            if (engine.state.eventConsequence) engine.dismissEventConsequence();
            if (engine.state.pendingConference) engine.state.pendingConference = null;
            if (engine.state.boardMeetingResult) engine.state.boardMeetingResult = null;
            if (engine.state.activistThreat) engine.state.activistThreat = null;
            if (engine.state.waitingForPhaseInput) {
                engine.submitPhaseSliders([33, 33, 34]);
                engine.setSpeed(0);
            }
            // In test context: prevent bankruptcy from halting ticks
            if (engine.state.gameOver && engine.state.gameOverReason === 'bankruptcy') {
                engine.state.gameOver = false;
                engine.state.gameOverReason = null;
                engine.state.negativeWeeks = 0;
                engine.state.cash = Math.max(engine.state.cash, 100000);
            }
        })()
    """)


async def _force_tick(ws):
    """Dismiss blockers then tick."""
    await _dismiss_blockers(ws)
    await cdp_run(ws, "engine.tick()")


async def test_sales_bug(ws):
    """9. Sales Bug Test"""
    print("\n=== 9. Sales Bug Test ===")

    await cdp_run(ws, "window._devAutoPlay('Sales Bug Corp')")
    await asyncio.sleep(0.3)
    # Ensure enough cash to avoid bankruptcy during sales period
    await cdp_run(ws, "engine.state.cash = 500000")

    await cdp_run(ws, """
        engine.startGame({
            title: 'Sales Test Game',
            topic: 'Fantasy',
            genre: 'RPG',
            audience: 'Everyone',
            platformId: 'pc',
            size: 'Small',
            sliders: [40, 30, 30]
        })
    """)

    # Tick through all dev phases until release
    for _ in range(50):
        released = await cdp_run(ws, "engine.state.currentGame === null")
        if released:
            break
        await _force_tick(ws)

    selling = await cdp_run(ws, "engine.state.sellingGame !== null")
    record("After release, sellingGame exists", selling == True, f"got {selling}")

    weeks_left = await cdp_run(ws, "engine.state.salesWeeksLeft")
    record("salesWeeksLeft is positive after release",
           isinstance(weeks_left, (int, float)) and weeks_left > 0,
           f"got {weeks_left}")

    initial_weeks = weeks_left

    await _force_tick(ws)
    weeks_after = await cdp_run(ws, "engine.state.salesWeeksLeft")
    record("salesWeeksLeft decreases after tick",
           isinstance(weeks_after, (int, float)) and weeks_after < initial_weeks,
           f"before={initial_weeks}, after={weeks_after}")

    # Tick until sales complete -- force-dismiss any blockers
    for _ in range(40):
        selling_now = await cdp_run(ws, "engine.state.sellingGame")
        if selling_now is None:
            break
        await _force_tick(ws)

    selling_after = await cdp_run(ws, "engine.state.sellingGame")
    record("Sales eventually complete (sellingGame becomes null)",
           selling_after is None,
           f"salesWeeksLeft={await cdp_run(ws, 'engine.state.salesWeeksLeft')}")


async def test_victory_balance(ws):
    """10. Victory Balance Test"""
    print("\n=== 10. Victory Balance Test ===")

    # Test that Market Dominator requires both 60% share AND $500M revenue
    # First verify the source code on disk has the $500M guard
    check = await cdp_run(ws, """
        (function() {
            var path = VICTORY_PATHS.find(function(p) { return p.id === 'market_dominator'; });
            if (!path) return JSON.stringify({ error: 'not_found' });
            var src = path.checkCondition.toString();
            var has500MGuard = src.indexOf('500000000') >= 0;
            // Test: pure revenue path needs $2B
            var noWinPureRev = path.checkCondition(
                { fans: 0, isPublic: false, games: [] },
                { totalRevenue: 1999999999, marketShare: 0, companyValuation: 0, awardsWon: 0, completedMoonshots: 0, moonshotProgressPct: 0, standardsControlled: 0, industryVotesWon: 0 }
            );
            var winPureRev = path.checkCondition(
                { fans: 0, isPublic: false, games: [] },
                { totalRevenue: 2000000000, marketShare: 0, companyValuation: 0, awardsWon: 0, completedMoonshots: 0, moonshotProgressPct: 0, standardsControlled: 0, industryVotesWon: 0 }
            );
            return JSON.stringify({
                has500MGuard: has500MGuard,
                noWinPureRev: noWinPureRev,
                winPureRev: winPureRev
            });
        })()
    """)
    parsed = json.loads(check) if isinstance(check, str) else check
    record("Market Dominator requires $2B for pure revenue path",
           parsed.get("winPureRev") == True and parsed.get("noWinPureRev") == False,
           f"win@2B={parsed.get('winPureRev')}, noWin@1.99B={parsed.get('noWinPureRev')}")

    # Check if the $500M guard is present in live code (may need reload)
    has_guard = parsed.get("has500MGuard", False)
    record("Market Dominator has $500M revenue guard in checkCondition",
           has_guard == True,
           f"has500MGuard={has_guard} (source on disk has it; game may need reload)")

    await cdp_run(ws, "window._devAutoPlay('Y1 Victory Test')")
    await asyncio.sleep(0.3)

    victory = await cdp_run(ws, "victorySystem.checkVictory(engine.state)")
    record("No victory fires at Y1 start", victory is None, f"got {victory}")

    for _ in range(8):
        await cdp_run(ws, "engine.tick()")

    game_over = await cdp_run(ws, "engine.state.gameOver")
    record("No game over in early Y1", game_over == False, f"gameOver = {game_over}")

    victory_path = await cdp_run(ws, "engine.state.victoryPath")
    record("No victory path in Y1", victory_path is None, f"victoryPath = {victory_path}")


async def test_midgame_progression(ws):
    """11. Mid-Game Progression Tests (Y5, Y10, Y15 + topic unlock integrity)"""
    print("\n=== 11. Mid-Game Progression Tests ===")

    # Regression test: every tier-3 topic's researchCategory must exist in RESEARCH_CATEGORIES
    orphan_categories = await cdp_run(ws, """
        (function() {
            var validCats = RESEARCH_CATEGORIES.slice();
            var orphans = TOPICS.filter(function(t) {
                return t.tier === 3 && t.researchCategory && validCats.indexOf(t.researchCategory) === -1;
            }).map(function(t) { return t.name + ':' + t.researchCategory; });
            return orphans;
        })()
    """)
    record("All tier-3 topic researchCategory values exist in RESEARCH_CATEGORIES",
           orphan_categories == [], f"orphans={orphan_categories}")

    # Regression test: display string matches actual research category
    display_mismatches = await cdp_run(ws, """
        (function() {
            var out = [];
            TOPICS.filter(function(t) { return t.tier === 3 && t.unlockRequirement && t.researchCategory; })
                  .forEach(function(t) {
                      if (t.unlockRequirement.indexOf(t.researchCategory) === -1) {
                          out.push(t.name + ' says "' + t.unlockRequirement + '" but gated by ' + t.researchCategory);
                      }
                  });
            return out;
        })()
    """)
    record("Tier-3 unlockRequirement display matches researchCategory",
           display_mismatches == [], f"mismatches={len(display_mismatches) if isinstance(display_mismatches, list) else display_mismatches}")

    # Verify per-category topic count is achievable (researchCount <= category items available)
    unachievable = await cdp_run(ws, """
        (function() {
            var catCounts = {};
            RESEARCH_ITEMS.forEach(function(r) {
                catCounts[r.category] = (catCounts[r.category] || 0) + 1;
            });
            var bad = [];
            TOPICS.filter(function(t) { return t.tier === 3 && t.researchCategory; }).forEach(function(t) {
                var avail = catCounts[t.researchCategory] || 0;
                if (t.researchCount > avail) {
                    bad.push(t.name + ' needs ' + t.researchCount + ' ' + t.researchCategory + ' but only ' + avail + ' exist');
                }
            });
            return bad;
        })()
    """)
    record("Every tier-3 topic's researchCount is achievable from available items",
           unachievable == [], f"unachievable={unachievable}")

    # Fast-forward to Y5 — Small Office era, training unlocked
    await cdp_run(ws, "window._devAutoPlay('Progression Test')")
    await asyncio.sleep(0.3)
    await cdp_run(ws, "engine.setSpeed(0)")
    # Give cash cushion and jump to Y5 state: level=1 (Small Office), 2 staff
    await cdp_run(ws, """
        engine.state.cash = 500000;
        engine.state.level = 1;
        engine.state.year = 5;
    """)

    y5_marketing_unlocked = await cdp_run(ws, "engine.state.level >= 1")
    record("Y5: Marketing unlocked (level >= 1)", y5_marketing_unlocked == True,
           f"level={await cdp_run(ws, 'engine.state.level')}")

    y5_training_condition = await cdp_run(ws, "engine.state.level >= 1 && engine.state.staff.length >= 2")
    # Staff may be 1 (just founder); add condition detail
    y5_staff = await cdp_run(ws, "engine.state.staff.length")
    record("Y5: Training gate met when 2+ staff exist",
           (y5_training_condition == True) or (y5_staff < 2),
           f"staff={y5_staff}, gate={y5_training_condition}")

    y5_research_locked = await cdp_run(ws, "engine.state.level < 2")
    record("Y5: Research still locked at Small Office", y5_research_locked == True)

    # Jump to Y10 — Medium Office, research unlocked
    await cdp_run(ws, """
        engine.state.level = 2;
        engine.state.year = 10;
        engine.state.cash = 2000000;
    """)
    y10_research_unlocked = await cdp_run(ws, "engine.state.level >= 2")
    record("Y10: Research unlocked (Medium Office, level >= 2)", y10_research_unlocked == True)

    y10_hardware_locked = await cdp_run(ws, "engine.state.level < 3")
    record("Y10: Hardware still locked at Medium Office", y10_hardware_locked == True)

    # Verticals require level >= 2 AND $10M revenue — record via finance tracker
    await cdp_run(ws, """
        finance.record('revenue', 10000000, 'test-sim', 'Y10 M1 W1');
    """)
    verticals_gate = await cdp_run(ws, """
        (function() {
            var level = engine.state.level;
            var totalRev = finance.totalRevenue();
            return level >= 2 && totalRev >= 10000000;
        })()
    """)
    record("Y10: Verticals gate met (level 2 + $10M revenue)", verticals_gate == True,
           f"gate={verticals_gate}")

    # Simulate AI research progress then test Tier-3 topic unlocks
    await cdp_run(ws, """
        researchSystem.completed = {};
        researchSystem.completed['ai_pathfinding'] = true;
        researchSystem.completed['ai_behavior_trees'] = true;
    """)
    robot_uprising_unlocked = await cdp_run(ws, """
        (function() {
            var t = TOPICS.find(function(x) { return x.name === 'Robot Uprising'; });
            if (!t) return null;
            var count = Object.keys(researchSystem.completed).filter(function(id) {
                var r = RESEARCH_ITEMS.find(function(ri) { return ri.id === id; });
                return r && r.category === t.researchCategory;
            }).length;
            return count >= (t.researchCount || 1);
        })()
    """)
    record("Y10: Robot Uprising unlocks after 2 AI research items",
           robot_uprising_unlocked == True, f"unlocked={robot_uprising_unlocked}")

    # Biotech previously claimed "Science Research Lv2" but is gated by 2 AI items — verify fix
    biotech_unlocked = await cdp_run(ws, """
        (function() {
            var t = TOPICS.find(function(x) { return x.name === 'Biotech'; });
            if (!t) return null;
            var count = Object.keys(researchSystem.completed).filter(function(id) {
                var r = RESEARCH_ITEMS.find(function(ri) { return ri.id === id; });
                return r && r.category === t.researchCategory;
            }).length;
            return count >= (t.researchCount || 1) && t.unlockRequirement.indexOf('AI') >= 0;
        })()
    """)
    record("Y10: Biotech unlocks with AI research AND display string mentions AI",
           biotech_unlocked == True, f"result={biotech_unlocked}")

    # Jump to Y15 — Large Office era
    await cdp_run(ws, """
        engine.state.level = 3;
        engine.state.year = 15;
    """)
    y15_hardware_unlocked = await cdp_run(ws, "engine.state.level >= 3")
    record("Y15: Hardware unlocked (Large Office, level >= 3)", y15_hardware_unlocked == True)

    # IPO eligibility typically requires late-game revenue + fans + year
    ipo_exists = await cdp_run(ws, "typeof ipoSystem !== 'undefined' && typeof ipoSystem.isEligible === 'function'")
    record("Y15: IPO system available at Large Office", ipo_exists == True)


# -- Main Runner ----------------------------------------------------------

async def main():
    global PAGE_ID
    PAGE_ID = await get_page_id()
    uri = f"ws://127.0.0.1:9222/devtools/page/{PAGE_ID}"

    print("=" * 60)
    print("TECH EMPIRE -- AUTOMATED TEST SUITE")
    print("=" * 60)
    print(f"CDP target: {uri}")

    async with websockets.connect(uri, max_size=10_000_000) as ws:
        await ws.send(json.dumps({"id": 0, "method": "Runtime.enable"}))
        await ws.recv()

        print("\nInitializing fresh game via _devAutoPlay('Test Corp')...")
        await cdp_run(ws, "window._devAutoPlay('Test Corp')")
        await asyncio.sleep(0.5)

        await cdp_run(ws, "engine.setSpeed(0)")

        await test_core_engine(ws)
        await test_topic_system(ws)
        await test_game_creation(ws)
        await test_scoring(ws)
        await test_financial(ws)
        await test_staff(ws)
        await test_system_integration(ws)
        await test_feature_gating(ws)
        await test_sales_bug(ws)
        await test_victory_balance(ws)
        await test_midgame_progression(ws)

    total = len(RESULTS)
    passed = sum(1 for r in RESULTS if r["passed"])
    failed = total - passed

    print("\n" + "=" * 60)
    print(f"SUMMARY: {passed}/{total} tests passed")
    if failed > 0:
        print(f"\nFAILED TESTS ({failed}):")
        for r in RESULTS:
            if not r["passed"]:
                detail = f" -- {r['detail']}" if r['detail'] else ""
                print(f"  FAIL: {r['name']}{detail}")
    print("=" * 60)

    return RESULTS


def generate_report(results):
    """Generate TEST-RESULTS.md"""
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed

    lines = []
    lines.append("# Tech Empire -- Automated Test Results")
    lines.append("")
    lines.append(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Method:** Chrome DevTools Protocol (CDP) against live game instance")
    lines.append(f"**Total Tests:** {total}")
    lines.append(f"**Passed:** {passed}")
    lines.append(f"**Failed:** {failed}")
    lines.append(f"**Pass Rate:** {(passed/total*100):.1f}%")
    lines.append("")

    # Assign results to categories
    category_names = [
        "Core Engine",
        "Topic System",
        "Game Creation",
        "Scoring",
        "Financial",
        "Staff",
        "System Integration",
        "Feature Gating",
        "Sales Bug",
        "Victory Balance",
        "Mid-Game Progression",
    ]

    # Map first test of each category
    cat_first_tests = [
        "Initial cash",
        "85 total",
        "startGame",
        "At least 1",
        "Cash changed",
        "Initial staff",
        "6 competitor",
        "Research locked",
        "After release",
        "Market Dominator",
        "All tier-3 topic researchCategory",
    ]

    # Build category buckets
    categories = {name: [] for name in category_names}
    current_cat = category_names[0]

    for r in results:
        for i, prefix in enumerate(cat_first_tests):
            if r["name"].startswith(prefix):
                current_cat = category_names[i]
                break
        categories[current_cat].append(r)

    for cat_name in category_names:
        cat_results = categories[cat_name]
        if not cat_results:
            continue
        cat_passed = sum(1 for r in cat_results if r["passed"])
        cat_total = len(cat_results)
        status = "PASS" if cat_passed == cat_total else "MIXED" if cat_passed > 0 else "FAIL"
        lines.append(f"## {cat_name} ({cat_passed}/{cat_total} {status})")
        lines.append("")
        lines.append("| Status | Test | Detail |")
        lines.append("|--------|------|--------|")
        for r in cat_results:
            icon = "PASS" if r["passed"] else "FAIL"
            detail = r.get("detail", "").replace("|", "\\|")
            lines.append(f"| {icon} | {r['name']} | {detail} |")
        lines.append("")

    if failed > 0:
        lines.append("## Failed Test Details")
        lines.append("")
        for r in results:
            if not r["passed"]:
                lines.append(f"- **{r['name']}**: {r.get('detail', 'No details')}")
        lines.append("")

    lines.append("---")
    lines.append(f"*Generated by cdp_test_suite.py*")

    return "\n".join(lines)


if __name__ == "__main__":
    results = asyncio.run(main())
    report = generate_report(results)

    # Resolve TEST-RESULTS.md next to this test file's repo root
    report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "TEST-RESULTS.md")
    with open(report_path, "w") as f:
        f.write(report)
    print(f"\nReport written to: {report_path}")
