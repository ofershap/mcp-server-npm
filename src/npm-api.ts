const REGISTRY = "https://registry.npmjs.org";
const SEARCH_API = "https://registry.npmjs.org/-/v1/search";
const DOWNLOADS_API = "https://api.npmjs.org/downloads";

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  license: string;
  homepage: string;
  repository: string;
  keywords: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  maintainers: string[];
  lastPublish: string;
}

export interface SearchResult {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  score: number;
  downloads: number;
}

export interface DownloadStats {
  package: string;
  period: string;
  total: number;
  daily: { day: string; downloads: number }[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error (${response.status}): ${text}`);
  }
  return (await response.json()) as T;
}

export async function searchPackages(
  query: string,
  size = 10,
): Promise<SearchResult[]> {
  const data = await fetchJson<{
    objects: {
      package: {
        name: string;
        version: string;
        description: string;
        keywords: string[];
      };
      score: { final: number };
      searchScore: number;
    }[];
  }>(`${SEARCH_API}?text=${encodeURIComponent(query)}&size=${size}`);

  return data.objects.map((obj) => ({
    name: obj.package.name,
    version: obj.package.version,
    description: obj.package.description ?? "",
    keywords: obj.package.keywords ?? [],
    score: Math.round(obj.score.final * 100),
    downloads: 0,
  }));
}

export async function getPackageInfo(name: string): Promise<PackageInfo> {
  const data = await fetchJson<{
    name: string;
    "dist-tags": Record<string, string>;
    versions: Record<string, unknown>;
    description?: string;
    license?: string;
    homepage?: string;
    repository?: { url?: string } | string;
    keywords?: string[];
    maintainers?: { name: string }[];
    time?: Record<string, string>;
  }>(`${REGISTRY}/${encodeURIComponent(name)}`);

  const latestVersion = data["dist-tags"]["latest"] ?? "";
  const latestData = (data.versions[latestVersion] ?? {}) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const repoUrl =
    typeof data.repository === "string"
      ? data.repository
      : (data.repository?.url ?? "");

  return {
    name: data.name,
    version: latestVersion,
    description: data.description ?? "",
    license: data.license ?? "Unknown",
    homepage: data.homepage ?? "",
    repository: repoUrl.replace(/^git\+/, "").replace(/\.git$/, ""),
    keywords: data.keywords ?? [],
    dependencies: latestData.dependencies ?? {},
    devDependencies: latestData.devDependencies ?? {},
    maintainers: (data.maintainers ?? []).map((m) => m.name),
    lastPublish: data.time?.[latestVersion] ?? "",
  };
}

export async function getDownloads(
  name: string,
  period: "last-day" | "last-week" | "last-month" | "last-year" = "last-month",
): Promise<DownloadStats> {
  const data = await fetchJson<{
    package: string;
    start: string;
    end: string;
    downloads: { day: string; downloads: number }[];
  }>(`${DOWNLOADS_API}/range/${period}/${encodeURIComponent(name)}`);

  const total = data.downloads.reduce((sum, d) => sum + d.downloads, 0);

  return {
    package: data.package,
    period: `${data.start} to ${data.end}`,
    total,
    daily: data.downloads,
  };
}

export async function getVersions(
  name: string,
): Promise<{ version: string; date: string }[]> {
  const data = await fetchJson<{
    time: Record<string, string>;
  }>(`${REGISTRY}/${encodeURIComponent(name)}`);

  return Object.entries(data.time)
    .filter(([key]) => key !== "created" && key !== "modified")
    .map(([version, date]) => ({ version, date }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
