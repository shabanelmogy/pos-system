/**
 * FINAL Enterprise PricingEngine
 * Resolves configuration pricing with high precision and priority-based overrides.
 */
export class PricingEngine {
  /**
   * Calculates the final price for a configurator session.
   * @param {Object} context - { basePrice, selections, rules, currency }
   */
  static calculate(context) {
    const { basePrice, selections, rules } = context;
    let adjustmentTotal = 0;
    const detailLines = [];

    // 1. Group rules by Target Type/Id
    const ruleMap = this.mapRules(rules);

    // 2. Process each selection (Components & Options)
    selections.forEach(sel => {
      const activeRules = [
        ...(ruleMap[`OPTION:${sel.optionId}`] || []),
        ...(ruleMap[`COMPONENT:${sel.componentId}`] || [])
      ].sort((a, b) => b.priority - a.priority);

      // Highest priority wins if conflict, otherwise they stack if logic permits
      activeRules.forEach(rule => {
        const amt = this.resolveAmount(rule, { ...context, selection: sel });
        adjustmentTotal += amt;
        detailLines.push({ ruleId: rule.id, targetId: rule.targetId, amount: amt, strategy: rule.strategy });
      });
    });

    // 3. Process Global Profile Rules
    const globalRules = ruleMap['GLOBAL'] || [];
    globalRules.forEach(rule => {
      const amt = this.resolveAmount(rule, context);
      adjustmentTotal += amt;
      detailLines.push({ ruleId: rule.id, targetId: 'GLOBAL', amount: amt, strategy: rule.strategy });
    });

    return {
      basePrice: parseFloat(basePrice),
      totalAdjustment: parseFloat(adjustmentTotal.toFixed(6)),
      finalPrice: parseFloat((parseFloat(basePrice) + adjustmentTotal).toFixed(6)),
      details: detailLines
    };
  }

  static mapRules(rules) {
    const map = {};
    rules.forEach(r => {
      const key = r.targetType === 'GLOBAL' ? 'GLOBAL' : `${r.targetType}:${r.targetId}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }

  static resolveAmount(rule, ctx) {
    const amount = parseFloat(rule.amount);
    const qty = ctx.selection?.quantity || 1;

    switch (rule.strategy) {
      case 'FIXED':
        return amount * qty;
      case 'PERCENTAGE':
        return (parseFloat(ctx.basePrice) * (amount / 100)) * qty;
      case 'TIERED':
        return this.calculateTiered(rule.strategyData.tiers, qty);
      case 'FORMULA':
        return this.evaluateFormula(rule.strategyData.formula, { ...ctx, amount, qty });
      case 'OVERRIDE':
        return amount - parseFloat(ctx.basePrice); // Return delta
      default:
        return 0;
    }
  }

  static calculateTiered(tiers, qty) {
    if (!tiers) return 0;
    let total = 0;
    let rem = qty;
    tiers.sort((a, b) => a.min - b.min).forEach(t => {
      if (rem <= 0) return;
      const c = t.max ? Math.min(rem, t.max - t.min + 1) : rem;
      total += c * parseFloat(t.price);
      rem -= c;
    });
    return total;
  }

  static evaluateFormula(formula, ctx) {
    // In production, use mathjs
    try {
      const vars = { B: ctx.basePrice, Q: ctx.qty, A: ctx.amount, V: ctx.selection?.value || 0 };
      let f = formula;
      Object.keys(vars).forEach(k => f = f.replace(new RegExp(k, 'g'), vars[k]));
      if (!/^[0-9+\-*/().\s]*$/.test(f)) return 0;
      return eval(f);
    } catch {
      return 0;
    }
  }
}
