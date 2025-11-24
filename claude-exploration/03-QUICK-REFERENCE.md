# Quick Reference Guide

## Data Formats at a Glance

### Vocabulary Item
```typescript
{
  simplified: "感恩",
  traditional?: "感恩",      // Optional
  pinyin: "gǎn'ēn",
  english: "gratitude"
}
```

### Phrase Item
```typescript
{
  simplified: "我很感谢",
  traditional?: "我很感謝",  // Optional
  pinyin: "wǒ hěn gǎnxiè",
  english: "I am very grateful"
}
```

### Supply Item
```
"Paper and markers"  // Just a string
```

### Printable Object
```typescript
{
  title: "Coloring Page",
  url: "/printables/coloring.pdf"
}
```

---

## Component Quick Reference

### When to use each component

| Component | Use When | Input | Required? |
|-----------|----------|-------|-----------|
| **VocabCard** | Activity has vocabulary words to teach | `VocabItem[]` | No - check if exists |
| **PhrasesCard** | Activity has phrases to teach | `PhraseItem[]` | No - check if exists |
| **SuppliesCard** | Activity requires materials | `string[]` | No - check if exists |
| **InstructionsCard** | Activity has instructions (always) | `Content` | Yes - always include |
| **TipsCard** | Activity has parent tips (NEW) | `string[]` | No - check if exists |

---

## Adding Tips to an Activity

### Step 1: Update the schema (if not already done)
File: `/Users/anna/Documents/websites/mandarin-playbook/src/content/config.ts`

```typescript
tips: z.array(z.string()).optional(),
```

### Step 2: Add tips to activity frontmatter
```yaml
tips:
  - "Start with 1-5 for younger children"
  - "Make it silly and fun"
  - "Celebrate every attempt to speak Mandarin"
```

### Step 3: Import and use the component in [slug].astro
```astro
import TipsCard from '../../components/TipsCard.astro';

// In template:
{activity.data.tips && <TipsCard tips={activity.data.tips} />}
```

---

## Component Import Statements

All components are in `/src/components/`:

```astro
import VocabCard from '../../components/VocabCard.astro';
import PhrasesCard from '../../components/PhrasesCard.astro';
import SuppliesCard from '../../components/SuppliesCard.astro';
import InstructionsCard from '../../components/InstructionsCard.astro';
import TipsCard from '../../components/TipsCard.astro';
```

---

## Testing Commands

```bash
# Run all unit tests
npm run test:unit

# Run unit tests with UI
npm run test:unit:ui

# Run integration tests (requires dev server)
npm run test:integration

# Run everything
npm run test:all
```

---

## CSS Class Names (for tests and styling)

Components generate these class names:

```html
<!-- VocabCard -->
<div class="vocab-card card">
  <ul class="vocab-list">
    <li class="vocab-item">
      <div class="chinese">
        <span class="simplified">中文</span>
        <span class="traditional">(繁體)</span>
      </div>
      <div class="pinyin">pīnyīn</div>
      <div class="english">English</div>
    </li>
  </ul>
</div>

<!-- PhrasesCard -->
<div class="phrases-card card">
  <ul class="phrases-list">
    <li class="phrase-item">...</li>
  </ul>
</div>

<!-- SuppliesCard -->
<div class="supplies-card card">
  <ul class="supplies-list">
    <li class="supply-item">...</li>
  </ul>
</div>

<!-- InstructionsCard -->
<div class="instructions-card card">
  <div class="instructions-content">
    <!-- Rendered markdown here -->
  </div>
</div>

<!-- TipsCard (conditional) -->
<div class="tips-card card">
  <ul class="tips-list">
    <li class="tip-item">💡 Tip text</li>
  </ul>
</div>
```

---

## Activity File Template

Create new activities in `/src/content/activities/`:

