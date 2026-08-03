## ADDED Requirements

### Requirement: Guided chapter choice after cleanup

The guided OpenStax book translation flow SHALL prompt for chapter scope after scrape and cleanup complete and before term extraction, prep, text translation, and image translation begin.

### Requirement: All chapters option

The chapter-scope prompt SHALL offer an explicit all-chapters option that translates every detected clean HTML file for the selected book.

### Requirement: Specific chapter selection

The chapter-scope prompt SHALL offer one selectable option per detected chapter, and choosing one or more chapter options SHALL scope term extraction, prep, text translation, and image translation to only files belonging to those selected chapters.

### Requirement: Specific selections are not masked by all

If the prompt result contains both the all-chapters sentinel and one or more specific chapter selections, the system MUST resolve the ambiguity deterministically so the user does not accidentally translate all chapters after choosing specific chapters.

### Requirement: Chapter detection fallback

If no chapters can be detected from cleaned HTML file names, the guided flow SHALL skip per-chapter choice and translate all cleaned HTML files.

### Requirement: Existing output is not pruned

Selecting specific chapters SHALL scope the current translation pipeline work only and MUST NOT delete or prune previously translated chapter files, built site output, or remote R2 objects.

### Requirement: Guided image review items do not abort pipeline

The guided interactive translation flow SHALL allow the image translation script to report review items without aborting the remaining build and upload steps, because original image references are preserved for images that require review.

### Requirement: Existing scraped data prompt

When the guided OpenStax book translation flow detects existing scraped raw HTML data for the selected book before running the scrape step, it SHALL ask the user whether to skip scraping or scrape again.

### Requirement: Skip scrape preserves downstream flow

If the user chooses to skip scraping because scraped raw data already exists, the guided flow SHALL continue with cleanup, chapter selection, term extraction, prep, translation, build, and upload using the existing local scraped data.

### Requirement: Cleanup progress is compact

The cleanup step SHALL avoid printing one terminal line per image or HTML file during normal operation and SHALL instead show a concise title plus progress updates suitable for large books.

### Requirement: Existing cleaned data prompt

When the guided OpenStax book translation flow detects existing cleaned HTML data for the selected book before running the cleanup step, it SHALL ask the user whether to skip cleanup or run cleanup again.

### Requirement: Skip cleanup preserves downstream flow

If the user chooses to skip cleanup because cleaned HTML data already exists, the guided flow SHALL continue with chapter selection, term extraction, prep, translation, build, and upload using the existing local cleaned data.

### Requirement: Guided pipeline child logs are compact

During normal guided interactive translation, child script output SHALL NOT emit unbounded per-file or per-fragment log lines to the terminal; the guided flow SHALL show step titles and progress updates instead, while still surfacing detailed child output if a child script fails.

### Requirement: Image translation summary remains visible

When guided image translation completes with review or error items, the guided flow SHALL print a concise summary so the user knows image review is needed while still continuing when the image script exits successfully.
