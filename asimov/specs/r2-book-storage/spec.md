# r2-book-storage Specification
## Requirements

### Requirement: R2 book prefix layout

The system SHALL store each book folder under an R2 object-key prefix named `books/<bookName>/`, preserving each uploaded file's path relative to local `data/<bookName>/` below that prefix.

#### Scenario: Preserve relative path

- **WHEN** local file `data/entrepreneurship/raw/1-introduction.html` is uploaded
- **THEN** the remote object key MUST be `books/entrepreneurship/raw/1-introduction.html`

### Requirement: R2 upload credentials

The system SHALL require `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and either `R2_ACCOUNT_ID` or `CLOUDFLARE_ACCOUNT_ID` before attempting any R2 upload or list operation.

### Requirement: R2 endpoint

The system SHALL use the endpoint `https://<account-id>.r2.cloudflarestorage.com` and S3 client region `auto` for R2 API calls.

### Requirement: Upload without delete permission

The system SHALL NOT require R2 delete permission for normal upload, list, or guided translate-flow upload operations.

### Requirement: Recursive book upload result

The system SHALL upload every regular file under local `data/<bookName>/` and report attempted, uploaded, and failed file counts at command completion.

#### Scenario: Partial upload failure

- **WHEN** one or more files fail to upload
- **THEN** the upload command MUST exit unsuccessfully and report the failed file paths without hiding successfully uploaded counts

### Requirement: Remote book listing

The system SHALL provide a CLI-visible way to list remote book names by inspecting first-level prefixes under `books/` in the configured R2 bucket.

