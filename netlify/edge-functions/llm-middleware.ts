import type { Config, Context } from "@netlify/edge-functions";
import { extname } from "path";

const ALLOWED_HTTP_METHODS = new Set(["GET", "HEAD"]);
const LLMS_REWRITES = new Set(["/llms.txt", "/llms-full.txt"]);

export const config: Config = {
  // This middleware should run for all paths, but we explicitly exclude common static asset types
  // and some specific files to avoid unnecessary middleware execution
  path: "/*",
  excludedPath: [
    "/**/*.js",
    "/**/*.css",
    "/**/*.png",
    "/**/*.jpg",
    "/**/*.jpeg",
    "/**/*.svg",
    "/**/*.ico",
    "/**/*.xml",
    "/img/**",
    "/robots.txt",
    "/404.html",
    "/_redirects",
    "/.nojekyll",
  ],
};

// This middleware serves Markdown content to clients that prefer it (like LLMs),
// while still supporting regular HTML for browsers and other clients.
// It also adds Link headers to indicate alternate formats and ensures proper Vary headers.
export default async function handler(request: Request, context: Context) {
  try {
    // Only handle allowed HTTP methods
    if (!ALLOWED_HTTP_METHODS.has(request.method)) return;

    // Skip our own Algolia crawler — it follows rel="alternate" links and
    // would otherwise index the .md variants.
    const userAgent = request.headers.get("user-agent") || "";
    if (/algolia/i.test(userAgent)) return;

    const url = new URL(request.url);
    const { pathname } = url;

    // Respond with index.md for llms.txt and llms-full.txt,
    // as index.md is well suited for this purpose
    if (LLMS_REWRITES.has(pathname)) {
      return buildTarget("/index.md", url);
    }

    const ext = extname(pathname);
    if (ext === ".html" || ext === ".md") {
      // For direct requests to .html or .md files,
      // add a link header pointing to the alternate format.
      return modifyHeaders(await context.next(), (headers) => {
        addAlternateLink(headers, url);
      });
    } else if (ext) {
      // Skip other requests with file extensions,
      // as they are static assets that shouldn't have alternate links.
      return;
    }

    // For other requests, check if the client prefers Markdown over HTML.
    // If so, try to serve the corresponding Markdown file
    // (e.g., /foo -> /foo/index.md).
    // If the Markdown file doesn't exist (404),
    // continue with the normal request handling.
    if (prefersMarkdown(request.headers.get("accept"))) {
      const target = buildTarget(joinIndexMD(pathname), url);
      const response = await fetch(target);
      if (response.status !== 404) return finalize(response, url);
    }

    // For all other cases, proceed with the normal request handling.
    return finalize(await context.next(), url);
  } catch (error) {
    console.error("Error in LLM middleware:", error);
    // In case of any error, proceed with the normal request handling
    return context.next();
  }
}

// Helper function to build a target URL based on the original URL and a new pathname,
// while preserving the search parameters.
function buildTarget(pathname: string, base: URL): URL {
  const target = new URL(pathname, base);
  target.search = base.search;
  return target;
}

// Helper function to convert a pathname to its corresponding index.md path.
function joinIndexMD(pathname: string): string {
  return pathname.replace(/\/?$/, "/") + "index.md";
}

