# Data Flow and Component Architecture

## 1. Activity Data Flow Diagram

```
MARKDOWN FILE (thanksgiving-gratitude.md)
├── FRONTMATTER (YAML)
│   ├── title: "Thanksgiving Gratitude Circle"
│   ├── description: "..."
│   ├── ageRange: "4-10 years"
│   ├── duration: "20-30 minutes"
│   ├── category: "festival"
│   ├── difficultyLevel: "beginner"
│   ├── skills: ["speaking", "listening", "cultural"]
│   ├── vocabulary: [VocabItem[], VocabItem[], 1...]
│   ├── phrases: [PhraseItem[], PhraseItem[], ...]
│   ├── supplies: ["item1", "item2", ...]
│   ├── printable: { title: "...", url: "..." }
│   └── tags: ["thanksgiving", "gratitude", ...]
│
└── MARKDOWN BODY
    ├── ## Activity Instructions
    ├── ## Tips for Parents
    └── ## Cultural Connection

                    ↓ Parsed by Astro Content Collection ↓

ACTIVITY OBJECT in [slug].astro
├── activity.data {}  ← Frontmatter as object
│   ├── title, description, ageRange, duration
│   ├── category, difficultyLevel, skills
│   ├── vocabulary: VocabItem[]
│   ├── phrases: PhraseItem[]
│   ├── supplies: string[]
│   ├── printable: { title, url }
│   └── tags: string[]
│
└── activity.render() → { Content }  ← Markdown body rendered

                    ↓ Used in page template ↓

RENDERED HTML
├── <header class="activity-header">
│   ├── <h1>{activity.data.title}</h1>
│   ├── <p class="description">{activity.data.description}</p>
│   └── <div class="metadata">Age, Duration, Level</div>
│
├── {activity.data.vocabulary && <VocabCard items={activity.data.vocabulary} />}
├── {activity.data.phrases && <PhrasesCard items={activity.data.phrases} />}
├── {activity.data.supplies && <SuppliesCard items={activity.data.supplies} />}
├── {activity.data.printable && <div class="printable">...</div>}
├── <InstructionsCard Content={Content} />
└── {activity.data.tags && <div class="tags-section">...</div>}
```

---

## 2. Component Hierarchy and Props

```
[slug].astro (Page)
│
├── VocabCard.astro
│   └── Props: { items: VocabItem[] }
│       └── VocabItem: { simplified, traditional?, pinyin, english }
│
├── PhrasesCard.astro
│   └── Props: { items: PhraseItem[] }
│       └── PhraseItem: { simplified, traditional?, pinyin, english }
│
├── SuppliesCard.astro
│   └── Props: { items: string[] }
│
├── InstructionsCard.astro
│   └── Props: { Content: any }
│       └── Content: Rendered markdown component
│
└── TipsCard.astro (Conditional)
    └── Props: { tips: string[] }
```

---

## 3. File Organization

```
mandarin-playbook/
├── src/
│   ├── content/
│   │   ├── config.ts                    ← Zod schema definitions
│   │   └── activities/
│   │       ├── thanksgiving-gratitude.md
│   │       ├── counting-game.md
│   │       └── mid-autumn-story.md
│   │
│   ├── components/                      ← Card components
│   │   ├── VocabCard.astro
│   │   ├── PhrasesCard.astro
│   │   ├── SuppliesCard.astro
│   │   ├── InstructionsCard.astro
│   │   └── TipsCard.astro
│   │
│   ├── pages/
│   │   ├── index.astro                  ← Homepage
│   │   └── activities/
│   │       └── [slug].astro             ← Dynamic activity detail pages
│   │
│   └── tests/
│       ├── unit/
│       │   ├── content-schema.test.ts
│       │   └── content-loading.test.ts
│       └── integration/
│           ├── activity-detail.spec.ts
│           └── homepage.spec.ts
│
├── vitest.config.js                     ← Unit test configuration
├── playwright.config.js                 ← Integration test configuration
├── tsconfig.json                        ← TypeScript configuration
├── package.json                         ← Dependencies & scripts
└── README.md
```

---

## 4. Testing Architecture

```
UNIT TESTS (Vitest)
├── content-schema.test.ts
│   ├── Validates required fields
│   ├── Validates enum values
│   ├── Validates optional field structures
│   └── Tests activity data structure compliance
│
└── content-loading.test.ts
    ├── Loads all .md files from src/content/activities/
    ├── Parses YAML frontmatter with gray-matter
    ├── Validates each activity's data
    ├── Tests filtering by category, difficulty, skills
    └── Verifies unique slugs

        ↓ npm run test:unit ↓
        ↓ npm run test:unit:ui ↓

INTEGRATION TESTS (Playwright)
└── activity-detail.spec.ts
    ├── Tests page load (HTTP 200)
    ├── Tests metadata display (Age, Duration, Level)
    ├── Tests component rendering
    │   ├── VocabCard (class: .vocab-card)
    │   ├── PhrasesCard (class: .phrases-card)
    │   ├── SuppliesCard (class: .supplies-card)
    │   ├── InstructionsCard (class: .instructions-card)
    │   └── TipsCard (class: .tips-card)
    ├── Tests content structure (headings, lists, links)
    ├── Tests navigation
    └── Tests page title and 404 handling

        ↓ npm run test:integration ↓

TEST COMMANDS
└── npm run test:all  ← Runs both unit and integration tests
```

