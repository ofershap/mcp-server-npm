import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchPackages,
  getPackageInfo,
  getDownloads,
  getVersions,
} from "../src/npm-api.js";

describe("npm-api", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("searches packages", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          objects: [
            {
              package: {
                name: "express",
                version: "4.21.0",
                description: "Fast web framework",
                keywords: ["web", "framework"],
              },
              score: { final: 0.85 },
              searchScore: 100,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const results = await searchPackages("express", 5);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("express");
    expect(results[0]?.score).toBe(85);
  });

  it("gets package info", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "express",
          "dist-tags": { latest: "4.21.0" },
          versions: {
            "4.21.0": {
              dependencies: { "body-parser": "1.20.0" },
              devDependencies: { mocha: "10.0.0" },
            },
          },
          description: "Fast web framework",
          license: "MIT",
          homepage: "https://expressjs.com",
          repository: { url: "git+https://github.com/expressjs/express.git" },
          keywords: ["web"],
          maintainers: [{ name: "dougwilson" }],
          time: { "4.21.0": "2024-09-01T00:00:00Z" },
        }),
        { status: 200 },
      ),
    );

    const info = await getPackageInfo("express");
    expect(info.name).toBe("express");
    expect(info.version).toBe("4.21.0");
    expect(info.license).toBe("MIT");
    expect(info.dependencies).toHaveProperty("body-parser");
    expect(info.repository).toBe("https://github.com/expressjs/express");
  });

  it("gets download stats", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          package: "express",
          start: "2026-01-01",
          end: "2026-01-31",
          downloads: [
            { day: "2026-01-01", downloads: 100000 },
            { day: "2026-01-02", downloads: 120000 },
          ],
        }),
        { status: 200 },
      ),
    );

    const stats = await getDownloads("express", "last-month");
    expect(stats.total).toBe(220000);
    expect(stats.package).toBe("express");
  });

  it("gets versions", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          time: {
            created: "2010-01-01T00:00:00Z",
            modified: "2024-09-01T00:00:00Z",
            "4.21.0": "2024-09-01T00:00:00Z",
            "4.20.0": "2024-06-01T00:00:00Z",
          },
        }),
        { status: 200 },
      ),
    );

    const versions = await getVersions("express");
    expect(versions).toHaveLength(2);
    expect(versions[0]?.version).toBe("4.21.0");
  });

  it("throws on API error", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

    await expect(getPackageInfo("nonexistent-pkg-xyz")).rejects.toThrow(
      "API error (404)",
    );
  });
});
