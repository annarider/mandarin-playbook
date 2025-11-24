# Mandarin Playbook Codebase Exploration

This directory contains comprehensive documentation of the Mandarin Playbook codebase structure, data formats, components, and testing infrastructure.

## Business Context

### Purpose
This application solves the challenge of **teaching Mandarin speaking skills through play** for families without access to immersion environments. It's an alternative to formal curricula, online tutoring, and textbook-based learning—focusing instead on natural language acquisition through songs, games, and interactive activities. 

It's designed to be a helpful cue card for non-native Mandarin speakers trying to teach kids to speak in Mandarin. It reduces the mental energy to remember vocabulary and phrasing as well as boosting the speaking skills of the teacher. 

**What it does:**
- Provides daily play-based activities that embed Mandarin speaking practice
- Offers vocabulary, sample phrases, and activity instructions optimized for active play
- Works for young kids (under 5) with short attention spans AND older kids who resist traditional learning methods

### Key Priorities
1. **Engagement through play** — Activities must be genuinely fun, not disguised worksheets
2. **Speaking focus** — Prioritizes oral production and comprehension over reading/writing
3. **Low barriers** — Activities work with minimal prep, materials, or child cooperation

### Success Metrics
- Kids voluntarily use Mandarin phrases during activities
- Parent can execute activities without extensive planning
- Kids request specific activities repeatedly
- Observable increase in spontaneous Mandarin speech

### Pain Points Being Solved
- **Rejection of formal learning** — Kids won't sit for tutoring sessions or workbooks
- **Artificial context** — Traditional methods feel disconnected from real play
- **Parent burden** — Creating play-based language activities from scratch is time-intensive
- **Monolingual environment** — No natural opportunities for Mandarin conversation

### Constraints & Design Priorities
- **Mobile-first** — Parent accesses during active play sessions
- **Quick cognitive load** — Parent can scan a card and start activity in 30 seconds
- **Variety** — Enough diverse activities to prevent boredom over months of use
- **Expandable** — Can add Cantonese content, progress tracking, community contributions

## Files in this Directory

### 01-CODEBASE-OVERVIEW.md
**Main reference document for understanding the project**

Covers:
- Activity data structure and schema (Zod)
- Example activity (Thanksgiving Gratitude) with real data
- All five components (VocabCard, PhrasesCard, SuppliesCard, InstructionsCard, TipsCard)
- Page structure and dynamic routing
- TypeScript configuration
- Testing infrastructure overview
- Component props reference
- Key styling colors and patterns

**Start here** for a complete understanding of how the project works.

---

### 02-DATA-FLOW-AND-ARCHITECTURE.md
**Visual diagrams and flow documentation**

Covers:
- Activity data flow from markdown file to rendered HTML
- Component hierarchy and props relationships
- File organization diagram
- Testing architecture
- Component prop flow examples with real data
- InstructionsCard special case (markdown rendering)
- Conditional rendering patterns
- Schema validation flow
- Responsive design patterns
- Activity slug generation

**Reference this** when implementing components to understand data flow.

---

### 03-QUICK-REFERENCE.md
**Fast lookup guide for common tasks**

Covers:
- Data format examples (vocabulary, phrases, supplies, printable)
- Component quick reference table
- Adding tips to an activity (3-step process)
- Component import statements
- Testing commands
- CSS class names
- Activity file template
- Common code snippets
- File paths reference
- Validation rules summary
- Color palette reference
- 10 key points to remember

**Use this** for quick lookups while coding.

---

### 04-EXISTING-TESTS.md
**Complete test documentation**

Covers:
- Unit tests (Vitest) - 19 test cases
  - content-schema.test.ts (14 tests)
  - content-loading.test.ts (11 tests)
- Integration tests (Playwright) - 15+ test cases
  - activity-detail.spec.ts comprehensive coverage
- CSS class selectors used in tests
- How to run tests
- Test results interpretation
- Test maintenance guidelines
- Dependencies

**Review this** before modifying tests or adding new components.

---

## Quick Start

### Understanding the Project
1. Read **01-CODEBASE-OVERVIEW.md** for the complete picture
2. Review **02-DATA-FLOW-AND-ARCHITECTURE.md** for visual understanding
3. Keep **03-QUICK-REFERENCE.md** handy while coding

