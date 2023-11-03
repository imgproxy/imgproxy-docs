import { Config } from "@docusaurus/types";
import {
  Options as PresetClassicOptions,
  ThemeConfig as PresetClassicThemeConfig,
} from "@docusaurus/preset-classic";

import badgeRemarkPlugin from "./src/remark/badge";
import codeAnchorRemarkPlugin from "./src/remark/code-anchor";

import prismTheme from "./src/prism/theme";

const defaultUrl = "https://docs.imgproxy.net";

const getSiteUrl = (): string => {
  if (process.env.NETLIFY && process.env.CONTEXT !== "production")
    return process.env.DEPLOY_PRIME_URL || defaultUrl;

  return defaultUrl;
};

const config: Config = {
  title: "imgproxy documentation",
  tagline: "Optimize images for web on the fly",
  favicon: "/img/favicon.ico",

  // Set the production url of your site here
  url: getSiteUrl(),

  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  scripts: ["/docsify-anchor-fix.js"],

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "crossorigin",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Martian+Mono:wght@300;600&display=swap",
      },
    },
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // sidebarCollapsed: false,

          versions: {
            current: {
              label: "latest",
              path: "latest",
              banner: "unreleased",
            },
          },

          editUrl: "https://github.com/imgproxy/imgproxy-docs/tree/master/",

          admonitions: {
            // tag: ':::',
            keywords: ["note", "tip", "info", "caution", "danger", "slow"],
          },

          remarkPlugins: [badgeRemarkPlugin, codeAnchorRemarkPlugin],
        },

        blog: false,

        theme: {
          customCss: [
            require.resolve("./src/css/general.css"),
            require.resolve("./src/css/navbar.css"),
            require.resolve("./src/css/docsearch.css"),
            require.resolve("./src/css/menu.css"),
            require.resolve("./src/css/badge.css"),
            require.resolve("./src/css/code-anchor.css"),
            require.resolve("./src/css/heading-pattern.css"),
          ],
        },

        gtag: {
          trackingID: "G-4ME3KE3EJC",
          anonymizeIP: true,
        },
      } as PresetClassicOptions,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },

    image: "img/social-card.jpg",

    navbar: {
      title: "imgproxy",
      logo: {
        alt: "imgproxy Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docsVersionDropdown",
          position: "left",
        },
        {
          type: "search",
          position: "left",
        },
        {
          label: "imgproxy.net",
          href: "https://imgproxy.net",
          position: "right",
        },
        {
          href: "https://github.com/imgproxy",
          position: "right",
          className: "navbar__link--icon navbar__link--github",
          title: "GitHub",
        },
        {
          href: "https://twitter.com/imgproxy_net",
          position: "right",
          className: "navbar__link--icon navbar__link--twitter",
          title: "Twitter",
        },
        {
          href: "https://discord.gg/5GgpXgtC9u",
          position: "right",
          className: "navbar__link--icon navbar__link--discord",
          title: "Discord",
        },
        {
          href: "https://github.com/sponsors/imgproxy",
          position: "right",
          className: "navbar__link--icon navbar__link--sponsor",
          title: "Sponsor imgproxy",
        },
      ],
    },

    footer: {
      style: "dark",
      logo: {
        src: "/img/logo-full.svg",
        href: "https://imgproxy.net",
        target: "_blank",
      },
      copyright: `Copyright © ${new Date().getFullYear()} Foxes With Matches, Inc. Built with Docusaurus.`,
      links: [
        {
          title: "Project",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/imgproxy",
            },
            {
              label: "DockerHub",
              href: "https://hub.docker.com/r/darthsim/imgproxy/",
            },
            {
              label: "Sponsor imgproxy",
              href: "https://github.com/sponsors/imgproxy",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Twitter",
              href: "https://twitter.com/imgproxy_net",
            },
            {
              label: "Discord",
              href: "https://discord.gg/5GgpXgtC9u",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/imgproxy/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "imgproxy.net",
              href: "https://imgproxy.net",
            },
            {
              label: "Blog",
              href: "https://imgproxy.net/blog",
            },
          ],
        },
        {
          title: "Legal",
          items: [
            {
              label: "Privacy policy",
              href: "https://imgproxy.net/privacy/",
            },
            {
              label: "Cookie policy",
              href: "https://imgproxy.net/cookie/",
            },
          ],
        },
      ],
    },

    prism: {
      additionalLanguages: ["bash", "json"],
      theme: prismTheme,
      darkTheme: prismTheme,
    },

    algolia: {
      appId: "PJDUFM5BYU",
      apiKey: "4233fb28085f0a6ad2922954762bf39b",
      indexName: "imgproxy",
    },
  } as PresetClassicThemeConfig,

  markdown: {
    mdx1Compat: {
      comments: false,
      admonitions: false,
    },
  },
};

export default config;
