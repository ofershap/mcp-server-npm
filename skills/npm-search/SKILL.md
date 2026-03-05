---
name: npm-search
description: Search npm packages, compare libraries, and check download stats via MCP. Use when evaluating or researching npm packages.
---

# npm Package Search via MCP

Use this skill when you need to search npm, compare packages, check download stats, or inspect dependencies. No API keys needed.

## Available Tools

| Tool            | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `npm_search`    | Search npm packages by keyword                                  |
| `npm_info`      | Get detailed package info (version, license, deps, maintainers) |
| `npm_downloads` | Get download statistics (daily, weekly, monthly, yearly)        |
| `npm_versions`  | List recent versions of a package                               |
| `npm_compare`   | Compare two packages side by side                               |
| `npm_deps`      | List all dependencies of a package                              |

## Workflow

1. `npm_search` to find packages by keyword
2. `npm_compare` to evaluate two alternatives side by side
3. `npm_info` for deep dive on a specific package
4. `npm_downloads` to gauge popularity and adoption trends

## Key Patterns

- `npm_compare` is the most useful tool for "which library should I use?" questions
- `npm_downloads` returns daily/weekly/monthly/yearly — use for trend analysis
- `npm_deps` helps evaluate dependency footprint before adding a package
