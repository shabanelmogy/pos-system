/**
 * Frontend PricingEngine
 * Handles real-time price calculation for the Product Configurator UI.
 */
export class PricingEngine {
  static calculate(context: { basePrice: number; selections: any[]; priceRules: any[] }) {
    const { basePrice, selections, priceRules } = context;
    let adjustmentTotal = 0;
    const detailLines: { ruleId: string; targetId: string; amount: number; strategy: string }[] = [];

    const ruleMap = this.mapRules(priceRules || []);

    selections.forEach(sel => {
      const activeRules = [
        ...(ruleMap[`OPTION:${sel.optionId}`] || []),
        ...(ruleMap[`COMPONENT:${sel.componentId}`] || [])
      ].sort((a, b) => b.priority - a.priority);

      activeRules.forEach(rule => {
        const amt = this.resolveAmount(rule, { ...context, selection: sel });
        adjustmentTotal += amt;
        detailLines.push({ ruleId: rule.id, targetId: rule.targetId, amount: amt, strategy: rule.strategy });
      });
    });

    const globalRules = ruleMap['GLOBAL'] || [];
    globalRules.forEach(rule => {
      const amt = this.resolveAmount(rule, context);
      adjustmentTotal += amt;
      detailLines.push({ ruleId: rule.id, targetId: 'GLOBAL', amount: amt, strategy: rule.strategy });
    });

    return {
      basePrice: basePrice,
      totalAdjustment: parseFloat(adjustmentTotal.toFixed(2)),
      finalPrice: parseFloat((basePrice + adjustmentTotal).toFixed(2)),
      details: detailLines
    };
  }

  static mapRules(rules: any[]) {
    const map: Record<string, any[]> = {};
    rules.forEach(r => {
      const key = r.targetType === 'GLOBAL' ? 'GLOBAL' : `${r.targetType}:${r.targetId}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }

  static resolveAmount(rule: any, ctx: any) {
    const amount = parseFloat(rule.amount);
    const qty = ctx.selection?.quantity || 1;

    switch (rule.strategy) {
      case 'FIXED': return amount * qty;
      case 'PERCENTAGE': return (ctx.basePrice * (amount / 100)) * qty;
      case 'TIERED': return this.calculateTiered(rule.strategyData?.tiers, qty);
      default: return 0;
    }
  }

  static calculateTiered(tiers: any[], qty: number) {
    if (!tiers) return 0;
    let total = 0;
    let rem = qty;
    tiers.sort((a: any, b: any) => a.min - b.min).forEach((t: any) => {
      if (rem <= 0) return;
      const c = t.max ? Math.min(rem, t.max - t.min + 1) : rem;
      total += c * parseFloat(t.price);
      rem -= c;
    });
    return total;
  }
}
