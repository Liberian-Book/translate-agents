## ADDED Requirements

### Requirement: Book-Scoped Termbase

The system SHALL generate a book-scoped termbase from the approved glossary before translation, containing separate `hardTerms`, `softPhrases`, `protectedTerms`, and `allowlist` collections.

#### Scenario: Known Entrepreneurship Terms

- **WHEN** the Entrepreneurship glossary contains entries for `franchise`, `franchisee`, and `Types of Entrepreneurs`
- **THEN** the generated termbase MUST preserve those source strings as enforceable entries with their approved Vietnamese targets.

### Requirement: Translation Termbase Consumption

The system SHALL include applicable hard terms, soft phrases, protected terms, and allowlist guidance in translation prompts before translating a block or fallback plain-text segment.

### Requirement: Deterministic Quality Gate

The system SHALL provide a deterministic QA command that scans translated Vietnamese blocks and reports segment-level failures for missing required target terms, forbidden source echoes, untranslated English leakage, and mixed bilingual fragments.

#### Scenario: Mixed Bilingual Fragment

- **WHEN** a Vietnamese segment contains a source phrase immediately combined with its Vietnamese translation, such as `calculated risk rủi ro`
- **THEN** the QA command MUST report that segment as a blocking mixed-language failure unless the English phrase is allowlisted.

### Requirement: Review And Export Gate

The workflow SHALL require the deterministic QA command to pass, or require an explicit documented waiver, before semantic review rounds or export are treated as complete.

### Requirement: Book Reuse

The system MUST accept a book name or derive it from the translated file path for terminology and QA inputs, and MUST NOT introduce new hardcoded Entrepreneurship-only paths for the quality-gate additions.
