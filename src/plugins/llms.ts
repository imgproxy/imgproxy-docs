import { Plugin, RouteConfig } from "@docusaurus/types";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const DOCS_PLUGIN_NAME = "docusaurus-plugin-content-docs";

type SidebarItem = {
  type: string;
  label?: string;
  href?: string;
  items?: SidebarItem[];
};

type VersionContext = {
  name: string;
  label: string;
  path: string;
  isLast: boolean;
  sidebar?: SidebarItem[];
};

type RouteEntry = {
  path: string;
  sourceFilePath?: string;
  isCategory: boolean;
  description?: string;
  version: VersionContext;
};

// This plugin makes the docs better suited for consumption by LLMs.
// It generates markdown files for each documentation page, including category index pages,
// and injects alternate link tags in the HTML head to point to the markdown versions.
//
// The llm-middleware edge function can then rewrite requests for HTML pages to their
// markdown counterparts if the client prefers markdown (based on the Accept header).
export default function docusaurusLLMsPlugin(): Plugin {
  return {
    name: "docusaurus-llms-plugin",

    // Inject an alternate link tag for the markdown version of the page to HTML head
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "link",
            attributes: {
              rel: "alternate",
              type: "text/markdown",
              href: "index.md",
            },
          },
        ],
      };
    },

    // After the build is complete, generate markdown files for each documentation page
    async postBuild({ routes, siteDir, outDir }): Promise<void> {
      // Find the root route for the docs plugin.
      // Other plugins may also add routes, but we only care about the ones from the docs plugin.
      const docsRoot = routes.find(
        (route) => route.plugin.name === DOCS_PLUGIN_NAME,
      );
      if (!docsRoot) return;

      // Collect all routes that have a source file or are category indexes,
      // along with their version context.
      const routeEntries = new Map<string, RouteEntry>();
      for (const route of docsRoot.routes ?? [])
        collectRoutes(route, undefined, routeEntries);

      // for (const route of routeEntries.values()) {
      //   const versionLabel = route.version.isLast
      //     ? `${route.version.label} (last)`
      //     : route.version.label;
      //   const source = route.isCategory
      //     ? "(category)"
      //     : `<- ${route.sourceFilePath}`;
      //   console.log(`${route.path} [${versionLabel}] ${source}`);
      // }

      // Cache rendered sidebars by version name to avoid redundant rendering.
      const renderedSidebars = new Map<string, string>();
      const getRenderedSidebar = (
        version: VersionContext,
      ): string | undefined => {
        if (!version.sidebar?.length) return undefined;

        const cached = renderedSidebars.get(version.name);
        if (cached !== undefined) return cached;

        const rendered = renderSidebar(version.sidebar);
        renderedSidebars.set(version.name, rendered);
        return rendered;
      };

      // Group routes by their path relative to the version root,
      // so we can easily find "peer" routes in other versions.
      const entriesByRelPath = new Map<string, RouteEntry[]>();
      for (const route of routeEntries.values()) {
        const relPath = versionRelativePath(route.path, route.version.path);
        const list = entriesByRelPath.get(relPath) ?? [];
        list.push(route);
        entriesByRelPath.set(relPath, list);
      }

      // Ranking function to determine the order of versions in the "Other versions" section.
      // "Last" version should come first, then "current" (unstable), then the rest sorted by label.
      const versionRank = (entry: RouteEntry): number => {
        if (entry.version.isLast) return 0;
        if (entry.version.name === "current") return 1;
        return 2;
      };

      // Render a list of links to the same page in other versions, if they exist.
      const renderOtherVersions = (route: RouteEntry): string | undefined => {
        // The "peer" routes are those that share the same relative path
        // within their respective versions.
        const relPath = versionRelativePath(route.path, route.version.path);
        const peers = entriesByRelPath.get(relPath);
        if (!peers) return undefined;

        // Remove the current route from the list and sort the others by rank and label.
        const sorted = peers
          .filter((peer) => peer !== route)
          .sort((a, b) => {
            const rankDiff = versionRank(a) - versionRank(b);
            if (rankDiff !== 0) return rankDiff;
            return b.version.label.localeCompare(a.version.label);
          });

        // Render each peer as a markdown link with an appropriate label.
        const lines = sorted.map((peer) => {
          let label = peer.version.label;
          if (peer.version.isLast) label += " (current)";
          else if (peer.version.name === "current") label += " (unstable)";
          return `- [${label}](${peer.path})`;
        });

        // Only return the section if there are other versions to link to.
        return lines.length ? lines.join("\n") : undefined;
      };

      // Generate the markdown files for each route entry.
      for (const route of routeEntries.values()) {
        let content: string | undefined;

        if (route.sourceFilePath) {
          // For regular doc pages, load the source markdown file and clean it up.
          content = await loadMarkdown(join(siteDir, route.sourceFilePath));
        } else if (route.isCategory) {
          // For category index pages, build the content from the sidebar items and description.
          const category = findCategory(route.version.sidebar, route.path);
          if (category)
            content = buildCategoryContent(category, route.description);
        }

        // No content? Skip generating the file
        if (!content) continue;

        // Write the content to the appropriate location in the output directory.
        // Add sidebar and other versions sections if applicable.
        const dest = join(outDir, route.path, "index.md");
        await writeMarkdown(
          dest,
          content,
          getRenderedSidebar(route.version),
          renderOtherVersions(route),
        );
      }
    },
  };
}