// Parses the Accept header to determine if the client prefers Markdown over HTML.
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  // Quality values (q) indicate the client's preference for different content types.
  // Values less than 0 mean that the type wasn't found in the Accept header
  let markdownQ = -1;
  let htmlQ = -1;
  let textQ = -1;
  let anyQ = -1;

  // Parse the Accept header, which can contain multiple content types with optional quality values.
  for (const part of accept.split(",")) {
    // Each part can have parameters separated by semicolons, e.g., "text/html; q=0.9".
    const segments = part.trim().split(";");
    const type = segments[0].trim().toLowerCase();
    if (!type) continue;

    // Default quality value is 1 if the type is present without an explicit q parameter.
    let q = 1;
    // Look for a q parameter in the segments to determine the quality value for this content type.
    for (let i = 1; i < segments.length; i++) {
      const param = segments[i].trim();
      if (!param.startsWith("q=")) continue;
      const value = Number.parseFloat(param.slice(2));
      if (!Number.isNaN(value)) q = value;
    }

    // Update the quality values for the relevant content types based on the parsed Accept header.
    if (type === "text/markdown") {
      markdownQ = Math.max(q, markdownQ);
    } else if (type === "text/html") {
      htmlQ = Math.max(q, htmlQ);
    } else if (type === "text/*") {
      textQ = Math.max(q, textQ);
    } else if (type === "*/*") {
      anyQ = Math.max(q, anyQ);
    }
  }

  // If "text/html" isn't explicitly listed,
  // use the quality values of "text/*" and "*/*" as a fallback for HTML,
  if (htmlQ < 0) htmlQ = textQ > 0 ? textQ : anyQ;

  // Markdown is preferred if it was explicitly listed with a quality value greater than 0,
  // and its quality value is greater than or equal to that of HTML.
  return markdownQ > 0 && markdownQ >= htmlQ;
}

// Finalize the response by adding necessary headers.
// This function should be used only for responses to paths without file extensions
// (e.g., /foo or /foo/).
// For responses to direct requests to .html or .md files, the alternate link header
// is added in the main handler function, and this finalize function is not used.
function finalize(response: Response, url: URL): Response {
  return modifyHeaders(response, (headers) => {
    // Add "Accept" to the Vary header to indicate that the response may vary
    // based on the Accept header, which is important for caching CDNs and browsers
    // to work correctly with content negotiation.
    appendVary(headers, "Accept");
    // Add a Link header pointing to the alternate format (Markdown or HTML)
    // for clients that can handle it.
    addAlternateLink(headers, new URL(response.url, url));
  });
}

// Helper function to create a new Response with modified headers based on an existing Response.
function modifyHeaders(
  response: Response,
  fn: (headers: Headers) => void,
): Response {
  const headers = new Headers(response.headers);

  fn(headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Helper function to append a value to the Vary header, ensuring that it doesn't create duplicates.
function appendVary(headers: Headers, value: string) {
  const existing = headers.get("vary");

  // If there's no existing Vary header, just set it to the new value.
  if (!existing) {
    headers.set("vary", value);
    return;
  }

  // If the Vary header already includes the value (case-insensitive), do nothing to avoid duplicates.
  const tokens = existing.split(",").map((s) => s.trim());
  if (tokens.some((t) => t.toLowerCase() === value.toLowerCase())) return;

  // Otherwise, append the new value to the existing Vary header.
  headers.set("vary", `${existing}, ${value}`);
}

// Helper function to add a Link header pointing to the alternate format (Markdown or HTML)
// for a given URL.
function addAlternateLink(headers: Headers, url: URL) {
  let alternatePath: string | null = null;
  let alternateType = "text/markdown";

  const ext = extname(url.pathname);
  if (ext === ".html") {
    // For an HTML page, the alternate format is the corresponding Markdown file.
    alternatePath = url.pathname.replace(/\.html$/, ".md");
  } else if (ext === ".md") {
    // For a Markdown page, the alternate format is the corresponding HTML file.
    alternatePath = url.pathname.replace(/\.md$/, ".html");
    alternateType = "text/html";
  } else if (ext === "") {
    // Paths without an extension are most likely point to /path/index.html,
    // so we should add /index.md to it as the alternate path.
    alternatePath = joinIndexMD(url.pathname);
  }

  // If we couldn't determine a valid alternate path, don't add a Link header.
  if (!alternatePath) return;

  // Build the full URL for the alternate format and add a Link header.
  const alternateUrl = buildTarget(alternatePath, url);
  const link = `<${alternateUrl}>; rel="alternate"; type="${alternateType}"`;
  headers.set("link", link);
}
