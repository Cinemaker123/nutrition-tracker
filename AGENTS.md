# AGENTS.md - Nutrition Tracker

Project context and guidelines for AI agents working on this codebase.

---

## Project Overview

**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase + Gemini API
**Purpose:** AI-powered nutrition tracking with food logging, macro analysis, and recipe suggestions

### Current Features
1. **Daily Food Logging** — Add foods via natural language (Gemini parses to structured data)
2. **Macro Tracking** — Real-time progress bars for kcal, protein, carbs, fat, fiber
3. **7-Day Analysis** — AI coaching insights based on last 7 days of data (Gemini 2.5)
4. **Analysis Archive** — Save/delete past analyses with visual confirmation
5. **Dark Mode** — CSS custom properties with `.dark` class toggle
6. **Smart Messages** — Context-aware tips (protein priority, carb/fat tradeoffs)

---

## Gemini Model Usage

| Feature | Model | Reason |
|---------|-------|--------|
| Food Entry Parsing | `gemini-2.0-flash` | Fast, reliable JSON extraction |
| Recipe Suggestions | `gemini-2.0-flash` | Quick meal recommendations |
| 7-Day Analysis | `gemini-2.5-flash` | Superior reasoning for pattern recognition |

**Default:** `gemini-2.0-flash` for all new features unless complex reasoning is needed.

---

## Architecture

### Directory Structure
```
app/
├── api/
│   ├── analyze/route.ts           # POST: Food analysis (Gemini 2.0 parsing)
│   ├── analyze-7days/route.ts     # POST: 7-day coaching analysis (Gemini 2.5)
│   ├── analyses/route.ts          # GET/POST: Archive management
│   ├── analyses/[id]/route.ts     # DELETE: Single analysis deletion
│   └── recipes/route.ts           # GET: Recipe suggestions (Gemini 2.0)
├── components/
│   ├── Navigation.tsx             # [PLANNED] Tab switcher (Tracker | Insights)
│   ├── DatePicker.tsx             # Date navigation
│   ├── FoodInput.tsx              # Natural language food entry
│   ├── FoodTable.tsx              # Daily food list with delete
│   ├── MacroSummary.tsx           # Progress bars + smart tips
│   ├── PasswordGate.tsx           # Simple password protection
│   ├── ThemeProvider.tsx          # Dark mode context
│   ├── ThemeToggle.tsx            # Light/dark switch
│   └── insights/                  # [PLANNED] Insights page components
│       ├── InsightsTabs.tsx       # Tab container (Recipes | Analysis)
│       ├── RecipeSuggestions.tsx  # Recipe display with delete
│       ├── AnalysisPanel.tsx      # Generate + archive buttons
│       └── ArchiveList.tsx        # Saved analyses list
├── page.tsx                       # Main tracker page
├── insights/                      # [PLANNED] Insights page (second page)
│   ├── layout.tsx                 # Insights layout
│   └── page.tsx                   # Tabbed interface
├── layout.tsx                     # Root layout with fonts
└── globals.css                    # CSS custom properties theming

lib/
├── supabase.ts                    # Supabase client + types
├── gemini.ts                      # Gemini 2.0 client factory (food parsing)
├── gemini-analysis.ts             # 7-day analysis prompt (Gemini 2.5)
├── gemini-recipes.ts              # [PLANNED] Recipe suggestion prompt (Gemini 2.0)
└── dates.ts                       # [PLANNED] Date formatting utilities

types/
└── index.ts                       # [PLANNED] Shared TypeScript types
```

### Key Patterns

**1. Password Protection Flow**
- Client stores password in `localStorage`
- Sent in `x-password` header on all API calls
- Server validates against `APP_PASSWORD` env var
- 401 response triggers re-authentication

**2. Theming System**
- Uses CSS custom properties (not Tailwind `dark:` variants)
- `:root` = light mode, `.dark` = dark mode
- Colors defined in `globals.css`, applied via `var(--name)`
- Theme toggle adds/removes `.dark` class on `<html>`

