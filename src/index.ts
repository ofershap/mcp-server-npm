import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchPackages,
  getPackageInfo,
  getDownloads,
  getVersions,
} from "./npm-api.js";

const server = new McpServer({
  name: "mcp-server-npm",
  version: "0.1.0",
});

server.tool(
  "npm_search",
  "Search npm packages by keyword",
  {
    query: z.string().describe("Search query"),
    size: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Number of results"),
  },
  async ({ query, size }) => {
    const results = await searchPackages(query, size);
    if (results.length === 0) {
      return { content: [{ type: "text", text: "No packages found." }] };
    }
    const text = results
      .map(
        (r, i) =>
          `${i + 1}. **${r.name}** v${r.version} (score: ${r.score})\n   ${r.description}`,
      )
      .join("\n\n");
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "npm_info",
  "Get detailed info about an npm package",
  {
    name: z.string().describe("Package name (e.g. 'express')"),
  },
  async ({ name }) => {
    const info = await getPackageInfo(name);
    const depCount = Object.keys(info.dependencies).length;
    const devDepCount = Object.keys(info.devDependencies).length;
    const deps =
      depCount > 0
        ? Object.entries(info.dependencies)
            .map(([k, v]) => `  ${k}: ${v}`)
            .join("\n")
        : "  (none)";

    const text = [
      `# ${info.name} v${info.version}`,
      "",
      info.description,
      "",
      `License: ${info.license}`,
      `Homepage: ${info.homepage || "(none)"}`,
      `Repository: ${info.repository || "(none)"}`,
      `Keywords: ${info.keywords.join(", ") || "(none)"}`,
      `Maintainers: ${info.maintainers.join(", ")}`,
      `Last published: ${info.lastPublish}`,
      "",
      `Dependencies (${depCount}):`,
      deps,
      "",
      `Dev dependencies: ${devDepCount}`,
    ].join("\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "npm_downloads",
  "Get download statistics for an npm package",
  {
    name: z.string().describe("Package name"),
    period: z
      .enum(["last-day", "last-week", "last-month", "last-year"])
      .default("last-month")
      .describe("Time period"),
  },
  async ({ name, period }) => {
    const stats = await getDownloads(name, period);
    const text = [
      `# ${stats.package} downloads`,
      `Period: ${stats.period}`,
      `Total: ${stats.total.toLocaleString()}`,
    ].join("\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "npm_versions",
  "List recent versions of an npm package",
  {
    name: z.string().describe("Package name"),
    count: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Number of versions to show"),
  },
  async ({ name, count }) => {
    const versions = await getVersions(name);
    const recent = versions.slice(0, count);
    const text = recent.map((v) => `${v.version} — ${v.date}`).join("\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "npm_compare",
  "Compare two npm packages side by side",
  {
    packageA: z.string().describe("First package name"),
    packageB: z.string().describe("Second package name"),
  },
  async ({ packageA, packageB }) => {
    const [infoA, infoB, dlA, dlB] = await Promise.all([
      getPackageInfo(packageA),
      getPackageInfo(packageB),
      getDownloads(packageA, "last-month"),
      getDownloads(packageB, "last-month"),
    ]);

    const depsA = Object.keys(infoA.dependencies).length;
    const depsB = Object.keys(infoB.dependencies).length;

    const text = [
      `| | ${infoA.name} | ${infoB.name} |`,
      `|---|---|---|`,
      `| Version | ${infoA.version} | ${infoB.version} |`,
      `| License | ${infoA.license} | ${infoB.license} |`,
      `| Dependencies | ${depsA} | ${depsB} |`,
      `| Monthly downloads | ${dlA.total.toLocaleString()} | ${dlB.total.toLocaleString()} |`,
      `| Last published | ${infoA.lastPublish} | ${infoB.lastPublish} |`,
      `| Maintainers | ${infoA.maintainers.length} | ${infoB.maintainers.length} |`,
    ].join("\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "npm_deps",
  "List dependencies of an npm package",
  {
    name: z.string().describe("Package name"),
  },
  async ({ name }) => {
    const info = await getPackageInfo(name);
    const deps = Object.entries(info.dependencies);
    const devDeps = Object.entries(info.devDependencies);

    const sections: string[] = [`# ${info.name} v${info.version} dependencies`];

    if (deps.length > 0) {
      sections.push(
        `\nDependencies (${deps.length}):`,
        ...deps.map(([k, v]) => `  ${k}: ${v}`),
      );
    } else {
      sections.push("\nDependencies: (none)");
    }

    if (devDeps.length > 0) {
      sections.push(
        `\nDev dependencies (${devDeps.length}):`,
        ...devDeps.map(([k, v]) => `  ${k}: ${v}`),
      );
    } else {
      sections.push("\nDev dependencies: (none)");
    }

    return { content: [{ type: "text", text: sections.join("\n") }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