### Building Components
1. Check **03-QUICK-REFERENCE.md** for component usage patterns
2. Review existing components in `src/components/`
3. Follow the data format examples in **01-CODEBASE-OVERVIEW.md**
4. Test using patterns in **04-EXISTING-TESTS.md**

### Running Tests
```bash
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:all         # Run all tests
```

---

## Key Insights

### Data Format
- All activities are markdown files in `src/content/activities/`
- Frontmatter (YAML) contains metadata and structured data
- Markdown body contains instructions and content
- Data is validated against Zod schema in `src/content/config.ts`

### Components
- Five reusable card components
- All follow consistent styling pattern
- Responsive design (mobile-first)
- Props are fully typed with TypeScript
- Conditional rendering for optional data

### Testing
- Comprehensive unit tests (schema validation, data loading)
- Full integration tests (page rendering, component visibility)
- All tests currently passing
- Easy to extend with new tests

### Styling
- Scoped CSS within Astro components
- Consistent color scheme (#c41e3a primary, #d97706 secondary)
- Responsive breakpoint at 768px
- Global CSS for markdown content using `:global()` selector

---

## File Structure Reference

```
src/
├── content/
│   ├── config.ts                    ← Schema definitions
│   └── activities/*.md              ← Activity files
├── components/
│   ├── VocabCard.astro
│   ├── PhrasesCard.astro
│   ├── SuppliesCard.astro
│   ├── InstructionsCard.astro
│   └── TipsCard.astro
├── pages/
│   ├── index.astro
│   └── activities/[slug].astro
└── tests/
    ├── unit/
    │   ├── content-schema.test.ts
    │   └── content-loading.test.ts
    └── integration/
        └── activity-detail.spec.ts
```

---

## Common Tasks

### Adding a New Activity
1. Create markdown file in `src/content/activities/`
2. Add required frontmatter (title, description, category, etc.)
3. Add optional fields as needed (vocabulary, phrases, supplies, tips)
4. Write activity instructions in markdown body
5. Route automatically generated from filename

### Creating a New Component
1. Create `.astro` file in `src/components/`
2. Define Props interface
3. Add scoped CSS with `.card` and `h2` classes
4. Follow responsive design pattern (@media 768px)
5. Import and use in `src/pages/activities/[slug].astro`
6. Add integration tests to verify rendering

### Modifying Schema
1. Update `src/content/config.ts`
2. Update unit tests in `src/tests/unit/content-schema.test.ts`
3. Update integration tests if needed
4. Run `npm run test:all` to verify

---

## Component Props Summary

| Component | Props | Type | Required |
|-----------|-------|------|----------|
| VocabCard | items | VocabItem[] | Yes |
| PhrasesCard | items | PhraseItem[] | Yes |
| SuppliesCard | items | string[] | Yes |
| InstructionsCard | Content | any | Yes |
| TipsCard | tips | string[] | No |

**VocabItem / PhraseItem:**
```typescript
{
  simplified: string;
  traditional?: string;
  pinyin: string;
  english: string;
}
```

---

## Color Palette

- Primary: #c41e3a (red - headings, borders, links)
- Secondary: #d97706 (orange - tips accent)
- Text: #333, #555, #666 (varying grays)
- Backgrounds: #fff, #f9fafb, #f3f4f6, #fff7e6
- Borders: #e5e7eb, #eee

---

## Testing Summary

**Total Tests: 34**
- Unit Tests: 19 (Vitest)
- Integration Tests: 15+ (Playwright)
- Pass Rate: 100%

**Run Tests:**
```bash
npm run test:unit        # 30-60 seconds
npm run test:integration # 120+ seconds
npm run test:all         # Both
```

---

## Useful Links in Code

- Schema: `/src/content/config.ts`
- Activities: `/src/content/activities/`
- Components: `/src/components/`
- Page Template: `/src/pages/activities/[slug].astro`
- Tests: `/src/tests/`

---

## Next Steps

1. Review `01-CODEBASE-OVERVIEW.md` to understand the architecture
2. Look at existing components in `src/components/` to see patterns
3. Check `04-EXISTING-TESTS.md` to understand test structure
4. Use `03-QUICK-REFERENCE.md` as your working guide
5. Refer to `02-DATA-FLOW-AND-ARCHITECTURE.md` when troubleshooting

Good luck with your development!
