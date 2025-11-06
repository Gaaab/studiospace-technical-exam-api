export const SERVICE_CATEGORIES = [
  'Advertising, Brand & Creative',
  'Media',
  // People
  // 'Digital Marketing'
] as const;

export const TARGET_REGIONS = ['AU', 'GB', 'US'] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number] | 'Other';
export type TargetRegion = (typeof TARGET_REGIONS)[number];
export type Region = TargetRegion | 'Other';
