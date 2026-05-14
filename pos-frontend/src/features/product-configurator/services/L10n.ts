import { ConfigProfile, ConfigComponent, ConfigOption } from '../types';

/**
 * Frontend L10n Utility
 * Safely handles localized content in the UI.
 */
export class L10n {
  static t(field: any, locale: string = 'en', fallback: string = 'en'): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    
    return field[locale] || field[fallback] || Object.values(field)[0] || '';
  }

  static translateProfile(profile: ConfigProfile, locale: string): any {
    if (!profile) return null;
    return {
      ...profile,
      name: this.t(profile.name, locale),
      description: this.t(profile.description, locale),
      components: (profile.components || []).map((c: ConfigComponent) => ({
        ...c,
        name: this.t(c.name, locale),
        options: (c.options || []).map((o: ConfigOption) => ({
          ...o,
          name: this.t(o.name, locale),
          description: this.t(o.description, locale)
        }))
      }))
    };
  }
}