---

## 5. Component Prop Flow Example

### VocabCard Example
```
Data in activity frontmatter:
─────────────────────────────
vocabulary:
  - simplified: "感恩节"
    pinyin: "gǎn'ēn jié"
    english: "Thanksgiving"
  - simplified: "感谢"
    pinyin: "gǎnxiè"
    english: "to thank, to be grateful"

           ↓ Parsed to VocabItem[] ↓

{activity.data.vocabulary && <VocabCard items={activity.data.vocabulary} />}

           ↓ Props passed ↓

VocabCard.astro receives:
─────────────────────────
interface Props {
  items: VocabItem[];
}

const { items } = Astro.props;

// items = [
//   { simplified: "感恩节", pinyin: "gǎn'ēn jié", english: "Thanksgiving" },
//   { simplified: "感谢", pinyin: "gǎnxiè", english: "to thank, to be grateful" }
// ]

           ↓ Rendered ↓

HTML Output:
────────────
<div class="vocab-card card">
  <h2>Vocabulary</h2>
  <ul class="vocab-list">
    <li class="vocab-item">
      <div class="chinese">
        <span class="simplified">感恩节</span>
      </div>
      <div class="pinyin">gǎn'ēn jié</div>
      <div class="english">Thanksgiving</div>
    </li>
    <li class="vocab-item">
      <div class="chinese">
        <span class="simplified">感谢</span>
      </div>
      <div class="pinyin">gǎnxiè</div>
      <div class="english">to thank, to be grateful</div>
    </li>
  </ul>
</div>
```

---

## 6. InstructionsCard Special Case

```
[slug].astro:
─────────────

Step 1: Render activity
const { Content } = await activity.render();

Step 2: Pass Content component as prop
<InstructionsCard Content={Content} />

InstructionsCard.astro:
──────────────────────
interface Props {
  Content: any;  ← Astro component, not a string
}

const { Content } = Astro.props;

<div class="instructions-card card">
  <h2>Activity Instructions</h2>
  <div class="instructions-content">
    <Content />  ← Renders the markdown HTML
  </div>
</div>

Style nested markdown elements with :global():
────────────────────────────────────────────────
.instructions-content :global(h2) { ... }
.instructions-content :global(ul) { ... }
.instructions-content :global(li) { ... }
// etc.
```

---

## 7. Conditional Rendering Pattern

### TipsCard Example (Optional)
```
[slug].astro:
─────────────
{activity.data.tips && <TipsCard tips={activity.data.tips} />}

↓ Only renders if tips array exists ↓

TipsCard.astro:
────────────────
interface Props {
  tips?: string[];  ← Optional prop
}

const { tips } = Astro.props;

{tips && (
  <div class="tips-card card">
    <h2>Tips for Parents</h2>
    <ul class="tips-list">
      {tips.map((tip) => (
        <li class="tip-item">{tip}</li>
      ))}
    </ul>
  </div>
)}

// If tips is undefined/null, nothing renders
```

---

## 8. Schema Validation Flow

```
Activity YAML Frontmatter
         ↓
Parsed to JavaScript object
         ↓
Zod Schema Validation (in src/content/config.ts)
         ↓
     ┌─────────────┬─────────────┐
     │  Valid      │   Invalid   │
     ↓             ↓
  Used in       Build Error
  components     (prevents invalid data)
```

### Example Validation Rules
```typescript
// Required - must be present
title: z.string(),              // Must exist and be a string
description: z.string(),
category: z.enum([...]),        // Must be one of these values
difficultyLevel: z.enum([...]), // Must be one of these values

// Optional - can be missing, but if present must be valid
vocabulary: z.array(z.object({
  simplified: z.string(),       // Required if vocabulary exists
  traditional: z.string(),      // Optional
  pinyin: z.string(),          // Required if vocabulary exists
  english: z.string(),         // Required if vocabulary exists
})).optional(),

supplies: z.array(z.string()).optional(),  // Array of strings or undefined

printable: z.object({           // Object with required fields or undefined
  title: z.string(),
  url: z.string(),
}).optional(),
```

---

## 9. Responsive Design Breakpoint

All components follow this pattern:
```css
/* Mobile (default) */
.card {
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
}

/* Desktop (768px and up) */
@media (min-width: 768px) {
  .card {
    padding: 2rem;  ← Increased padding
  }

  h2 {
    font-size: 1.75rem;  ← Larger heading
  }
}
```

---

## 10. Activity Slug Generation

```
File: thanksgiving-gratitude.md
       ↓ (automatically)
Slug: thanksgiving-gratitude
       ↓
URL: /activities/thanksgiving-gratitude
       ↓
Route: [slug].astro with params.slug = "thanksgiving-gratitude"
       ↓
getStaticPaths() returns:
{
  params: { slug: "thanksgiving-gratitude" },
  props: { activity: {...} }
}
```
