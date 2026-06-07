---
name: EDODWAJA mobile app structure
description: Key decisions and sharp edges for the EDODWAJA Expo mobile app build
---

**Why:** Documents non-obvious decisions made during initial MVP build so future sessions don't re-litigate them.

## Auth
- No real backend. `AuthContext` uses AsyncStorage. Login accepts any email/password and creates a user object from the email.
- Redirect logic lives in `app/index.tsx` — checks `isLoading` then sends to `/(auth)/login` or `/(tabs)`.

## Navigation
- Root stack covers all routes. Detail screens (course, quiz, store, news, profile/edit, settings) live outside `(tabs)` to avoid nested tab bars.
- `(tabs)/_layout.tsx` uses `isLiquidGlassAvailable()` to pick NativeTabs (iOS 26+) vs classic Tabs.

## Color system
- Single source: `constants/colors.ts` → `colors.light.*`
- `useColors()` hook returns the `light` object (no dark mode yet).
- Primary: `#4F46E5` (indigo), Secondary: `#F97316` (orange)

## Video playback
- Learning screen uses `expo-web-browser` (`WebBrowser.openBrowserAsync`) to open YouTube links — no `react-native-webview` dependency needed.

## Mock data
- All content in `data/mockData.ts`: 5 courses, 6 products (3 physical, 3 digital), 5 news items, 2 quizzes.
- Course thumbnails: `assets/images/course_robotics.png`, `course_ai.png`, `course_electronics.png` (AI-generated).

## Web safe area padding
- Every screen uses `Platform.OS === "web" ? 67 : insets.top` for top padding to compensate for the Replit preview toolbar.

**How to apply:** When adding new screens, follow the same top-padding pattern and use `useColors()` for all color values.
