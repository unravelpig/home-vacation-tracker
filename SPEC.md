# Home Vacation Tracker — Design & Technical Specification

## 1. Concept & Vision

A minimal, visual web app for planning vacations creatively. It combines an annual
calendar with an interactive world map so you get a global picture of the trips you
have imagined and planned. The experience should feel like a "digital travel
notebook" — organic, visual and motivating.

**Main flow:** IDEA → PLAN → COMPLETED TRIP

## 2. Design Language

### Aesthetic Direction
"Modern atlas" aesthetic — warm earth colours, editorial typography, generous
whitespace. Inspired by vintage travel maps but with a clean contemporary interface.

### Color Palette
```
--bg-primary: #FDFBF7          (warm cream — main background)
--bg-secondary: #F5F0E8        (light beige — cards, sections)
--bg-dark: #2C3E50             (dark blue — header, important elements)
--text-primary: #2C3E50        (dark blue — main text)
--text-secondary: #7F8C8D      (grey — secondary text)
--accent: #E67E22               (terracotta orange — accents, CTAs)
--idea-color: #3498DB          (blue — IDEA status)
--plan-color: #27AE60          (green — PLANNED status)
--completed-color: #9B59B6     (purple — COMPLETED status)
--border: #E0D6C8              (dark beige — borders)
```

### Typography
- **Headings:** "Playfair Display" (elegant serif) — page titles, place names
- **Body:** "Inter" (readable sans-serif) — general text, forms, UI
- **Fallbacks:** Georgia, system-ui, sans-serif

### Spatial System
- Base unit: 8px
- Spacing scale: 8, 16, 24, 32, 48, 64, 96px
- Border radius: 8px (cards), 4px (inputs), 50% (avatars)
- Shadows: subtle, warm-toned (`0 2px 8px rgba(44,62,80,0.08)`)

### Motion Philosophy
- Smooth transitions: 200-300ms ease-out
- Hover states: scale(1.02) + shadow elevation
- Page transitions: fade-in 300ms
- Stagger animations in card grids: 50ms delay between items

### Visual Assets
- **Icons:** Lucide React (thin line, consistent)
- **Map:** react-simple-maps with TopoJSON world-atlas
- **Images:** flag emojis for country chips

## 3. Layout & Structure

### Home page (`/`)
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Navigation (minimal)                        │
├───────────────────────────────────────┬─────────────────────┤
│                                       │                     │
│   ANNUAL CALENDAR (1 year)            │   SIDEBAR           │
│   - Days colored by status            │   - App logo        │
│   - Click a day = see details         │   - IDEAS (btn)     │
│                                       │   - PLANS (btn)     │
│   WORLD MAP                           │   - TRIPS (btn)     │
│   - Countries colored by status       │   - TIME OFF (btn)  │
│   - Hover = tooltip with name         │                     │
│   - Click = modal with details        │                     │
├───────────────────────────────────────┴─────────────────────┤
│  SUMMARY: quick stats (X ideas, Y plans, Z completed)       │
└─────────────────────────────────────────────────────────────┘
```

### Ideas page (`/ideas`)
```
┌─────────────────────────────────────────────────────────────┐
│  HERO: "Travel Ideas" + counter                             │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ IDEA CARD   │  │ IDEA CARD   │  │ IDEA CARD   │          │
│  │ - Title     │  │             │  │             │          │
│  │ - Country/  │  │             │  │             │          │
│  │   city      │  │             │  │             │          │
│  │ - Dates     │  │             │  │             │          │
│  │ - Tags      │  │             │  │             │          │
│  │ [EDIT]      │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  [+ CREATE NEW IDEA]                                        │
└─────────────────────────────────────────────────────────────┘
```

### Plans page (`/plans`)
- Same layout as Ideas but with PLAN cards
- Visual difference: green border, "PLANNED / RESERVED / COMPLETED" badge

### Create/Edit Idea (`/ideas/new`, `/ideas/[id]/edit`)
```
┌─────────────────────────────────────────────────────────────┐
│  FORM                                                        │
│  - Trip title *                                              │
│  - Short description                                         │
│  - Destination countries * (multi-select with autocomplete)  │
│  - Specific cities (optional)                                │
│  - Estimated start date (optional)                           │
│  - Estimated end date (optional)                             │
│  - Trip type (beach, mountain, city, adventure, cultural)    │
│  - Estimated budget (optional)                               │
│  - Additional notes                                          │
│                                                              │
│  [SAVE IDEA]  [CANCEL]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Create/Edit Plan (`/plans/new`, `/plans/[id]/edit`)
```
┌─────────────────────────────────────────────────────────────┐
│  INFO BOX: "Converting idea: [Idea name]"                   │
│                                                              │
│  FORM                                                        │
│  - Original idea (read-only selector, required)              │
│  - Plan title * (pre-filled from the idea)                   │
│  - Detailed description                                      │
│  - Destination countries * (pre-filled, editable)            │
│  - Cities (pre-filled, editable)                             │
│  - Start date *                                              │
│  - End date *                                                │
│  - Trip type                                                 │
│  - Estimated budget                                          │
│  - Plan status (PLANNED, RESERVED, COMPLETED)                │
│  - Additional notes                                          │
│                                                              │
│  [SAVE PLAN]  [CANCEL]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: two-column layout (content + sidebar)
- Tablet (< 1024px): collapsible sidebar
- Mobile (< 768px): vertical stack, sidebar as drawer
- The main content area is the only scroll container; the bottom of the
  content keeps safe-area padding so the last card is always reachable

## 4. Features & Interactions

### Annual Calendar
- Shows the current year by default
- Days with trips: colour marker by status (idea/plan/completed)
- Work days off are coloured per person; overlap uses a highlight colour
- Click a day: modal with that day's trips
- Arrows to move between years

### World Map
- Interactive SVG countries
- A country has 4 colour states:
  - Uncoloured: no trips
  - Blue (#3498DB): the country has IDEAS
  - Green (#27AE60): the country has PLANS
  - Purple (#9B59B6): the country has COMPLETED TRIPS
- Hover: tooltip with the country name and trip list
- Click: modal with details of every trip to that country

### Sidebar
- Buttons: IDEAS, PLANS, COMPLETED TRIPS, TIME OFF
- Each button shows a counter badge
- Active item highlighted

### Idea Management
- **View:** card grid with previews
- **Create:** full form
- **Edit:** same form, pre-filled
- **Delete:** confirmation modal

### Plan Management
- **View:** card grid with previews
- **Create:** idea picker + expanded form
- **Edit:** full form (changing the idea is not allowed — create a new plan)
- **Delete:** confirmation modal
- **Mark as completed:** quick action from the card

### Trip Status
```
IDEA → PLANNED → RESERVED → COMPLETED
 │         │          │          │
 Blue     Green     Orange     Purple
