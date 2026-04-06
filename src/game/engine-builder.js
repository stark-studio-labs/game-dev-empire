/**
 * Tech Empire — Custom Game Engine Builder
 * Players compose engines from researched components. Better engines = better games.
 */
class EngineBuilderSystem {
  constructor() {
    this.engines = [];
    this.nextId = 1;
  }

  reset() {
    this.engines = [];
    this.nextId = 1;
  }

  /**
   * Create a new engine from completed research components.
   * Returns the engine object or null if invalid.
   */
  createEngine(name, componentIds) {
    if (!name || !componentIds || componentIds.length === 0) return null;

    // Validate all components are completed research items
    const components = componentIds.filter(id =>
      typeof researchSystem !== 'undefined' &&
      researchSystem.completed &&
      researchSystem.completed[id]
    );
    if (components.length === 0) return null;

    const techLevel = this._calcTechLevel(components);

    const engine = {
      id: this.nextId++,
      name: name,
      components: components,
      techLevel: techLevel,
      createdWeek: 0, // set by caller
    };
    this.engines.push(engine);
    return engine;
  }

  /**
   * Calculate average tech level from component research items.
   */
  _calcTechLevel(componentIds) {
    if (!componentIds.length) return 0;
    let total = 0;
    for (const id of componentIds) {
      const item = (typeof RESEARCH_ITEMS !== 'undefined')
        ? RESEARCH_ITEMS.find(r => r.id === id)
        : null;
      total += item ? item.techLevel : 0;
    }
    return Math.round(total / componentIds.length);
  }

  /** Get all engines. */
  getEngines() {
    return this.engines;
  }

  /** Get a single engine by id. */
  getEngine(id) {
    return this.engines.find(e => e.id === id);
  }

  /**
   * Get the quality multiplier for an engine.
   * 2% bonus per tech level (e.g. tech level 5 = 1.10x).
   */
  getEngineBonus(engineId) {
    const engine = this.getEngine(engineId);
    if (!engine) return 1.0;
    return 1 + (engine.techLevel * 0.02);
  }

  /**
   * Get components available to add to a new engine.
   * Returns completed research items not already used in any engine.
   */
  getAvailableComponents() {
    if (typeof researchSystem === 'undefined' || !researchSystem.completed) return [];
    const used = new Set(this.engines.flatMap(e => e.components));
    return Object.keys(researchSystem.completed)
      .filter(id => !used.has(id))
      .map(id => {
        const item = (typeof RESEARCH_ITEMS !== 'undefined')
          ? RESEARCH_ITEMS.find(r => r.id === id)
          : null;
        return item
          ? { id: item.id, name: item.name, category: item.category, techLevel: item.techLevel }
          : null;
      })
      .filter(Boolean);
  }

  serialize() {
    return {
      engines: this.engines.map(e => ({ ...e })),
      nextId: this.nextId,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.engines = data.engines || [];
    this.nextId = data.nextId || 1;
  }
}

const engineBuilderSystem = new EngineBuilderSystem();
