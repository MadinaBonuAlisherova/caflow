import type { VendorType } from '@/lib/types';

export type BrowseThemeKey = VendorType | 'ALL';

export interface BrowseTheme {
  key: BrowseThemeKey;
  label: string;
  title: string;
  subtitle: string;
  singular: string;
  plural: string;
  /** Hero gradient for search page header */
  heroGradient: string;
  heroGlow: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  activeTab: string;
  inactiveTab: string;
  cardTint: string;
  iconBg: string;
  exploreDesc: string;
}

export const BROWSE_THEMES: Record<BrowseThemeKey, BrowseTheme> = {
  ALL: {
    key: 'ALL',
    label: 'All catering',
    title: 'Catering partners',
    subtitle: 'Restaurants, caterers, and private chefs — one marketplace.',
    singular: 'partner',
    plural: 'partners',
    heroGradient: 'from-gold-50/90 via-white to-cream',
    heroGlow: 'radial-gradient(ellipse at 30% 0%, rgba(242,183,5,0.18), transparent 55%)',
    accentText: 'text-gold-700',
    accentBg: 'bg-gold-100',
    accentBorder: 'border-gold/40',
    activeTab: 'border-ink bg-ink text-white shadow-sm',
    inactiveTab: 'border-line bg-white text-muted hover:border-gold/40 hover:text-ink',
    cardTint: 'from-gold-50/80 to-white',
    iconBg: 'bg-gold-100 text-gold-700',
    exploreDesc: 'Every vetted partner type in one place',
  },
  RESTAURANT: {
    key: 'RESTAURANT',
    label: 'Restaurants',
    title: 'Restaurant catering',
    subtitle: 'Full-service menus, delivery, and event packages from top kitchens.',
    singular: 'restaurant',
    plural: 'restaurants',
    heroGradient: 'from-honey-50/95 via-peach/20 to-cream',
    heroGlow: 'radial-gradient(ellipse at 20% 0%, rgba(245,185,66,0.24), transparent 50%)',
    accentText: 'text-gold-700',
    accentBg: 'bg-gold-100',
    accentBorder: 'border-gold/45',
    activeTab: 'border-gold-600 bg-gold text-ink shadow-sm',
    inactiveTab: 'border-line bg-white text-muted hover:border-gold/40 hover:text-ink',
    cardTint: 'from-gold-50/90 to-white',
    iconBg: 'bg-gold-100 text-gold-700',
    exploreDesc: 'Scaled menus for groups of any size',
  },
  CATERER: {
    key: 'CATERER',
    label: 'Caterers',
    title: 'Event caterers',
    subtitle: 'Buffets, banquets, drop-off trays, and on-site service for your event.',
    singular: 'caterer',
    plural: 'caterers',
    heroGradient: 'from-basil-50/95 via-honey-50/30 to-cream',
    heroGlow: 'radial-gradient(ellipse at 25% 0%, rgba(95,138,84,0.16), transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(245,185,66,0.12), transparent 40%)',
    accentText: 'text-sage',
    accentBg: 'bg-sage-50',
    accentBorder: 'border-sage/30',
    activeTab: 'border-sage bg-sage text-white shadow-sm',
    inactiveTab: 'border-line bg-white text-muted hover:border-sage/40 hover:text-ink',
    cardTint: 'from-sage-50/90 to-white',
    iconBg: 'bg-sage-50 text-sage',
    exploreDesc: 'From office lunches to large-format events',
  },
  CHEF: {
    key: 'CHEF',
    label: 'Private chefs',
    title: 'Private chefs',
    subtitle: 'On-site cooking, intimate dining, and bespoke menus crafted for your table.',
    singular: 'chef',
    plural: 'chefs',
    heroGradient: 'from-plum-50/90 via-peach/25 to-cream',
    heroGlow: 'radial-gradient(ellipse at 25% 0%, rgba(122,62,95,0.12), transparent 50%), radial-gradient(ellipse at 75% 0%, rgba(232,133,58,0.1), transparent 45%)',
    accentText: 'text-plum',
    accentBg: 'bg-plum-50',
    accentBorder: 'border-plum/25',
    activeTab: 'border-plum bg-plum text-white shadow-sm',
    inactiveTab: 'border-line bg-white text-muted hover:border-plum/30 hover:text-ink',
    cardTint: 'from-plum-50/85 to-white',
    iconBg: 'bg-plum-50 text-plum',
    exploreDesc: 'Personal chefs for homes, venues, and celebrations',
  },
};

export function getBrowseTheme(vendorType?: VendorType | null): BrowseTheme {
  return BROWSE_THEMES[vendorType ?? 'ALL'];
}
