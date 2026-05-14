/**
 * ProfileResolutionService
 * Resolves the appropriate configuration profiles for a given entity context.
 */
export class ProfileResolutionService {
  /**
   * Finds all applicable profiles for a specific target.
   * Logic: Specific Product -> Category -> Brand -> Global Default
   * @param {Object} context - { productId, categoryId, brandId, vendorId, channel }
   * @param {Array} assignments - List of all assignments from DB
   */
  static resolve(context, assignments) {
    const { productId, categoryId, brandId, vendorId } = context;
    const resolved = [];

    // 1. Check Product-specific assignments
    const productAssignments = assignments.filter(a => a.targetType === 'PRODUCT' && a.targetId === productId);
    resolved.push(...productAssignments);

    // 2. Check Category-level assignments (Inheritance)
    const categoryAssignments = assignments.filter(a => a.targetType === 'CATEGORY' && a.targetId === categoryId);
    resolved.push(...categoryAssignments);

    // 3. Check Brand-level assignments
    const brandAssignments = assignments.filter(a => a.targetType === 'BRAND' && a.targetId === brandId);
    resolved.push(...brandAssignments);

    // 4. Check Vendor-level assignments
    const vendorAssignments = assignments.filter(a => a.targetType === 'VENDOR' && a.targetId === vendorId);
    resolved.push(...vendorAssignments);

    // Deduplicate and Sort (Higher specificity wins if profile IDs conflict)
    // In a real system, we might merge profiles or choose the most specific one.
    return resolved;
  }
}
