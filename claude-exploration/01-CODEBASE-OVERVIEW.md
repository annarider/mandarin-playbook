# Mandarin Playbook Codebase Exploration Report

## Executive Summary
The Mandarin Playbook is an Astro-based static site for Mandarin homeschool activities. It uses content collections with Zod validation, Astro components for rendering structured data, and comprehensive testing with Vitest and Playwright.

---

## 1. Activity Data Structure

### Content Schema (TypeScript/Zod)
Location: `/Users/anna/Documents/websites/mandarin-playbook/src/content/config.ts`

```typescript
interface Activity {
  // Required fields
  title: string;
  description: string;
  ageRange: string;
  duration: string;
  category: enum['game', 'craft', 'story', 'song', 'festival', 'food', 'other'];
  difficultyLevel: enum['beginner', 'intermediate', 'advanced'];
  skills: enum['listening', 'speaking', 'reading', 'writing', 'cultural'][];

  // Optional fields
  vocabulary?: VocabItem[];
  phrases?: PhraseItem[];
  supplies?: string[];
  printable?: { title: string; url: string };
  relatedActivities?: string[];
  tags?: string[];
}

interface VocabItem {
  simplified: string;
  traditional?: string;  // Optional traditional characters
  pinyin: string;
  english: string;
}

interface PhraseItem {
  simplified: string;
  traditional?: string;  // Optional traditional characters
  pinyin: string;
  english: string;
}
```

### Example Activity: Thanksgiving Gratitude
Location: `/Users/anna/Documents/websites/mandarin-playbook/src/content/activities/thanksgiving-gratitude.md`

**Frontmatter:**
```yaml
title: "Thanksgiving Gratitude Circle"
description: "Practice expressing gratitude in Mandarin during Thanksgiving with family circle time"
ageRange: "4-10 years"
duration: "20-30 minutes"
category: "festival"
difficultyLevel: "beginner"
skills: ["speaking", "listening", "cultural"]

vocabulary:
  - simplified: "感恩节"
    pinyin: "gǎn'ēn jié"
    english: "Thanksgiving"
  - simplified: "感谢"
    pinyin: "gǎnxiè"
    english: "to thank, to be grateful"
  # ... more items

phrases:
  - simplified: "我很感谢..."
    pinyin: "wǒ hěn gǎnxiè..."
    english: "I am grateful for..."
  # ... more items

supplies:
  - "Gratitude cards or paper"
  - "Crayons or markers"
  - "Optional: photos of family members"

tags: ["thanksgiving", "gratitude", "family", "speaking"]
```

**Body Content:** Markdown with sections like:
- Activity Instructions (with numbered steps)
- Tips for Parents
- Cultural Connection

### Activity Data Variations

**Thanksgiving Gratitude (Full Featured):**
- Has: vocabulary, phrases, supplies, tags
- No: printable

**Counting Game (Minimal):**
- Has: only description, ageRange, duration, category, difficultyLevel, skills, tags
- No: vocabulary, phrases, supplies, printable

**Mid-Autumn Story (With Printable):**
- Has: vocabulary, phrases, supplies, printable, tags
- No: relatedActivities

---

## 2. Component Patterns

All components follow a consistent pattern:

### TypeScript Interface Pattern
```typescript
interface Props {
  items: ItemType[];  // or other data structure
}

const { items } = Astro.props;
```

