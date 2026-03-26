# AGENTS.md - Nutrition Tracker

Project context and guidelines for AI agents working on this codebase.

---

## Current Status (Last Updated: 2026-02-28)

### ✅ Completed Features

1. **Daily Food Logging** — Natural language input, Gemini parses to structured data
2. **Macro Tracking** — Real-time progress bars for kcal, protein, carbs, fat, fiber with smart tips
3. **7-Day AI Analysis** — Coaching insights based on last 7 days (Gemini 2.5)
4. **Recipe Suggestions** — AI-generated meal/snack suggestions based on macro gaps (2 meals + 1 snack)
5. **Archive System** — Save/delete analyses and recipes with visual confirmation
6. **Dark Mode** — CSS custom properties with `.dark` class toggle, persists to localStorage
7. **Password Protection** — Simple password gate using localStorage + API validation
8. **Responsive UI** — Mobile-friendly grid layouts

### 🏗️ Architecture

**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + Gemini API

---

## Directory Structure

```
nutrition-tracker/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts              # POST: Food parsing (Gemini 2.0)
│   │   ├── analyze-7days/route.ts        # POST: 7-day coaching analysis (Gemini 2.5)
│   │   ├── analyses/route.ts             # GET/POST: Analysis archive
│   │   ├── analyses/[id]/route.ts        # DELETE: Single analysis
│   │   ├── recipes/route.ts              # GET: Recipe suggestions (Gemini 2.0)
│   │   ├── recipes/archive/route.ts      # GET/POST: Recipe archive
│   │   └── recipes/archive/[id]/route.ts # DELETE: Single recipe archive
│   ├── components/
│   │   ├── DatePicker.tsx                # Date navigation
│   │   ├── FoodInput.tsx                 # Natural language food entry
│   │   ├── FoodTable.tsx                 # Daily food list with delete
│   │   ├── MacroSummary.tsx              # Progress bars + smart tips
│   │   ├── PasswordGate.tsx              # Simple password protection
│   │   ├── ThemeProvider.tsx             # Dark mode context
│   │   ├── ThemeToggle.tsx               # Sun/Moon toggle button
│   │   ├── AnalysisButton.tsx            # [DEPRECATED] Use Insights page instead
│   │   └── insights/
│   │       ├── InsightsTabs.tsx          # Tab container (Recipes | Analysis)
│   │       ├── RecipesTab.tsx            # Recipe suggestions + archive
│   │       └── AnalysisTab.tsx           # 7-day analysis + archive
│   ├── insights/
│   │   ├── layout.tsx                    # Insights page layout
│   │   └── page.tsx                      # Insights page with tabs
│   ├── page.tsx                          # Main tracker page
│   ├── layout.tsx                        # Root layout with fonts
│   └── globals.css                       # CSS custom properties theming
├── lib/
│   ├── supabase.ts                       # Supabase client + type re-exports
│   ├── gemini.ts                         # Food parsing (Gemini 2.0)
│   ├── gemini-analysis.ts                # 7-day analysis prompt (Gemini 2.5)
│   ├── gemini-recipes.ts                 # Recipe suggestions (Gemini 2.0)
│   ├── dates.ts                          # Date formatting utilities
│   └── password.ts                       # Password validation helpers
├── types/
│   └── index.ts                          # Shared TypeScript types
├── hooks/
│   └── useDeleteWithConfirm.ts           # 2-click delete confirmation hook
└── AGENTS.md                             # This file
```

---

## Database Schema (Supabase)

```sql
-- Main food entries table
food_entries:
  - id: uuid (primary key)
  - food: string
  - amount_g: number
  - kcal: number
  - protein_g: number
  - carbs_g: number
  - fat_g: number
  - fiber_g: number
  - entry_date: string (YYYY-MM-DD)
  - created_at: timestamp

-- Saved 7-day analyses
analyses:
  - id: uuid (primary key)
  - created_at: timestamp
  - date_range: string (e.g., "Feb 21 - Feb 27")
  - analysis: text

-- Saved recipe suggestions
recipes:
  - id: uuid (primary key)
  - created_at: timestamp
  - date_range: string (e.g., "Feb 27 - Feb 28")
  - suggestions: jsonb -- Array of RecipeSuggestion objects
  - based_on_dates: string[] -- Array of YYYY-MM-DD dates
```

**Note:** The `suggestions` column stores the full recipe array as JSONB, including the new `type` field ('meal' | 'snack'). No migration needed for new JSON fields.

---

## Gemini Model Usage

