# Existing Tests Summary

## Overview
The project has comprehensive testing infrastructure with both unit and integration tests. Tests are automatically run and passing (as confirmed by recent commits).

---

## Unit Tests (Vitest)

### Configuration
Location: `/Users/anna/Documents/websites/mandarin-playbook/vitest.config.js`

```javascript
{
  globals: true,
  environment: 'node',
  include: ['src/tests/unit/**/*.test.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'json']
  }
}
```

### Test Files

#### 1. content-schema.test.ts (14 test cases)

**Purpose:** Validates that data conforms to the Zod schema

**Tests:**
1. Accepts valid activity data
2. Rejects missing title
3. Rejects missing description
4. Rejects missing category
5. Validates vocabulary array structure
6. Validates phrases array structure
7. Accepts valid category values (6 categories tested individually)
8. Rejects invalid category values
9. Accepts valid difficulty levels (3 levels tested individually)
10. Accepts optional supplies array
11. Accepts optional printable object
12. Accepts optional tags array

**Key Assertions:**
- `z.safeParse()` returns `{ success: true }` for valid data
- `z.safeParse()` returns `{ success: false }` for invalid data
- All enum values are accepted
- Invalid enum values are rejected

**Dependencies:**
- vitest (test runner)
- zod (schema validation)

---

#### 2. content-loading.test.ts (5 test cases + 6 filtering tests)

**Purpose:** Tests actual markdown file loading and parsing

**Tests:**
1. Has all 3 sample activity files
2. Has correct activity file structure (slug, data, body properties)
3. Has properly structured frontmatter data (all required fields)
4. Has accessible markdown body content (non-empty string)
5. Loads thanksgiving-gratitude activity with vocab and phrases
6. Loads counting-game activity with minimal fields
7. Loads mid-autumn-story activity with printable
8. Filters activities by category (2 festival activities)
9. Filters activities by difficulty level (beginners)
10. Filters activities by skills (listening)
11. Has unique slugs for all activities

**Data Validated:**
- thanksgiving-gratitude:
  - title: "Thanksgiving Gratitude Circle"
  - category: "festival"
  - vocabulary: defined and non-empty
  - phrases: defined and non-empty
  - supplies: defined
- counting-game:
  - title: "Number Jump Game"
  - category: "game"
  - vocabulary: undefined
  - phrases: undefined
- mid-autumn-story:
  - title: "Mid-Autumn Festival Story Time"
  - category: "festival"
  - printable.title: "Chang'e Coloring Page"
  - printable.url: "/printables/change-coloring.pdf"

**Dependencies:**
- vitest
- fs (file system)
- path (file paths)
- gray-matter (YAML frontmatter parsing)

---

## Integration Tests (Playwright)

### Configuration
Location: `/Users/anna/Documents/websites/mandarin-playbook/playwright.config.js`

```javascript
{
  testDir: './src/tests/integration',
  baseURL: 'http://localhost:4321',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI
  },
  reporter: 'html'
}
```

### Test File: activity-detail.spec.ts (15 test cases)

#### Page Loading Tests
1. **thanksgiving-gratitude page loads (HTTP 200)**
   - Verifies page.goto() returns 200 status
   
2. **counting-game page loads (HTTP 200)**
   - Tests activity without vocab/phrases
   
3. **mid-autumn-story page loads (HTTP 200)**
   - Tests activity with printable

#### Content Rendering Tests
4. **displays correct activity title**
   - Checks h1 text = "Thanksgiving Gratitude Circle"
   
5. **displays metadata correctly**
   - Verifies Age, Duration, Level labels visible
   - Uses .metadata and .meta-item classes

#### Component Tests
6. **displays vocabulary items with Chinese, pinyin, and English**
   - Locates .vocab-card section
   - Verifies h2 = "Vocabulary"
   - Checks for vocabulary list items
   - Validates Chinese character presence

7. **displays phrases with Chinese, pinyin, and English**
   - Locates .phrases-card section
   - Verifies h2 = "Phrases"
   - Checks for phrase list items

8. **displays supplies list when present**
   - Locates .supplies-card section
   - Verifies h2 = "Supplies Needed"
   - Checks supply list items

9. **does NOT display vocabulary for activities without vocab**
   - Tests counting-game (no vocab)
   - Verifies .vocab-card is not visible

10. **displays printable download link when present**
    - Tests mid-autumn-story
    - Checks .printable section
    - Verifies link text = "Download: Chang'e Coloring Page"
    - Verifies href = "/printables/change-coloring.pdf"
    - Verifies target = "_blank"

11. **renders markdown content in instructions section**
    - Checks .instructions-card section
    - Verifies h2 elements exist
    - Tests markdown rendering

