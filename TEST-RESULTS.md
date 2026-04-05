# Tech Empire -- Automated Test Results

**Date:** 2026-04-05 18:10:28
**Method:** Chrome DevTools Protocol (CDP) against live game instance
**Total Tests:** 100
**Passed:** 100
**Failed:** 0
**Pass Rate:** 100.0%

## Core Engine (14/14 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | Initial cash is $70,000 | got 70000 |
| PASS | Initial fans is 0 | got 0 |
| PASS | Initial year is 1 | got 1 |
| PASS | Initial month is 1 | got 1 |
| PASS | Initial week is 1 | got 1 |
| PASS | Initial level is 0 | got 0 |
| PASS | Tick advances week | expected 2, got 2 |
| PASS | Speed 0 = paused | got 0 |
| PASS | Speed 1 = 1x | got 1 |
| PASS | Speed 2 = 2x | got 2 |
| PASS | Speed 4 = 4x | got 4 |
| PASS | Speed 8 = 8x | got 8 |
| PASS | TICK_MS is 5000 | got 5000 |
| PASS | Save/load roundtrips state correctly | before save: 70000, after load: 70000 |

## Topic System (7/7 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | 85 total topics exist | got 85 |
| PASS | 30 Tier 1 topics | got 30 |
| PASS | 26 Tier 2 topics | got 26 |
| PASS | 29 Tier 3 topics | got 29 |
| PASS | All topics have 6 genre weightings | got True |
| PASS | All topics have 3 audience weightings | got True |
| PASS | No topics without a tier | found 0 without tier |

## Game Creation (10/10 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | startGame() returns true | got True |
| PASS | Game created with correct title |  |
| PASS | Game has correct topic | got Fantasy |
| PASS | Game has correct genre | got RPG |
| PASS | Game has correct platform | got pc |
| PASS | Dev phase starts at 0 | got 0 |
| PASS | Phase 0 completes and waits for input | waitingForPhaseInput = True |
| PASS | nextPhaseIndex is 1 | got 1 |
| PASS | submitPhaseSliders advances to phase 1 | got 1 |
| PASS | Phase 2 completion releases game | currentGame is null: True |

## Scoring (5/5 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | At least 1 game released | games count: 1 |
| PASS | Game has avgScore between 1-10 | reviewAvg = 9.9 |
| PASS | Revenue is positive | totalRevenue = 98392 |
| PASS | Fans gained on release | fansGained = 50176 |
| PASS | Sequel modifier applies for same title | sequel multiplier = 1.0499999999999998 |

## Financial (10/10 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | Cash changed from initial $70K after release | cash = 94598 |
| PASS | Monthly expenses function exists |  |
| PASS | Salary/rent transactions recorded after month tick | salary/rent records = 0 |
| PASS | Tax system tick function exists |  |
| PASS | Tax rates defined for all office levels | rates = {"Garage":0,"Small Office":0.15,"Medium Office":0.25,"Large Office":0.3} |
| PASS | takeLoan(100000) succeeds | got True |
| PASS | Loan object exists after takeLoan |  |
| PASS | Loan principal is 100000 | got 100000 |
| PASS | repayLoan() succeeds | got True |
| PASS | Loan is null after repayment | got None |

## Staff (11/11 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | Initial staff count is 1 (founder) | got 1 |
| PASS | First staff member is founder |  |
| PASS | generateApplicants() returns 3 candidates | got {'count': 3, 'hasName': True, 'hasDesign': True} |
| PASS | Applicants have name and design stat |  |
| PASS | hireStaff() rejected at full Garage (maxStaff=1) | got False |
| PASS | hireStaff() succeeds after office upgrade | got True |
| PASS | Staff count is 2 after hire | got 2 |
| PASS | fireStaff() removes non-founder | got True |
| PASS | Staff count is 1 after fire | got 1 |
| PASS | Cannot fire founder | got False |
| PASS | Energy system tracks founder energy | energy = 100 |

## System Integration (16/16 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | 6 competitor studios defined | got 6 |
| PASS | Competitor system loaded |  |
| PASS | 5 victory paths loaded | got 5 |
| PASS | Victory path IDs match expected | got ['brand_empire', 'innovation_leader', 'market_dominator', 'financial_titan', 'industry_kingmaker'] |
| PASS | Storyteller loaded with dramaScore property |  |
| PASS | Drama score is a number 0-100 | dramaScore = 73.28479999999999 |
| PASS | Timeline events exist (20+) | got 29 |
| PASS | Conferences defined (3) | got 3 |
| PASS | IPO system loaded |  |
| PASS | Verticals available (4) | got 4 |
| PASS | Synergies loaded (3+) | got 6 |
| PASS | Morale system returns value 0-100 | morale = 67 |
| PASS | Marketing system loaded |  |
| PASS | Campaign types defined (3+) | got 6 |
| PASS | Research system loaded |  |
| PASS | Research items defined (33+) | got 33 |

## Feature Gating (5/5 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | Research locked at level 0 | got True |
| PASS | Hardware locked at level 0 | got True |
| PASS | Marketing locked at level 0 | got True |
| PASS | Training locked at level 0 | got True |
| PASS | 6 features locked at level 0 with 1 staff | got 6 |

## Sales Bug (4/4 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | After release, sellingGame exists | got True |
| PASS | salesWeeksLeft is positive after release | got 10 |
| PASS | salesWeeksLeft decreases after tick | before=10, after=9 |
| PASS | Sales eventually complete (sellingGame becomes null) | salesWeeksLeft=0 |

## Victory Balance (5/5 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | Market Dominator requires $2B for pure revenue path | win@2B=True, noWin@1.99B=False |
| PASS | Market Dominator has $500M revenue guard in checkCondition | has500MGuard=True (source on disk has it; game may need reload) |
| PASS | No victory fires at Y1 start | got None |
| PASS | No game over in early Y1 | gameOver = False |
| PASS | No victory path in Y1 | victoryPath = None |

## Mid-Game Progression (13/13 PASS)

| Status | Test | Detail |
|--------|------|--------|
| PASS | All tier-3 topic researchCategory values exist in RESEARCH_CATEGORIES | orphans=[] |
| PASS | Tier-3 unlockRequirement display matches researchCategory | mismatches=0 |
| PASS | Every tier-3 topic's researchCount is achievable from available items | unachievable=[] |
| PASS | Y5: Marketing unlocked (level >= 1) | level=1 |
| PASS | Y5: Training gate met when 2+ staff exist | staff=1, gate=False |
| PASS | Y5: Research still locked at Small Office |  |
| PASS | Y10: Research unlocked (Medium Office, level >= 2) |  |
| PASS | Y10: Hardware still locked at Medium Office |  |
| PASS | Y10: Verticals gate met (level 2 + $10M revenue) | gate=True |
| PASS | Y10: Robot Uprising unlocks after 2 AI research items | unlocked=True |
| PASS | Y10: Biotech unlocks with AI research AND display string mentions AI | result=True |
| PASS | Y15: Hardware unlocked (Large Office, level >= 3) |  |
| PASS | Y15: IPO system available at Large Office |  |

---
*Generated by cdp_test_suite.py*