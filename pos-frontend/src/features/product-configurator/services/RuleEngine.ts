/**
 * Frontend RuleEngine
 * Evaluates the Configuration DSL to drive real-time UI behavior.
 */
export class RuleEngine {
  static resolve(rules: any[], selectionsMap: Record<string, any>) {
    const registry = {
      hidden: new Set<string>(),
      disabled: new Set<string>(),
      required: new Set<string>(),
      values: new Map<string, any>(),
      triggers: [] as any[]
    };

    const sorted = [...(rules || [])].sort((a, b) => a.priority - b.priority);

    // Prepare session state for evaluation
    const session = { selections: selectionsMap };

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

  static evaluate(node: any, session: any): boolean {
    if (!node) return true;

    if (node.logic === 'AND') return node.conditions.every((c: any) => this.evaluate(c, session));
    if (node.logic === 'OR') return node.conditions.some((c: any) => this.evaluate(c, session));
    if (node.logic === 'NOT') return !this.evaluate(node.condition, session);

    const { fact, path, operator, value } = node;
    const actualValue = this.extractFact(fact, path, session);

    return this.compare(actualValue, operator, value);
  }

  static extractFact(fact: string, path: string, session: any) {
    if (fact === 'selection') {
      const id = path.replace('$.', '');
      return session.selections[id]?.value;
    }
    return null;
  }

  static compare(actual: any, op: string, expected: any) {
    switch (op) {
      case 'EQ': return actual === expected;
      case 'NEQ': return actual !== expected;
      case 'IN': return Array.isArray(expected) && expected.includes(actual);
      case 'EXISTS': return actual !== undefined && actual !== null;
      default: return false;
    }
  }

  static apply(rule: any, registry: any) {
    const { action, targetId, actionConfig } = rule;
    
    switch (action) {
      case 'HIDE': registry.hidden.add(targetId); break;
      case 'SHOW': registry.hidden.delete(targetId); break;
      case 'DISABLE': registry.disabled.add(targetId); break;
      case 'ENABLE': registry.disabled.delete(targetId); break;
      case 'REQUIRE': registry.required.add(targetId); break;
      case 'SET_VALUE': registry.values.set(targetId, actionConfig?.value); break;
      default: break;
    }
  }
}
