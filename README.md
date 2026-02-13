# mcp-server-npm

[![npm version](https://img.shields.io/npm/v/mcp-server-npm.svg)](https://www.npmjs.com/package/mcp-server-npm)
[![npm downloads](https://img.shields.io/npm/dm/mcp-server-npm.svg)](https://www.npmjs.com/package/mcp-server-npm)
[![CI](https://github.com/ofershap/mcp-server-npm/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/mcp-server-npm/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Search npm, compare packages, check downloads, and inspect dependencies — all from your AI assistant. No API keys needed.

```
You: "Compare react vs preact — size, downloads, and dependencies"
AI:  react: 45.5kb min, 25M weekly downloads, 3 deps
     preact: 4.2kb min, 3.8M weekly downloads, 0 deps
```

> Works with Claude Desktop, Cursor, and VS Code Copilot.

![Demo](assets/demo.gif)

## Tools

| Tool            | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `npm_search`    | Search npm packages by keyword                                  |
| `npm_info`      | Get detailed package info (version, license, deps, maintainers) |
| `npm_downloads` | Get download statistics (daily, weekly, monthly, yearly)        |
| `npm_versions`  | List recent versions of a package                               |
| `npm_compare`   | Compare two packages side by side                               |
| `npm_deps`      | List all dependencies of a package                              |

## Quick Start

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "npm": {
      "command": "npx",
      "args": ["-y", "mcp-server-npm"]
    }
  }
}
```

### With Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "npm": {
      "command": "npx",
      "args": ["-y", "mcp-server-npm"]
    }
  }
}
```

## Examples

Ask your AI assistant:

- "Search npm for state management libraries"
- "Show me info about the express package"
- "Compare react vs preact"
- "How many downloads does zod get per month?"
- "What are the dependencies of next?"
- "List recent versions of typescript"

## Development

```bash
npm install
npm test
npm run build
```

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
