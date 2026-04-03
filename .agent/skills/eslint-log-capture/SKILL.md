---
name: eslint-log-capture
description: How to run ESLint and capture its output in a format that's easy for the AI agent to read and process, especially on Windows.
---

# ESLint Log Capture Skill

When dealing with a large number of ESLint warnings or errors, direct terminal output can be truncated, messy, or encoded in a way that's difficult to process. This skill provides a reliable method to capture ESLint output to a file and read it using native tools.

## Why this is necessary

On Windows, using `>` or `Out-File` in PowerShell often defaults to UTF-16 (little-endian or big-endian depending on version), which can cause issues with the agent's `view_file` tool or other text processing tools that expect UTF-8.

## The Procedure

### 1. Run ESLint and capture to a raw file

Run the following command to pipe the linting output to a temporary file:

```powershell
npm run lint -- --format stylish 2>&1 | Out-File -Encoding utf8 lint-raw.log
```

_Note: In PowerShell 5.1, `-Encoding utf8` creates a UTF-8 BOM file. In PowerShell Core/7, it's UTF-8 without BOM._

> [!TIP]
> Linting can take several minutes to complete on a large codebase. Use a generous wait duration (e.g. 60 seconds) when checking the command status.

### 2. (Optional) Convert to pure UTF-8 if needed

If the agent has trouble reading `lint-raw.log`, convert it using PowerShell to ensure it's standard UTF-8:

```powershell
Get-Content lint-raw.log | Set-Content -Encoding utf8 lint.log
```

### 3. Read and process the results

Once the file is created and confirmed to be in UTF-8, use your environment's file-reading tools (e.g., `view_file`, `cat`, or a similar tool) to process the linting results.

**Example (using `view_file`):**

```json
{
	"tool": "view_file",
	"arguments": {
		"AbsolutePath": "<ABSOLUTE_PATH_TO_REPO>/lint.log"
	}
}
```

## Best Practices

- **Use standard formats**: The `stylish` or `json` formats are usually best for agent processing.
- **Cleanup**: Delete the temporary log files (`lint-raw.log`, `lint.log`) once the issues are resolved.
- **Incremental fixing**: If there are many errors, run the lint command on specific directories or files to keep the log manageable.