| Feature | Model | Reason |
|---------|-------|--------|
| Food Entry Parsing | `gemini-2.5-flash` | Fast, reliable JSON extraction |
| Recipe Suggestions | `gemini-2.5-flash` | Quick meal recommendations |
| 7-Day Analysis | `gemini-2.5-flash` | Superior reasoning for pattern recognition |

**Default:** `gemini-2.5-flash` for all features.

---

## Key Patterns

### 1. Password Protection Flow
- Client stores password in `localStorage` ('app_password')
- Sent in `x-password` header on all API calls
- Server validates against `APP_PASSWORD` env var
- 401 response triggers re-authentication

### 2. Theming System
- Uses CSS custom properties (NOT Tailwind `dark:` variants)
- `:root` = light mode, `.dark` = dark mode
- Colors defined in `globals.css`, applied via `var(--name)`
- Theme toggle adds/removes `.dark` class on `<html>`
- See "CSS Custom Properties" section below

### 3. Smart Messages System (MacroSummary.tsx)

**Time-based warnings:**
- Protein < 50% after 4pm → "⚠️ Prioritize protein in remaining meals"
- Protein < 40% after 8pm → "⚠️ Muscle loss risk — prioritize protein!"
- Calories < 50% after 10pm → "⚠️ You're under-fueled for the day"

**Macro tradeoff tips (dismissible):**
- Carbs > 120% + Fat < 70% → Swap carbs for fat (satiety)
- Fat > 120% + Carbs < 70% → Swap fat for carbs (energy)
- Protein < 60% + Carbs > 100% → Swap carbs for protein (muscle protection)
- Protein < 60% + Fat > 100% → Reduce fat, add lean protein
- Protein ≥ 90% → "✅ Well done! Protein on track"

### 4. 2-Click Delete Pattern
- Uses `useDeleteWithConfirm` hook
- First click: turns orange/red, shows "Click again to confirm"
- Second click: executes delete
- Prevents accidental deletions

### 5. Recipe Emoji Mapping
- Snack: 🧁
- Protein: 💪
- Carbs: 🌾
- Fat: 🥑
- Fiber: 🥦
- Calories: 🔥

---

## CSS Custom Properties

### Color Variables (globals.css)

```css
/* Light Mode */
--background: #f0f0f0;
--foreground: #1a1a1a;
--card-bg: #ffffff;
--card-bg-alt: #f5f5f5;
--input-bg: #ffffff;
--border-color: #d0d0d0;
--hover-bg: #e8e8e8;
--muted: #666;

/* Macros */
--kcal: #e07b39;   /* orange */
--prot: #3a8fd1;   /* blue */
--carb: #d4a017;   /* gold */
--fat:  #c0392b;   /* red */
--fiber:#27ae60;   /* green */

/* Dark Mode (auto-applied via .dark class) */
--background: #0d0d0d;
--foreground: #e8e8e8;
--card-bg: #151515;
--card-bg-alt: #1c1c1c;
--input-bg: #1c1c1c;
--border-color: #2a2a2a;
--hover-bg: #1c1c1c;
--muted: #888;

/* Dark mode macros (brighter for visibility) */
--kcal: #ff6b35;
--prot: #4dabf7;
--carb: #ffd43b;
--fat:  #f06595;
--fiber:#69db7c;
```

### Important CSS Rules

- **Never use Tailwind `dark:` variants** — always use CSS custom properties
- Tip boxes have explicit dark mode overrides in globals.css
- `.analyze-btn` and `.analysis-tab-active` have special dark mode handling

---

## Component Colors Reference

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#f0f0f0` | `#0d0d0d` |
| Card BG | `#ffffff` | `#151515` |
| Text | `#1a1a1a` | `#e8e8e8` |
| Borders | `#d0d0d0` | `#2a2a2a` |
| Muted Text | `#666` | `#888` |

### Button Colors
- Primary (Generate): `bg-gray-800` (light) / `#e8e8e8` (dark)
- Save/Confirm: `#27ae60` (green)
- Archive/View: `#8B6914` (brown)
- Recipes Tab Active: `#3a8fd1` (blue)
- Analysis Tab Active: `#1f2937` (gray-800, light) / `#e8e8e8` (dark)

---

## Types Reference (types/index.ts)