### Styling Pattern
- Each component has scoped CSS with:
  - `.card` base styling (2px solid border, 12px border-radius, 1.5rem padding, shadow)
  - `h2` heading (1.5rem font-size, #c41e3a color, bottom border)
  - Responsive design with @media (min-width: 768px)
  - Mobile: 1.5rem padding, Desktop: 2rem padding
  - Mobile: 1.5rem h2, Desktop: 1.75rem h2

### Card Components

#### VocabCard.astro
**Input:** `VocabItem[]`

**Data Structure:**
```typescript
interface VocabItem {
  simplified: string;
  traditional?: string;  // Displayed in smaller text in parentheses
  pinyin: string;
  english: string;
}
```

**Rendering:**
```
[Simplified Chinese] (Traditional if present)
Pinyin (italic)
English translation
```

**CSS:** 
- Chinese: 1.75rem bold (2rem desktop)
- Traditional: 1.5rem, lighter color
- Pinyin: 1.25rem italic, lighter color
- English: 1.125rem, darker gray

**File:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/VocabCard.astro`

#### PhrasesCard.astro
**Input:** `PhraseItem[]`

**Data Structure:** (identical to VocabItem)
```typescript
interface PhraseItem {
  simplified: string;
  traditional?: string;
  pinyin: string;
  english: string;
}
```

**Rendering:** (identical to VocabCard)

**File:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/PhrasesCard.astro`

#### SuppliesCard.astro
**Input:** `string[]` (simple array of supply names)

**Rendering:**
- Bulleted list (list-style: disc)
- One item per line
- 1.125rem font size

**CSS:**
- Uses standard bullet points
- Padding-left: 1.5rem for bullet alignment

**File:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/SuppliesCard.astro`

#### InstructionsCard.astro
**Input:** `Content` (rendered markdown from activity body)

**Features:**
- Renders the markdown Content component
- Styles nested markdown elements globally

**Global CSS for nested elements:**
```css
h2 { font-size: 1.375rem; margin-top: 1.5rem; no border }
h3 { font-size: 1.25rem; margin-top: 1.25rem }
p { margin-bottom: 1rem }
ul, ol { margin-bottom: 1rem; padding-left: 1.5rem }
li { margin-bottom: 0.5rem; line-height: 1.6 }
strong { font-weight: 600; color: #000 }
em { font-style: italic }
code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px }
```

**File:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/InstructionsCard.astro`

#### TipsCard.astro
**Input:** `string[]` (optional, only renders if tips exist)

**Features:**
- Conditional rendering: `{tips && ( ... )}`
- Custom styling with lightbulb emoji (💡) prefix
- Warm background color (#fff7e6) - different from other cards
- Orange accent color (#d97706) instead of red

**CSS:**
- Background: #fff7e6 (cream/tan)
- h2 color: #d97706 (orange)
- Bullet items: Position relative with ::before pseudo-element for emoji
- Left padding: 2rem (2.5rem desktop) for emoji space

**File:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/TipsCard.astro`

---

## 3. Page Structure: [slug].astro

Location: `/Users/anna/Documents/websites/mandarin-playbook/src/pages/activities/[slug].astro`

### Data Flow:
```
getStaticPaths() 
  → Get all activities from content collection
  → Map each activity to dynamic route
    ↓
Astro.props.activity (contains activity object with .data and .render())
  ↓
activity.data contains: title, description, ageRange, duration, vocabulary, phrases, supplies, printable, tags
activity.render() returns: { Content } (rendered markdown)
```

### Component Usage Order in Template:
1. **VocabCard** - if `activity.data.vocabulary` exists
2. **PhrasesCard** - if `activity.data.phrases` exists
3. **SuppliesCard** - if `activity.data.supplies` exists
4. **Printable Section** - if `activity.data.printable` exists (custom HTML, not a component)
5. **InstructionsCard** - always rendered with `Content` prop
6. **Tags Section** - if `activity.data.tags` exists (custom HTML, not a component)

### Key Styling Elements in [slug].astro:
- `.card` class: consistent with component cards
- `.back-nav`: navigation link styling (#c41e3a color)
- `.activity-header`: title (2rem / 2.5rem desktop), description, metadata
- `.metadata`: flex layout with individual `.meta-item` boxes
- `.tags-section`: background #f3f4f6, same styling as cards
- `.printable.card`: download link styling

---

## 4. TypeScript Configuration

Location: `/Users/anna/Documents/websites/mandarin-playbook/tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

**Note:** Uses Astro's strict TypeScript configuration. Astro auto-generates type definitions in `.astro/content.d.ts` for content collections.

---

## 5. Testing Infrastructure

### Unit Tests (Vitest)

**Configuration:** `/Users/anna/Documents/websites/mandarin-playbook/vitest.config.js`
```javascript
{
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
    }
  }
}
```

**Test Files:**

1. **content-schema.test.ts** - Validates data structure compliance
   - Tests required field presence
   - Tests enum values (category, difficultyLevel, skills)
   - Tests vocabulary/phrases array structure
   - Tests optional fields acceptance

2. **content-loading.test.ts** - Tests actual file loading
   - Verifies all activity files are readable
   - Checks frontmatter parsing (uses gray-matter)
   - Verifies specific activity data (thanksgiving-gratitude, counting-game, mid-autumn-story)
   - Tests filtering by category, difficulty, skills
   - Checks for unique slugs

**Key Dependencies:**
- vitest: ^4.0.13
- gray-matter: ^4.0.3 (for markdown frontmatter parsing)
- zod: ^3.25.76 (schema validation)

**Commands:**
```bash
npm run test:unit        # Run unit tests
npm run test:unit:ui     # Run with UI
```

### Integration Tests (Playwright)

**Configuration:** `/Users/anna/Documents/websites/mandarin-playbook/playwright.config.js`
```javascript
{
  testDir: './src/tests/integration',
  baseURL: 'http://localhost:4321',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
  reporter: 'html'
}
```

**Test File:** `activity-detail.spec.ts`

Tests verify:
- Page loads (HTTP 200)
- Correct activity title displays
- Metadata fields visible (Age, Duration, Level)
- Vocabulary section rendering with Chinese/pinyin/English
- Phrases section rendering
- Supplies list display
- Printable download link
- Markdown content rendering with proper heading structure
- Tags section display
- Navigation back to homepage
- Proper page title
- 404 for non-existent slugs
- No console errors

**Commands:**
```bash
npm run test:integration  # Run integration tests
npm run test:all         # Run both unit and integration tests
```

---

## 6. Component Props Reference

### All Components Summary

| Component | Props | Input Type | Optional | Notes |
|-----------|-------|-----------|----------|-------|
| VocabCard | `items` | `VocabItem[]` | No | Displays Chinese, pinyin, English for each word |
| PhrasesCard | `items` | `PhraseItem[]` | No | Same structure as VocabCard |
| SuppliesCard | `items` | `string[]` | No | Simple string array of supply names |
| InstructionsCard | `Content` | `any` (rendered Component) | No | Pass the `Content` component from activity.render() |
| TipsCard | `tips` | `string[]` | Yes | Only renders if tips array provided |

### VocabItem / PhraseItem Interface

```typescript
interface VocabItem {
  simplified: string;        // Simplified Chinese characters (required)
  traditional?: string;      // Traditional Chinese (optional)
  pinyin: string;           // Romanization with tones (required)
  english: string;          // English translation (required)
}
```

---

## 7. Data Files Location

- **Activity Content:** `/Users/anna/Documents/websites/mandarin-playbook/src/content/activities/`
  - `thanksgiving-gratitude.md` (Full featured)
  - `counting-game.md` (Minimal)
  - `mid-autumn-story.md` (With printable)

- **Components:** `/Users/anna/Documents/websites/mandarin-playbook/src/components/`
  - `VocabCard.astro`
  - `PhrasesCard.astro`
  - `SuppliesCard.astro`
  - `InstructionsCard.astro`
  - `TipsCard.astro`

- **Pages:** `/Users/anna/Documents/websites/mandarin-playbook/src/pages/`
  - `activities/[slug].astro` (Dynamic activity detail page)
  - `index.astro` (Homepage)

- **Tests:** `/Users/anna/Documents/websites/mandarin-playbook/src/tests/`
  - `unit/content-schema.test.ts`
  - `unit/content-loading.test.ts`
  - `integration/activity-detail.spec.ts`
  - `integration/homepage.spec.ts`

---

## 8. Key Styling Colors & Patterns

### Color Scheme
- **Primary/Accent:** #c41e3a (Red - used in headings, borders, links)
- **Secondary Accent:** #d97706 (Orange - used in Tips card)
- **Text:** #333 (dark gray), #555 (lighter gray), #666 (even lighter)
- **Backgrounds:** #fff (white), #f9fafb (light gray), #f3f4f6 (medium gray), #fff7e6 (cream for tips)
- **Borders:** #e5e7eb (light border), #eee (divider lines)

### Card Styling (Base `.card` class)
```css
border: 2px solid #333;
border-radius: 12px;
padding: 1.5rem (mobile) / 2rem (desktop);
margin-bottom: 1.5rem;
background: #fff;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Heading Styling (All cards h2)
```css
font-size: 1.5rem (mobile) / 1.75rem (desktop);
color: #c41e3a;
border-bottom: 2px solid #c41e3a;
padding-bottom: 0.5rem;
margin-bottom: 1rem;
```

---

## 9. Testing Approach Summary

### What's Tested

**Unit Tests (Vitest):**
- Schema validation (Zod)
- File loading and parsing
- Data structure compliance
- Filtering capabilities

**Integration Tests (Playwright):**
- Page rendering
- Component visibility
- Content structure (headings, lists, links)
- Navigation flow
- CSS class names and selectors
- Link attributes and behavior
- Browser console errors

### CSS Classes Used in Tests

Components are selected by these classes:
- `.vocab-card` - VocabCard
- `.phrases-card` - PhrasesCard
- `.supplies-card` - SuppliesCard
- `.instructions-card` - InstructionsCard
- `.tips-card` - TipsCard
- `.printable` - Printable section
- `.tags-section` - Tags section
- `.metadata` - Metadata section
- `.activity-header` - Header section

---

## 10. Key Takeaways for Component Development

1. **All data types are well-defined** in `src/content/config.ts` - follow the Zod schema
2. **Components receive structured props** - all data comes from frontmatter as typed objects
3. **Consistent card styling** - use the `.card` and `h2` classes for consistency
4. **Responsive design is built-in** - all components scale from mobile to desktop
5. **Conditional rendering pattern** - check if optional data exists before rendering (like TipsCard)
6. **Global CSS for markdown** - use `:global()` selector for InstructionsCard-like components
7. **CSS in components** - no external stylesheets; all styling is scoped within Astro files
8. **Testing coverage** - both schema validation and integration tests verify component output
9. **Component dependency** - InstructionsCard receives the rendered markdown Content prop, not raw markdown
10. **Usage order matters** - components are rendered in a specific order in [slug].astro