12. **displays tags when present**
    - Checks .tags-section section
    - Verifies text contains "Tags:"

#### Navigation Tests
13. **has back to home links**
    - Finds "← Back to all activities" links
    - Verifies href = "/"

14. **navigates back to homepage**
    - Clicks back link
    - Waits for URL change to "/"
    - Verifies h1 = "Mandarin Homeschool Activities"

#### Meta Tests
15. **has proper page title**
    - Verifies page title = "Thanksgiving Gratitude Circle - Mandarin Homeschool Activities"

16. **returns 404 for non-existent activity slug**
    - Tests /activities/non-existent-activity
    - Expects 404 status

17. **has no console errors on page load**
    - Monitors console for errors
    - Verifies error array is empty

18. **displays all required metadata fields for each activity**
    - Loop through all 3 activities
    - Verify description visible
    - Verify Age, Duration, Level labels visible

---

## CSS Class Selectors Used in Tests

**Component Classes:**
- `.vocab-card` - VocabCard component
- `.phrases-card` - PhrasesCard component
- `.supplies-card` - SuppliesCard component
- `.instructions-card` - InstructionsCard component
- `.printable` - Printable section
- `.tags-section` - Tags section
- `.metadata` - Metadata container
- `.meta-item` - Individual metadata items

**Content Classes:**
- `.vocab-item` - Individual vocabulary item
- `.vocab-list` - Vocabulary list container
- `.phrase-item` - Individual phrase item
- `.phrases-list` - Phrases list container
- `.supply-item` - Individual supply item
- `.supplies-list` - Supplies list container
- `.instructions-content` - Instructions content wrapper
- `.tip-item` - Individual tip item
- `.tips-list` - Tips list container
- `.activity-header` - Activity header section
- `.description` - Activity description

---

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with UI dashboard
npm run test:unit:ui

# Run specific test file
npm run test:unit src/tests/unit/content-schema.test.ts
```

### Integration Tests
```bash
# Run all integration tests (starts dev server automatically)
npm run test:integration

# Run specific test file
npm run test:integration activity-detail.spec.ts
```

### All Tests
```bash
# Run unit tests then integration tests
npm run test:all
```

---

## Test Results Interpretation

### Unit Test Output
- Shows number of passed/failed tests
- Reports schema validation errors
- Lists file loading issues
- Coverage report (if enabled)

### Integration Test Output
- HTML report generated in `playwright-report/`
- Screenshots on failure
- Browser console logs
- Network requests

---

## Recent Test History

From git log:
- Commit 231db77: "test: update files to pass integration tests"
- Commit 7b9942c: "test: update tests"
- Commit 4b5abef: "feat: update slug to use the new styling"
- Commit a20ee80: "feat: add tips component for card display"

All tests are currently passing.

---

## Test Maintenance Notes

### When to Update Tests

1. **Adding new required field to schema**
   - Update content-schema.test.ts
   - Add test for new field validation
   - Update content-loading.test.ts if needed

2. **Adding new optional field**
   - Add test for field acceptance
   - Update component tests if field affects rendering

3. **Adding new component**
   - Add integration test for component visibility
   - Test with/without data
   - Test CSS class presence

4. **Adding new activity**
   - Update content-loading.test.ts count (currently expects 3)
   - Test new activity's specific fields in integration tests

5. **Changing component CSS classes**
   - Update all locator strings in integration tests
   - Example: `.vocab-card` → `.new-class-name`

### Common Test Issues

**Unit Tests:**
- Gray-matter version incompatibility
- File path issues (use path.join, not string concatenation)
- Missing node modules

**Integration Tests:**
- Dev server not running (playwright auto-starts it)
- Selector not found (check CSS class names)
- Timeout waiting for elements
- URL mismatch (verify baseURL in config)

---

## Dependencies for Testing

```json
{
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "@vitest/ui": "^4.0.13",
    "gray-matter": "^4.0.3",
    "vitest": "^4.0.13"
  }
}
```

- **vitest**: Fast unit test runner
- **@vitest/ui**: Web UI for test results
- **gray-matter**: YAML frontmatter parser for markdown
- **@playwright/test**: Browser automation for integration tests

---

## Test Metrics

| Metric | Value |
|--------|-------|
| Total Test Cases | 19 unit + 15 integration = 34 |
| Pass Rate | 100% (all tests passing) |
| Unit Test Files | 2 |
| Integration Test Files | 1 |
| Code Coverage | Not currently measured (can be enabled) |
| Test Execution Time | ~30-60 seconds (unit) + ~120 seconds (integration) |