```markdown
---
title: "Activity Name"
description: "Short description of the activity"
ageRange: "3-8 years"
duration: "15-20 minutes"
category: "game"  # game, craft, story, song, festival, food, other
difficultyLevel: "beginner"  # beginner, intermediate, advanced
skills: ["listening", "speaking"]  # listening, speaking, reading, writing, cultural

# Optional fields:
vocabulary:
  - simplified: "你好"
    traditional: "你好"  # optional
    pinyin: "nǐ hǎo"
    english: "hello"

phrases:
  - simplified: "你好吗"
    pinyin: "nǐ hǎo ma"
    english: "How are you?"

supplies:
  - "Paper"
  - "Markers"

printable:
  title: "Activity Sheet"
  url: "/printables/sheet.pdf"

tips:
  - "Keep it fun and interactive"
  - "Celebrate all attempts"

tags: ["greeting", "speaking", "beginner"]
---

## Activity Instructions

### Introduction
Your instructions here with markdown formatting.

### Steps
1. First step
2. Second step

## Tips for Parents

- Tip 1
- Tip 2
```

---

## Common Code Snippets

### Check if optional data exists before rendering
```astro
{activity.data.vocabulary && <VocabCard items={activity.data.vocabulary} />}
{activity.data.tips && <TipsCard tips={activity.data.tips} />}
```

### Loop through items
```astro
{items.map((item) => (
  <li>{item.simplified}</li>
))}
```

### Conditional rendering with fallback
```astro
{tips && (
  <div>Tips exist</div>
)}
{!tips && (
  <div>No tips provided</div>
)}
```

### Style nested markdown elements
```css
.instructions-content :global(h2) {
  font-size: 1.375rem;
  margin-top: 1.5rem;
}

.instructions-content :global(li) {
  margin-bottom: 0.5rem;
}
```

---

## File Paths Reference

```
Base: /Users/anna/Documents/websites/mandarin-playbook/

Content:
  src/content/config.ts                          ← Schema definitions
  src/content/activities/*.md                    ← Activity files

Components:
  src/components/VocabCard.astro
  src/components/PhrasesCard.astro
  src/components/SuppliesCard.astro
  src/components/InstructionsCard.astro
  src/components/TipsCard.astro

Pages:
  src/pages/index.astro                          ← Homepage
  src/pages/activities/[slug].astro              ← Activity detail page

Tests:
  src/tests/unit/content-schema.test.ts
  src/tests/unit/content-loading.test.ts
  src/tests/integration/activity-detail.spec.ts

Config:
  vitest.config.js
  playwright.config.js
  tsconfig.json
  package.json
```

---

## Validation Rules Summary

**Required for all activities:**
- title (string)
- description (string)
- ageRange (string, any format)
- duration (string, any format)
- category (enum: game, craft, story, song, festival, food, other)
- difficultyLevel (enum: beginner, intermediate, advanced)
- skills (array: listening, speaking, reading, writing, cultural)

**Optional:**
- vocabulary (array of objects with simplified, traditional?, pinyin, english)
- phrases (array of objects with simplified, traditional?, pinyin, english)
- supplies (array of strings)
- printable (object with title and url)
- tips (array of strings)
- tags (array of strings)
- relatedActivities (array of strings - not currently used)

---

## Color Reference

- **Primary Red:** #c41e3a (headings, borders, links)
- **Secondary Orange:** #d97706 (tips card accent)
- **Dark Text:** #333
- **Light Text:** #555, #666
- **Card Background:** #fff (white)
- **Page Background:** #f9fafb (light gray)
- **Section Background:** #f3f4f6 (medium gray)
- **Tips Background:** #fff7e6 (cream)

---

## Key Points to Remember

1. **Slugs auto-generate** from filename (thanksgiving-gratitude.md → /activities/thanksgiving-gratitude)
2. **Props are type-safe** - TypeScript will catch mismatches
3. **Components are isolated** - each has its own scoped styling
4. **Testing is important** - integrate tests before deploying new components
5. **Data shape matters** - follow the Zod schema exactly
6. **Responsive by default** - all components scale from mobile to desktop
7. **Markdown is rendered** - don't pass raw markdown strings to InstructionsCard
8. **Optional fields are truly optional** - use `&&` to check before rendering
9. **CSS uses :global()** - for styling content inside components
10. **No external CSS** - all styling is scoped within Astro files
