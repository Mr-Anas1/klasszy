# Feature Flags System — Implementation Plan

## Overview
Add per-school feature flags controlled by Super Admin. Schools only see enabled features.

## Files to Create
1. `src/lib/feature-registry.ts` — Central feature definitions + nav mapping
2. `src/components/superadmin/SAFeatureManager.tsx` — Toggle UI for SA

## Files to Modify
3. `src/context/AppContext.tsx` — Add `features` to School, expose `isFeatureEnabled`
4. `src/context/SuperAdminContext.tsx` — Add `updateSchoolFeatures`
5. `src/components/superadmin/SASchoolDetail.tsx` — Add "Features" tab
6. `src/components/AppShell.tsx` — Filter sidebar nav by features
7. `src/components/layout/BottomNav.tsx` — Filter bottom nav by features
8. `src/components/screens/AdminDashboardScreen.tsx` — Filter cards
9. `src/components/screens/TeacherHomeScreen.tsx` — Filter cards
10. `src/components/screens/HomeScreen.tsx` — Filter cards
11. `src/components/screens/LoginScreen.tsx` — Redesign with school branding flow

## Feature → Nav/Card Mapping
| Feature ID | Controls |
|---|---|
| `homework` | diary, diary_history |
| `attendance` | attendance |
| `circulars` | circulars, admin_announcements |
| `notifications` | notifications |
| `leave_applications` | admin_activities, teacher_activities, apply_leave |
| `remarks` | remarks_history |
| `analysis` | analysis |