// Extract version information from a route's props, if available.
function extractVersion(route: RouteConfig): VersionContext | undefined {
  const version = route.props?.version as
    | {
        version?: string;
        label?: string;
        isLast?: boolean;
        docsSidebars?: Record<string, SidebarItem[]>;
      }
    | undefined;

  if (!version?.version || !version?.label) return undefined;

  return {
    name: version.version,
    label: version.label,
    path: route.path,
    isLast: !!version.isLast,
    sidebar: version.docsSidebars?.main,
  };
}

// Load the markdown content from the source file and perform some cleanup
async function loadMarkdown(sourcePath: string): Promise<string> {
  const source = await readFile(sourcePath, "utf8");
  return replaceImageOnlyH1(stripFrontmatter(source)).replace(/^\s+/, "");
}

// Remove frontmatter from the markdown content, as it's not needed for
// LLM consumption and may contain irrelevant metadata.
function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

// Replace H1 headings that contain only an image with a placeholder text.
// The root page uses a logo image as the H1, which doesn't provide useful information for LLMs,
// so we replace it with the "imgproxy" heading
function replaceImageOnlyH1(content: string): string {
  return content.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g, (match, inner) => {
    const remainder = inner.replace(/<img\b[^>]*\/?>/g, "").trim();
    return remainder === "" ? "# imgproxy" : match;
  });
}

// Recursively render the sidebar items as a markdown list,
// with proper indentation for nested categories.
function renderSidebar(items: SidebarItem[], depth = 0): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  for (const item of items) {
    if (!item.label) continue;

    const line = item.href
      ? `${indent}- [${item.label}](${item.href})`
      : `${indent}- ${item.label}`;
    lines.push(line);

    if (item.items?.length) lines.push(renderSidebar(item.items, depth + 1));
  }

  return lines.join("\n");
}

// Write the generated markdown content to the specified destination path,
// creating any necessary directories along the way.
// Optionally include rendered sidebar and other versions sections if provided.
async function writeMarkdown(
  destPath: string,
  content: string,
  renderedSidebar?: string,
  renderedOtherVersions?: string,
): Promise<void> {
  // Use only the original content by default
  const parts = [content.trimEnd()];

  // If there's a sidebar or other versions to include,
  // add a delimiter and section headers before appending them to the content.
  if (renderedSidebar || renderedOtherVersions) parts.push("", "---");

  // Append the rendered sidebar if it exists, under a "Navigation" header
  if (renderedSidebar) parts.push("", "## Navigation", "", renderedSidebar);

  // Append the links to other versions if they exist, under an "Other versions" header
  if (renderedOtherVersions)
    parts.push("", "## Other versions", "", renderedOtherVersions);

  // Ensure the destination directory exists and write the content to the file
  await mkdir(dirname(destPath), { recursive: true });
  await writeFile(destPath, `${parts.join("\n")}\n`);
}

// Calculate the path of a route relative to its version root
function versionRelativePath(routePath: string, versionPath: string): string {
  if (versionPath === "/" || versionPath === "") return routePath;
  if (routePath === versionPath) return "/";
  if (routePath.startsWith(`${versionPath}/`))
    return routePath.slice(versionPath.length);
  return routePath;
}

// Recursively search the sidebar items to find the category that corresponds to the given href
function findCategory(
  items: SidebarItem[] | undefined,
  href: string,
): SidebarItem | undefined {
  if (!items) return undefined;

  for (const item of items) {
    if (item.type === "category" && item.href === href) return item;

    const found = findCategory(item.items, href);
    if (found) return found;
  }

  return undefined;
}

// Build the markdown content for a category index page based on its sidebar items and description
function buildCategoryContent(
  category: SidebarItem,
  description: string | undefined,
): string {
  // Start with the category label as the H1 heading
  const lines = [`# ${category.label}`, ""];

  // If the category has a description, include it at the top of the content.
  if (description) lines.push(description, "");

  // Render the category items as a markdown list
  for (const item of category.items ?? []) {
    // Skip items that don't have both a label and an href,
    // as they won't be useful for LLM consumption
    if (!item.href || !item.label) continue;

    // Render the item as a markdown link
    lines.push(`- [${item.label}](${item.href})`);
  }
  return lines.join("\n");
}

// Recursively traverse the route tree to collect all routes
// that have a source file or are category indexes,
// along with their version context, and store them in the output map.
function collectRoutes(
  route: RouteConfig,
  parentVersion: VersionContext | undefined,
  out: Map<string, RouteEntry>,
): void {
  // Parent version is passed down to children and has the highest priority.
  // If there's no parent version, try to extract version information from the current route.
  const version = parentVersion ?? extractVersion(route);

  // Only collect routes that have version information
  if (version) {
    if (route.metadata?.sourceFilePath) {
      // This is a regular doc page with a source markdown file.
      out.set(route.path, {
        path: route.path,
        sourceFilePath: route.metadata.sourceFilePath,
        isCategory: false,
        version,
      });
    } else if (route.props?.categoryGeneratedIndex) {
      // This is a category index page generated by the docs plugin.
      // Collect its context to generate a markdown file for it later
      const generated = route.props.categoryGeneratedIndex as {
        description?: string;
      };
      out.set(route.path, {
        path: route.path,
        isCategory: true,
        description: generated.description,
        version,
      });
    }
  }

  // Recursively collect routes from child routes, passing down the version context.
  for (const child of route.routes ?? []) collectRoutes(child, version, out);
}