**3. Database Schema**
```sql
food_entries:
  - id, food, amount_g, kcal, protein_g, carbs_g, fat_g, fiber_g
  - entry_date (YYYY-MM-DD), created_at

analyses:
  - id, created_at, date_range, analysis

recipes:
  - id, created_at, date_range, suggestions
```

**4. Gemini Integration**
- `gemini-2.0-flash` for everything
- System prompts define output format strictly
- JSON mode for structured data (food parsing)
- Plain text for coaching/recipe suggestions

---

## Refactoring Plan: Insights Page with Tabs

### Goal
Create a second page ("Insights") with tabs for Recipes and 7-Day Analysis. Recipes loads automatically. Analysis requires button press.

### New Page Structure
```
app/
├── insights/
│   ├── layout.tsx                 # Insights layout (PasswordGate, ThemeProvider, back button)
│   ├── page.tsx                   # Main insights page with tabs
│   └── components/
│       ├── InsightsTabs.tsx       # Tab switcher (Recipes [blue] | Analysis [dark grey])
│       ├── RecipesTab.tsx         # Auto-loads recipes on mount
│       ├── AnalysisTab.tsx        # Buttons for generate + archive
│       ├── RecipeCard.tsx         # Single recipe display with delete
│       ├── AnalysisResult.tsx     # Analysis display
│       └── ArchiveList.tsx        # Saved analyses with delete
```

### Navigation Flow
1. Main page (`/`) = Daily tracker (unchanged)
2. Add "Insights" button/link on main page
3. Insights page (`/insights`) shows tabs:
   - **Recipes** (blue, left) — Loads automatically
   - **Analysis** (dark grey, right) — Shows generate + archive buttons
4. Back button to return to tracker

### Phase 1: Extract Shared Components

**1.1 Create Types File**
- `types/index.ts` — FoodEntry, Analysis, RecipeSuggestion, Goal types

**1.2 Extract Utilities**
- `lib/dates.ts` — Date formatting (from AnalysisButton, DatePicker)
- `lib/password.ts` — Password header helper

**1.3 Move Analysis Components**
- Extract archive list to reusable `ArchiveList.tsx`
- Extract delete logic to hook `useDeleteWithConfirm()`

### Phase 2: Recipes Feature

**2.1 Backend**
```typescript
// lib/gemini-recipes.ts
const SYSTEM_PROMPT = `You are a plant-based nutrition assistant.

Return exactly 2-3 plant-based meal suggestions that would best address 
the macro gaps from the provided food log.

For each suggestion return only:
- Name
- One sentence description
- The primary macro it addresses

No recipe, no ingredients, no steps. Plain text, no markdown, no bullet points.`;

// Fetch yesterday + today from Supabase
// Calculate gaps vs goals
// Call Gemini 2.0 with prompt
```

**2.2 API Route**
- `app/api/recipes/route.ts` — GET endpoint
  - Query: `?endDate=YYYY-MM-DD` (uses today as default)
  - Returns: `{ suggestions: RecipeSuggestion[] }`

**2.3 Frontend**
- `RecipesTab.tsx` — Loads on mount, displays cards
- `RecipeCard.tsx` — Name, description, macro badge, delete button
- Delete works same as analyses: grey → red, 2 clicks

### Phase 3: Insights Page

**3.1 Tab Design**
```
[ Recipes (blue) ] [ Analysis (dark grey) ]
```
- Recipes tab: Blue background when active, loads automatically
- Analysis tab: Dark grey when active, shows buttons
- Inactive tabs: Lighter/neutral background

**3.2 Analysis Tab Contents**
- "Generate New Analysis" button (triggers 7-day analysis)
- "View Archive" button (toggles archive list)
- Current analysis result (if generated)
- Archive list (if toggled)

**3.3 Recipes Tab Contents**
- Auto-load on mount (loading spinner)
- List of recipe cards
- Each card: Delete button (same 2-click confirm)
- Refresh button to regenerate

