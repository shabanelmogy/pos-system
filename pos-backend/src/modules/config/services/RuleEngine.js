/**
 * FINAL Enterprise RuleEngine
 * Evaluates the Platform DSL to drive dynamic UI and business logic.
 */
export class RuleEngine {
  /**
   * Resolves active state and triggers for a configuration session.
   * @param {Array} rules - Active logic rules.
   * @param {Object} session - { selections: {}, metadata: {}, user: {} }
   */
  static resolve(rules, session) {
    const registry = {
      hidden: new Set(),
      disabled: new Set(),
      required: new Set(),
      values: new Map(),
      triggers: []
    };

    // Sort by priority (higher priority evaluates later to override)
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);

    sorted.forEach(rule => {
      if (!rule.isActive) return;

      if (this.evaluate(rule.conditionDsl, session)) {
        this.apply(rule, registry);
      }
    });

    return {
      hidden: Array.from(registry.hidden),
      disabled: Array.from(registry.disabled),
      required: Array.from(registry.required),
      overrides: Object.fromEntries(registry.values),
      triggers: registry.triggers
    };
  }

  /**
   * Recursive DSL Evaluator
   */
  static evaluate(node, session) {
    if (!node) return true;

    // Logic Nodes
    if (node.logic === 'AND') return node.conditions.every(c => this.evaluate(c, session));
    if (node.logic === 'OR') return node.conditions.some(c => this.evaluate(c, session));
    if (node.logic === 'NOT') return !this.evaluate(node.condition, session);

    // Fact Nodes (Leafs)
    const { fact, path, operator, value } = node;
    const actualValue = this.extractFact(fact, path, session);

    return this.compare(actualValue, operator, value);
  }

  static extractFact(fact, path, session) {
    switch (fact) {
      case 'selection': 
        // path is $.componentId or $.componentInternalCode
        const id = path.replace('$.', '');
        return session.selections[id]?.value;
      case 'quantity': 
        return session.quantity || 1;
      case 'user':
        return session.user?.[path.replace('$.', '')];
      default: 
        return null;
    }
  }

  static compare(actual, op, expected) {
    switch (op) {
      case 'EQ': return actual === expected;
      case 'NEQ': return actual !== expected;
      case 'GT': return actual > expected;
      case 'LT': return actual < expected;
      case 'IN': return Array.isArray(expected) && expected.includes(actual);
      case 'EXISTS': return actual !== undefined && actual !== null;
      default: return false;
    }
  }

  static apply(rule, registry) {
    const { action, targetId, targetType, actionConfig } = rule;
    
    switch (action) {
      case 'HIDE': registry.hidden.add(targetId); break;
      case 'SHOW': registry.hidden.delete(targetId); break;
      case 'DISABLE': registry.disabled.add(targetId); break;
      case 'ENABLE': registry.disabled.delete(targetId); break;
      case 'REQUIRE': registry.required.add(targetId); break;
      case 'SET_VALUE': registry.values.set(targetId, actionConfig.value); break;
      case 'APPLY_PRICE_RULE':
      case 'TRIGGER_INVENTORY_RULE':
      case 'VALIDATION_ERROR':
        registry.triggers.push({ type: action, targetId, config: actionConfig });
        break;
    }
  }
}
