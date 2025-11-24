# Codebase Exploration Complete

## What I Found

I've completed a thorough exploration of your Mandarin Playbook codebase and created comprehensive documentation in this directory.

---

## Key Findings Summary

### 1. Data Structure - Well Defined
The project uses Zod schema validation with a clear data structure:

**Required Fields:**
- title, description, ageRange, duration
- category (enum: game, craft, story, song, festival, food, other)
- difficultyLevel (enum: beginner, intermediate, advanced)
- skills (array: listening, speaking, reading, writing, cultural)

**Optional Fields:**
- vocabulary: Array of {simplified, traditional?, pinyin, english}
- phrases: Array of {simplified, traditional?, pinyin, english}
- supplies: Array of strings
- printable: {title, url}
- tips: Array of strings
- tags: Array of strings

### 2. Components - 5 Existing, Consistent Pattern
All components follow the same pattern:

| Component | Input | Purpose | Status |
|-----------|-------|---------|--------|
| VocabCard | VocabItem[] | Display vocabulary | Complete |
| PhrasesCard | PhraseItem[] | Display phrases | Complete |
| SuppliesCard | string[] | List supplies | Complete |
| InstructionsCard | Content | Render markdown | Complete |
| TipsCard | string[] | Display tips | Complete |

### 3. Testing - Comprehensive Coverage
- **19 Unit Tests** (Vitest): Schema validation, content loading
- **15+ Integration Tests** (Playwright): Page rendering, component visibility
- **100% Pass Rate**: All tests currently passing
- Test commands: `npm run test:unit`, `npm run test:integration`, `npm run test:all`

### 4. File Organization - Clean Structure
```
src/content/config.ts          ← Schema definitions
src/content/activities/*.md    ← Activity markdown files
src/components/*.astro         ← 5 reusable components
src/pages/activities/[slug].astro ← Dynamic route template
src/tests/                     ← Comprehensive tests
```

### 5. Technology Stack
- **Astro**: Static site generation
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **Vitest**: Unit testing
- **Playwright**: Integration testing
- **Markdown**: Content format

---

## What You Can Do With This Information

### Build New Components
You understand the exact data format each component receives. All data is typed and validated before reaching components.

### Add Features
The data schema is extensible. You can add new optional fields following the existing pattern.

### Test Confidently
There's a solid testing foundation. New components can be tested with the same patterns.

### Maintain Consistency
You know the styling patterns, responsive breakpoints, color palette, and component structure.

### Troubleshoot Effectively
You have documentation of the complete data flow from markdown files through rendering.

---

## The Documentation Files

### START HERE: README.md
Quick navigation and overview of all documents.

### 01-CODEBASE-OVERVIEW.md
Complete reference covering:
- Data structures with examples
- All 5 components in detail
- Page structure and routing
- TypeScript types
- Testing setup
- Styling patterns

### 02-DATA-FLOW-AND-ARCHITECTURE.md
Visual understanding:
- Data flow diagrams
- Component hierarchy
- File organization
- Testing architecture
- Real examples with data
- Validation flow

### 03-QUICK-REFERENCE.md
Working guide with:
- Data format examples
- Component templates
- Code snippets
- Testing commands
- File paths
- Activity template

### 04-EXISTING-TESTS.md
Complete test documentation:
- All 19 unit tests detailed
- All 15+ integration tests detailed
- How to run tests
- Test maintenance guidelines
- CSS selectors used in tests

---

## Technical Insights

### Vocab and Phrases Are Identical
Both use the same structure: simplified, traditional?, pinyin, english

### Supplies Are Just Strings
No complex structure needed - just an array of supply names

### Tips Was Recently Added
The TipsCard component was added in commit a20ee80, showing the system is actively evolving

### Three Example Activities
1. **thanksgiving-gratitude**: Full featured (vocab, phrases, supplies)
2. **counting-game**: Minimal (no vocab/phrases)
3. **mid-autumn-story**: With printable PDF link

### Slug Generation is Automatic
Filename "thanksgiving-gratitude.md" becomes URL "/activities/thanksgiving-gratitude"

### Responsive Design Built-In
Everything scales from mobile (1.5rem) to desktop (2rem) at 768px breakpoint

### No External Stylesheets
All CSS is scoped within Astro components

### Markdown is Rendered
The markdown body is rendered to HTML, not passed as raw markdown

---

## What You Need to Know to Build New Components

1. **Props are typed** - Define a Props interface
2. **Use Astro.props** - Extract destructured props
3. **Add scoped CSS** - All styling within the component
4. **Follow card pattern** - Base class `.card` with consistent styling
5. **Responsive at 768px** - Mobile first, then desktop override
6. **Add tests** - Both unit tests and integration tests
7. **Use :global() for markdown** - When styling rendered content

---

## Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Testing
npm run test:unit
npm run test:unit:ui
npm run test:integration
npm run test:all
```

---

## Example: Adding a New Component

Based on the patterns I found, here's how you'd add a new component:

1. **Create component in `/src/components/NewCard.astro`**
   - Define Props interface
   - Receive data via Astro.props
   - Create HTML with .card and h2 classes
   - Add scoped CSS

2. **Add schema to `/src/content/config.ts`**
   - If it's new data type, add to Zod schema

3. **Import in `/src/pages/activities/[slug].astro`**
   - Add conditional check if optional
   - Pass data as props

4. **Add tests**
   - Unit test in content-schema.test.ts
   - Integration test in activity-detail.spec.ts

5. **Run `npm run test:all`**
   - All tests should pass

---

## Data Flow Summary

```
Markdown File (thanksgiving-gratitude.md)
    ↓
Frontmatter parsed (YAML → object)
    ↓
Zod schema validation
    ↓
Activity object with .data and .render()
    ↓
Template uses activity.data.vocabulary, activity.data.phrases, etc.
    ↓
Components receive typed props
    ↓
HTML rendered to browser
```

---

## The Testing Infrastructure is Solid

- Tests validate data structure
- Tests verify file loading
- Tests check all component rendering
- Tests verify navigation
- Tests check for console errors
- Tests are easy to extend

**Current state:** 19 unit + 15+ integration tests, 100% passing

---

## Your Next Steps

1. **Start with the README.md** - Get oriented
2. **Read 01-CODEBASE-OVERVIEW.md** - Full understanding
3. **Review 02-DATA-FLOW-AND-ARCHITECTURE.md** - Visual understanding
4. **Keep 03-QUICK-REFERENCE.md handy** - For quick lookups
5. **Reference 04-EXISTING-TESTS.md** - When modifying tests

---

## Summary

You now have complete documentation of:
- The exact data format for vocab, phrases, supplies, instructions, and tips
- How each component works with that data
- The complete testing infrastructure
- All TypeScript types and schema definitions
- The file organization and file paths
- How to build new components
- How to run and extend tests

Everything is documented in detail across 5 comprehensive markdown files in the `claude-exploration/` directory.