### Phase 4: Navigation Integration

**4.1 Main Page Addition**
- Add "Insights" button to `page.tsx`
- Position: Below AnalysisButton or in header area
- Style: Distinct from primary actions

**4.2 Insights Layout**
- Back button to return to main tracker
- Same ThemeProvider, PasswordGate wrappers
- Consistent styling with main page

---

## Design Reference

### Color Palette (from macros_today.html)

| Macro | Emoji | Bar Color | Text Color |
|-------|-------|-----------|------------|
| Calories | 🔥 | #e07b39 | #e07b39 |
| Protein | 💪 | #3a8fd1 | #3a8fd1 |
| Carbs | 🍞 | #d4a017 | #d4a017 |
| Fat | 🫒 | #c0392b | #c0392b |
| Fiber | 🌾 | #27ae60 | #27ae60 |

### Dark Mode Colors

```css
/* Light Mode */
--background: #f0f0f0;
--card-bg: #ffffff;
--border-color: #d0d0d0;

/* Dark Mode */
--background: #0d0d0d;
--card-bg: #151515;
--border-color: #2a2a2a;
```

### Tab Colors (Insights Page)
- **Recipes (active):** Blue background (#3a8fd1 or similar)
- **Analysis (active):** Dark grey background (#2c2c2c or similar)
- **Inactive:** Neutral/light background

---

## Code Style Guidelines

### Styling
- Use CSS custom properties: `bg-[var(--card-bg)]`, `text-[var(--foreground)]`
- Never use Tailwind `dark:` variants
- Buttons: Rounded corners (`rounded-lg`), hover transitions
- Colors:
  - Primary actions: `bg-gray-800` (light) / `#e8e8e8` (dark) via `.analyze-btn`
  - Archive: `#8B6914` (brown)
  - Destructive: Red progression (grey → red, 2 clicks)
  - Recipes tab: Blue accent
  - Analysis tab: Dark grey

### Components
- Use functional components with hooks
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
- Temperature 0.3 for consistency
- Handle empty responses with errors
- **Use `gemini-2.0-flash` by default**, 2.5 only for complex reasoning (7-day analysis)

---

## Smart Messages Reference

### Context-Aware Tips (Phase 3 Features)

**Calorie Messages:**
- Under 50% by 6pm → "You're under-fueled for the day, don't skip meals to cut"
- Over target → "Maintenance calories hit, no deficit today"
- On track → "On track for your goal"

**Protein Messages (Priority for cuts):**
- Under 1g/kg by end of day → "Muscle loss risk — hit protein tomorrow even if it costs calories"
- Under 50% by midday → "⚠️ Prioritize protein in remaining meals"
- On track → Nothing (silent success)

**Carb/Fat Tradeoff:**
- Carbs way over, fat way under → "Consider swapping some carbs for fat tomorrow — easier to stay full"
- Carbs under, fat over → "Try more carbs, less fat for better energy"

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
APP_PASSWORD=
```

---

## Git Convention Reminder

```bash
git config user.name "Kimi"
git config user.email "kimi@kimi.co"
git add -A
git commit -m "message"
git config user.name "pascal müller"
git config user.email "54896623+Cinemaker123@users.noreply.github.com"
```

---

## Development Checklist

### Before Starting Refactor
- [ ] Review current `page.tsx` structure
- [ ] Plan component extraction
- [ ] Create types file

### During Implementation
- [ ] Test tab switching
- [ ] Ensure recipes auto-load
- [ ] Verify analysis buttons work
- [ ] Test delete on both tabs
- [ ] Ensure password gate works
- [ ] Verify theme persists

### After Completion
- [ ] Update this AGENTS.md with any changes
- [ ] Commit with clear message about insights page

---

## Current Status

**Last Updated:** 2026-02-27
**Active Feature:** Insights page with Recipes + Analysis tabs
**Model Policy:** 2.0 default, 2.5 for 7-day analysis only
**Next Steps:** Phase 1 — Extract shared components and types
