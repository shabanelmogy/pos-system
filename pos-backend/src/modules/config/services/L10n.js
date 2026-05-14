/**
 * Localization Utility
 * Simplifies accessing translated content from the configuration schema.
 */
export class L10n {
  /**
   * Retrieves the translated string for a given locale.
   * @param {Object} field - The JSONB field from DB (e.g., { "en": "Name", "ar": "الاسم" })
   * @param {string} locale - Target locale (e.g., 'en', 'ar')
   * @param {string} fallback - Fallback locale
   */
  static t(field, locale = 'en', fallback = 'en') {
    if (!field) return '';
    if (typeof field === 'string') return field;
    
    return field[locale] || field[fallback] || Object.values(field)[0] || '';
  }

  /**
   * Deeply translates a whole configuration profile for a specific locale.
   */
  static translateProfile(profile, locale) {
    return {
      ...profile,
      name: this.t(profile.name, locale),
      description: this.t(profile.description, locale),
      components: profile.components.map(c => ({
        ...c,
        name: this.t(c.name, locale),
        options: c.options?.map(o => ({
          ...o,
          name: this.t(o.name, locale),
          description: this.t(o.description, locale)
        }))
      }))
    };
  }
}