```

## 5. Component Inventory

### IdeaCard
- **Default:** cream background, beige border, Playfair title, country/city with flag
- **Hover:** elevation + scale(1.02), stronger shadow
- **Tags:** small chips with the trip type

### PlanCard
- Similar to IdeaCard but with a green border and a status badge
- Visible status indicator
- Quick actions: edit, mark completed

### Button
- **Primary:** accent background (#E67E22), white text, darkens on hover
- **Secondary:** accent border, transparent background, accent/10% on hover
- **Ghost:** text only, underline on hover
- **Disabled:** 50% opacity, cursor not-allowed

### Input/Select
- Subtle border, accent ring on focus
- Error state: red border, message underneath
- Light grey placeholder

### Modal
- Semi-transparent dark overlay
- Centred content, cream background, 8px border-radius
- Animation: fade-in + scale from 0.95

### CountrySelector
- Autocomplete search
- Shows flag + country name
- Multi-select with chips

### MapTooltip
- Small, with an arrow pointing at the country
- List of trips in that country
- Click to see more

## 6. Technical Approach

### Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite (better-sqlite3) — local, no external service
- **Map:** react-simple-maps + world-atlas TopoJSON
- **Icons:** Lucide React
- **Date handling:** date-fns

### Database (SQLite)

The database is created automatically as `tracker.db` in the working directory.

```sql
-- Table: ideas
CREATE TABLE ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  countries TEXT NOT NULL DEFAULT '[]',
  cities TEXT NOT NULL DEFAULT '[]',
  estimated_start_date TEXT,
  estimated_end_date TEXT,
  trip_type TEXT,
  estimated_budget REAL,
  duration_days INTEGER,
  season TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: plans
CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  countries TEXT NOT NULL DEFAULT '[]',
  cities TEXT NOT NULL DEFAULT '[]',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  trip_type TEXT,
  estimated_budget REAL,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL
);

-- Table: work_vacations
CREATE TABLE work_vacations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person TEXT NOT NULL CHECK(person IN ('person1', 'person2')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### API Routes (Next.js)

```
GET    /api/ideas            - List all ideas
POST   /api/ideas            - Create idea
GET    /api/ideas/[id]       - Get idea by ID
PUT    /api/ideas/[id]       - Update idea
DELETE /api/ideas/[id]       - Delete idea

GET    /api/plans            - List all plans
POST   /api/plans            - Create plan
GET    /api/plans/[id]       - Get plan by ID
PUT    /api/plans/[id]       - Update plan
DELETE /api/plans/[id]       - Delete plan
POST   /api/plans/to-idea    - Convert a plan back into an idea

GET    /api/work-vacations   - List work days off
POST   /api/work-vacations   - Add work days off
DELETE /api/work-vacations   - Delete work days off

GET    /api/countries        - List countries (for the selector)
```

### Folder Structure
```
/app
  /page.tsx                 - Home (calendar + map)
  /ideas
    /page.tsx               - Idea list
    /new/page.tsx           - Create idea
    /[id]/edit/page.tsx     - Edit idea
  /plans
    /page.tsx               - Plan list
    /new/page.tsx           - Create plan
    /[id]/edit/page.tsx     - Edit plan
  /completed
    /page.tsx               - Completed trips
  /time-off
    /page.tsx               - Work days off per person
  /api
    /ideas/route.ts
    /ideas/[id]/route.ts
    /plans/route.ts
    /plans/[id]/route.ts
    /plans/to-idea/route.ts
    /work-vacations/route.ts
    /countries/route.ts
/components
  /layout
    /Header.tsx
    /Sidebar.tsx
  /ui
    /Button.tsx
    /Input.tsx
    /Textarea.tsx
    /Select.tsx
    /Modal.tsx
    /Card.tsx
  /features
    /AnnualCalendar.tsx
    /WorldMap.tsx
    /IdeaCard.tsx
    /PlanCard.tsx
    /CountrySelector.tsx
    /CitySelector.tsx
/lib
  /db.ts                    - SQLite setup
  /types.ts                 - TypeScript types
  /utils.ts                 - Utilities
  /people.ts                - The two people (labels + colors)
/public
  /data
    /countries.json         - Country data
    /cities.json            - City data
    /world-atlas.json       - Map geometry
types
  /react-simple-maps.d.ts   - Types for react-simple-maps
```

## 7. Next Steps (Post-MVP)

- Upload trip photos
- Share trips publicly
- Statistics and charts
- Weather API integration
- Reminders and notifications
