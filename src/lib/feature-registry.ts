/**
 * Feature Registry — Central definition of all LMS modules.
 *
 * To add a new feature:
 *  1. Add its definition to FEATURE_REGISTRY below
 *  2. Add its nav-item mapping to FEATURE_NAV_MAP
 *  3. Done — nav, sidebar, dashboard cards all filter automatically.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  tier: "basic" | "premium";
  defaultEnabled: boolean;
}

export type FeatureCategory = "academic" | "communication" | "activities";

export const FEATURE_CATEGORIES: Record<
  FeatureCategory,
  { label: string; color: string; description: string }
> = {
  academic: {
    label: "Academic",
    color: "#4F46E5",
    description: "Core learning & assessment tools",
  },
  communication: {
    label: "Communication",
    color: "#0891B2",
    description: "Messaging & information sharing",
  },
  activities: {
    label: "Activities",
    color: "#D97706",
    description: "Student activity management",
  },
};

// ─── Registry ───────────────────────────────────────────────────────────────

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // Academic
  {
    id: "homework",
    name: "Homework & Diary",
    description: "Assign, track, and review homework tasks",
    category: "academic",
    tier: "basic",
    defaultEnabled: true,
  },
  {
    id: "attendance",
    name: "Attendance",
    description: "Daily attendance tracking and reports",
    category: "academic",
    tier: "basic",
    defaultEnabled: true,
  },
  {
    id: "analysis",
    name: "Analytics & Reports",
    description: "Performance analytics and skill reports",
    category: "academic",
    tier: "premium",
    defaultEnabled: false,
  },

  // Communication
  {
    id: "circulars",
    name: "Circulars & Announcements",
    description: "School-wide circulars and announcements",
    category: "communication",
    tier: "basic",
    defaultEnabled: true,
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Individual and class push notifications",
    category: "communication",
    tier: "premium",
    defaultEnabled: true,
  },

  // Activities
  {
    id: "leave_applications",
    name: "Leave Applications",
    description: "Leave request and approval workflow",
    category: "activities",
    tier: "basic",
    defaultEnabled: true,
  },
  {
    id: "remarks",
    name: "Remarks",
    description: "Teacher remarks and parent communication",
    category: "activities",
    tier: "basic",
    defaultEnabled: true,
  },
];

// ─── Nav / Card → Feature mapping ───────────────────────────────────────────
// Key = nav-item id or dashboard-card id
// Value = feature id that must be enabled for it to show

export const FEATURE_NAV_MAP: Record<string, string> = {
  // Shared
  circulars: "circulars",
  attendance: "attendance",
  diary: "homework",
  notifications: "notifications",
  analysis: "analysis",
  // Admin
  admin_announcements: "circulars",
  admin_activities: "leave_applications",
  // Teacher
  teacher_activities: "leave_applications",
  // Parent home-screen cards
  apply_leave: "leave_applications",
  remarks_history: "remarks",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Default feature map used when creating a new school */
export function getDefaultFeatures(): Record<string, boolean> {
  const features: Record<string, boolean> = {};
  for (const f of FEATURE_REGISTRY) {
    features[f.id] = f.defaultEnabled;
  }
  return features;
}

/** Group features by category */
export function getFeaturesByCategory(): Record<FeatureCategory, FeatureDefinition[]> {
  const grouped: Record<FeatureCategory, FeatureDefinition[]> = {
    academic: [],
    communication: [],
    activities: [],
  };
  for (const f of FEATURE_REGISTRY) {
    grouped[f.category].push(f);
  }
  return grouped;
}

/** Check if a nav/card item should be visible given the school's feature map */
export function isNavItemEnabled(
  navItemId: string,
  schoolFeatures: Record<string, boolean> | undefined
): boolean {
  const requiredFeature = FEATURE_NAV_MAP[navItemId];
  if (!requiredFeature) return true; // No feature gate → always visible
  if (!schoolFeatures) return true;  // No features configured → all enabled
  return schoolFeatures[requiredFeature] !== false;
}
