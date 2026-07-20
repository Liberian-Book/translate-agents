## ADDED Requirements

### Requirement: CLI Entrypoint

The system SHALL expose a package `bin` command named `trxng` that executes `./bin/trxng.js` with a `#!/usr/bin/env node` shebang.

### Requirement: No-Argument Interactive Mode

The system SHALL open interactive mode when `trxng` is run with no command arguments and SHALL print the exact welcome text `Welcome to trxng` before asking the user what to do.

### Requirement: Interactive Action Menu

The interactive action menu SHALL include these user-visible action labels: `Scrape book`, `Cleanup book`, `Extract terms`, `Prepare translation`, `Translate`, `Review`, `Build preview`, and `Deploy`.

### Requirement: MVP Action Support

The system SHALL execute real pipeline scripts only for the MVP actions `Scrape book`, `Cleanup book`, `Extract terms`, and `Prepare translation`.

### Requirement: Unsupported Future Actions

The system SHALL respond to `Translate`, `Review`, `Build preview`, and `Deploy` in interactive mode with the exact message `This action is not implemented in the MVP yet.` and MUST NOT execute a pipeline script for those actions.

### Requirement: Direct Commands

The system SHALL provide direct commands for `scrape`, `cleanup`, `terms`, and `prep` in addition to interactive mode.

### Requirement: Book Selection Default

The interactive flow SHALL default the book name to `entrepreneurship` when asking for a book.

### Requirement: Cleanup Confirmation

The system SHALL require explicit confirmation before running cleanup from interactive mode because cleanup can delete and re-download shared book assets.

### Requirement: Safe Script Execution

The system MUST execute underlying scripts with argv arrays through Node child-process APIs and MUST NOT build shell command strings from user input.

### Requirement: Output Location Summary

After a supported MVP action completes successfully, the system SHALL print the relevant sibling book output path for the selected book.
