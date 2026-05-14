import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { 
  configProfiles, 
  configComponents, 
  configOptions, 
  configAssignments,
  configPriceRules,
  configLogicRules,
  configSnapshots,
  configAuditLogs
} from "./config.schema.js";
import { db } from "../../config/database.js";

const configRepository = {
  // --- Profile Management (The Blueprint) ---
  
  async findAll() {
    return await db.select()
      .from(configProfiles)
      .orderBy(desc(configProfiles.createdAt));
  },

  async findById(id) {
    const profile = await db.select().from(configProfiles).where(eq(configProfiles.id, id)).limit(1);
    if (profile.length === 0) return null;

    const components = await db.select()
      .from(configComponents)
      .where(eq(configComponents.profileId, id))
      .orderBy(configComponents.sortOrder);
      
    const componentIds = components.map(c => c.id);

    let options = [];
    if (componentIds.length > 0) {
      options = await db.select()
        .from(configOptions)
        .where(inArray(configOptions.componentId, componentIds))
        .orderBy(configOptions.sortOrder);
    }

    const logicRules = await db.select()
      .from(configLogicRules)
      .where(eq(configLogicRules.profileId, id))
      .orderBy(configLogicRules.priority);

    // Nest options into components
    const componentsWithChoices = components.map(c => ({
      ...c,
      options: options.filter(o => o.componentId === c.id)
    }));

    return {
      ...profile[0],
      components: componentsWithChoices,
      logicRules
    };
  },

  async create(userId, data) {
    return await db.transaction(async (tx) => {
      // 1. Create Profile Blueprint
      const [profile] = await tx.insert(configProfiles).values({
        createdBy: userId,
        name: data.name,
        description: data.description,
        internalCode: data.internalCode,
        uiConfig: data.uiConfig || {},
        status: "DRAFT"
      }).returning();

      // 2. Create Components & Options
      if (data.components?.length > 0) {
        for (const comp of data.components) {
          const [newComp] = await tx.insert(configComponents).values({
            profileId: profile.id,
            name: comp.name,
            internalCode: comp.internalCode,
            type: comp.type,
            isRequired: comp.isRequired || false,
            validationDsl: comp.validationDsl || {},
            uiMetadata: comp.uiMetadata || {},
            sortOrder: comp.sortOrder || 0
          }).returning();

          if (comp.options?.length > 0) {
            await tx.insert(configOptions).values(
              comp.options.map(opt => ({
                componentId: newComp.id,
                name: opt.name,
                internalCode: opt.internalCode,
                description: opt.description,
                isDefault: opt.isDefault || false,
                sortOrder: opt.sortOrder || 0,
                uiMetadata: opt.uiMetadata || {}
              }))
            );
          }
        }
      }

      // 3. Create Structural Logic Rules
      if (data.logicRules?.length > 0) {
        await tx.insert(configLogicRules).values(
          data.logicRules.map(rule => ({
            profileId: profile.id,
            name: rule.name,
            conditionDsl: rule.conditionDsl,
            action: rule.action,
            targetType: rule.targetType,
            targetId: rule.targetId,
            actionConfig: rule.actionConfig || {},
            priority: rule.priority || 0
          }))
        );
      }

      return profile;
    });
  },

  async update(id, data) {
    return await db.transaction(async (tx) => {
      // 1. Update Profile Metadata
      const [profile] = await tx.update(configProfiles)
        .set({
          name: data.name,
          description: data.description,
          internalCode: data.internalCode,
          uiConfig: data.uiConfig || {},
          status: data.status || "DRAFT",
          updatedAt: new Date()
        })
        .where(eq(configProfiles.id, id))
        .returning();

      return profile;
    });
  },

  async delete(id) {
    return await db.transaction(async (tx) => {
      // 1. Delete price rules (depend on profile + options)
      await tx.delete(configPriceRules).where(eq(configPriceRules.profileId, id));

      // 2. Delete logic rules (depend on profile)
      await tx.delete(configLogicRules).where(eq(configLogicRules.profileId, id));

      // 3. Delete assignments (depend on profile)
      await tx.delete(configAssignments).where(eq(configAssignments.profileId, id));

      // 4. Delete options (depend on components which depend on profile)
      const components = await tx.select({ id: configComponents.id })
        .from(configComponents)
        .where(eq(configComponents.profileId, id));

      if (components.length > 0) {
        const componentIds = components.map(c => c.id);
        for (const compId of componentIds) {
          await tx.delete(configOptions).where(eq(configOptions.componentId, compId));
        }
      }

      // 5. Delete components
      await tx.delete(configComponents).where(eq(configComponents.profileId, id));

      // 6. Finally delete the profile itself
      return await tx.delete(configProfiles).where(eq(configProfiles.id, id));
    });
  },

  // --- Assignments ---

  async getAssignments(profileId) {
    let query = db.select().from(configAssignments);
    if (profileId) {
      query = query.where(eq(configAssignments.profileId, profileId));
    }
    return await query.orderBy(desc(configAssignments.createdAt));
  },

  async deleteAssignment(id) {
    return await db.delete(configAssignments).where(eq(configAssignments.id, id));
  },

  // --- Pricing Engine (The Contextual Overlay) ---

  async assignProfile(data) {
    return await db.insert(configAssignments).values({
      profileId: data.profileId,
      targetType: data.targetType, // 'PRODUCT', 'CATEGORY'
      targetId: data.targetId,
      priority: data.priority || 0,
      contextConfig: data.contextConfig || {}
    }).returning();
  },

  async setPriceRules(profileId, rules) {
    return await db.transaction(async (tx) => {
      await tx.delete(configPriceRules).where(eq(configPriceRules.profileId, profileId));
      
      if (rules.length > 0) {
        return await tx.insert(configPriceRules).values(
          rules.map(rule => ({
            profileId,
            name: rule.name,
            strategy: rule.strategy,
            targetType: rule.targetType, // 'COMPONENT', 'OPTION'
            targetId: rule.targetId,
            amount: rule.amount,
            strategyData: rule.strategyData || {},
            priority: rule.priority || 0
          }))
        ).returning();
      }
      return [];
    });
  },

  // --- Snapshot Engine (Immutability) ---

  async createSnapshot(ownerType, ownerId, profileId, fullState, totalAdjustment) {
    const profile = await this.findById(profileId);
    
    return await db.insert(configSnapshots).values({
      ownerType, // 'ORDER', 'CART'
      ownerId,
      profileId,
      profileVersion: profile?.versionNumber || 1,
      fullState, // Deep JSONB snapshot of everything
      totalAdjustment
    }).returning();
  },

  // --- Audit & History ---

  async logAudit(userId, entityType, entityId, action, oldValue, newValue) {
    return await db.insert(configAuditLogs).values({
      userId,
      entityType,
      entityId,
      action,
      oldValue,
      newValue
    });
  }
};

export default configRepository;
