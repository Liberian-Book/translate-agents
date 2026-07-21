# translate-flow-upload Specification
## Requirements

### Requirement: Guided flow final upload step

The guided translate flow SHALL run the same R2 book upload behavior as its final remote-storage step after local translation flow output for the selected book is complete.

### Requirement: Final upload failure visibility

The guided translate flow SHALL surface R2 upload failures as a failed final step while preserving the local translated files already produced.

### Requirement: Manual upload parity

The manual upload command and guided final upload step MUST use the same R2 key mapping, credential validation, and upload result summary contract.