```typescript
interface FoodEntry {
  id: string;
  food: string;
  amount_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  entry_date: string;
  created_at: string;
}

interface RecipeSuggestion {
  name: string;
  description: string;
  primary_macro: 'protein' | 'carbs' | 'fat' | 'fiber' | 'kcal';
  type?: 'meal' | 'snack';  // NEW: distinguishes meals from snacks
}

interface Analysis {
  id: string;
  created_at: string;
  date_range: string;
  analysis: string;
}

interface MacroGoals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface DayData {
  date: string;
  totals: { kcal, protein_g, carbs_g, fat_g, fiber_g };
  entries: DayEntry[];
}
```

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
APP_PASSWORD=
```

---

## Known Issues / Technical Debt

### 1. Goal Values Duplicated
Goals are hardcoded in multiple places:
- `MacroSummary.tsx` (line 6-12) — for display/progress bars
- `app/api/analyze-7days/route.ts` (line 7-13) — for 7-day analysis
- `app/api/recipes/route.ts` (line 8-14) — for recipe suggestions

**Refactor needed:** Centralize goals in a config file or database.

### 2. ✅ FIXED: Recipe Goals != MacroSummary Goals
~~Recipes API uses 2200 kcal, MacroSummary uses 2000 kcal.~~ Fixed: Both now use 2000 kcal with matching macro goals.

### 3. ✅ FIXED: Console Logging in ThemeProvider
~~Debug logs should be removed.~~ Fixed: All debug logs removed from ThemeProvider and ThemeToggle.

### 4. Password Stored in localStorage
Not secure — acceptable for personal use. No change needed.

### 5. ✅ FIXED: AnalysisButton Component Deprecated
~~`app/components/AnalysisButton.tsx` still exists but is no longer used.~~ Fixed: Component removed.

### 6. Unused Variables
Some components have unused error variables — acceptable for personal use. Run `npm run lint` periodically if desired.

---

## Potential Refactorings

### High Priority
1. **Centralize Goals** — Create `lib/goals.ts` to share goals between MacroSummary and API routes (currently duplicated)

### Medium Priority
2. **Extract API Route Logic** — Move business logic from API routes to lib functions for better testability
3. **Add Error Boundaries** — Wrap components for better error handling
4. **Add Loading States** — Some interactions lack visual feedback
5. **Supabase RLS** — Add Row Level Security policies if ever going to production

### Low Priority
6. **Unit Tests** — Add Jest/Vitest tests for lib functions
7. **E2E Tests** — Add Playwright tests for critical flows
8. **PWA Support** — Add service worker for offline use
9. **Food Database** — Cache common foods to reduce Gemini API calls

### ✅ Completed
- ~~Remove Debug Logs~~ — ThemeProvider and ThemeToggle cleaned up
- ~~Delete Deprecated Components~~ — AnalysisButton removed

---

## Code Style Guidelines

### Styling
- Use CSS custom properties: `bg-[var(--card-bg)]`, `text-[var(--foreground)]`
- **Never use Tailwind `dark:` variants** — use CSS custom properties instead
- Buttons: Rounded corners (`rounded-lg`), hover transitions
- Colors: See "Component Colors Reference" above

### Components
- Functional components with hooks
- Props interface at top of file
- Loading states: `isLoading`, disabled buttons, spinners
- Error handling: Set error state, display below buttons

### API Routes
- Always validate password first
- Return appropriate status codes (401 for auth, 500 for errors)
- Consistent response shape: `{ data }` or `{ error }`

### Gemini Integration
- Export async functions from `lib/gemini-*.ts`
- System prompt + user prompt pattern
- Handle empty responses with errors
- **Use `gemini-2.5-flash-lite` by default**, 2.5 only for 7-day analysis

---

## Git Convention

```bash
git config user.name "Kimi"
git config user.email "kimi@kimi.co"
git add -A
git commit -m "message"
git config user.name "pascal müller"
git config user.email "54896623+Cinemaker123@users.noreply.github.com"
```

---

## Quick Reference: Adding a New Feature

1. **Update types** in `types/index.ts`
2. **Add lib function** if using Gemini (e.g., `lib/gemini-feature.ts`)
3. **Create API route** in `app/api/feature/route.ts`
4. **Build component** in `app/components/` or `app/components/insights/`
5. **Add to page** where needed
6. **Update AGENTS.md** with new feature documentation
7. **Test both themes** (light and dark mode)

---

## Notes for Future Agents

- The user prefers **minimal changes** — don't over-engineer
- **Always test dark mode** when changing UI components
- The app is for **personal use** — prioritize features over perfection
- **Macros are critical** — protein is especially important for this user
- **Vegetarian/plant-based diet** — never suggest meat in AI prompts
- **Emoji placement matters** — recipes show emoji BEFORE name
