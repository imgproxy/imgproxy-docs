// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const defaultUrl = "https://docs.imgproxy.net";

const getSiteUrl = () => {
  if (process.env.NETLIFY && process.env.CONTEXT !== "production")
    return process.env.DEPLOY_PRIME_URL || defaultUrl;

  return defaultUrl;
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'imgproxy documentation',
  tagline: 'Optimize images for web on the fly',
  favicon: '/img/favicon.ico',

  // Set the production url of your site here
  url: getSiteUrl(),

  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: [
    '/docsify-anchor-fix.js',
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'crossorigin',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Martian+Mono:wght@300;600&display=swap',
      },
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // sidebarCollapsed: false,

          versions: {
            current: {
              label: 'latest',
              path: 'latest',
              banner: 'unreleased',
            }
          },

          editUrl:
            'https://github.com/imgproxy/imgproxy-docs/tree/main/',

          admonitions: {
            tag: ':::',
            keywords: ['note', 'tip', 'info', 'caution', 'danger', 'slow'],
          },

          remarkPlugins: [
            require('./src/remark/badge'),
            require('./src/remark/code-anchor'),
          ],
        },

        blog: false,

        theme: {
          customCss: [
            require.resolve('./src/css/general.css'),
            require.resolve('./src/css/navbar.css'),
            require.resolve('./src/css/menu.css'),
            require.resolve('./src/css/badge.css'),
            require.resolve('./src/css/code-anchor.css'),
            require.resolve('./src/css/heading-pattern.css'),
          ]
        },

        gtag: {
          trackingID: 'G-4ME3KE3EJC',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        title: 'imgproxy',
        logo: {
          alt: 'imgproxy Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docsVersionDropdown',
            position: 'left',
          },
          {
            type: 'search',
            position: 'left',
          },
          {
            label: 'imgproxy.net',
            href: 'https://imgproxy.net',
            position: 'right'
          },
          {
            html: '<span>GitHub</span>',
            href: 'https://github.com/imgproxy',
            position: 'right',
            className: 'navbar__link--icon navbar__link--github',
            'title': 'GitHub',
          },
          {
            html: '<span>Twitter</span>',
            href: 'https://twitter.com/imgproxy_net',
            position: 'right',
            className: 'navbar__link--icon navbar__link--twitter',
            'title': 'Twitter',
          },
          {
            html: '<span>Discord</span>',
            href: 'https://discord.gg/5GgpXgtC9u',
            position: 'right',
            className: 'navbar__link--icon navbar__link--discord',
            'title': 'Discord',
          },
          {
            html: '<span>Sponsor imgproxy</span>',
            href: 'https://github.com/sponsors/imgproxy',
            position: 'right',
            className: 'navbar__link--icon navbar__link--sponsor',
            'title': 'Sponsor imgproxy',
          },
        ],
      },

      footer: {
        style: 'dark',
        logo: {
          src: '/img/logo-full.svg',
          href: 'https://imgproxy.net',
          target: '_blank',
        },
        copyright: `Copyright © ${new Date().getFullYear()} Foxes With Matches, Inc. Built with Docusaurus.`,
        links: [
          {
            title: 'Project',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/imgproxy',
              },
              {
                label: 'DockerHub',
                href: 'https://hub.docker.com/r/darthsim/imgproxy/',
              },
              {
                label: 'Sponsor imgproxy',
                href: 'https://github.com/sponsors/imgproxy',
              }
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/imgproxy_net',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/5GgpXgtC9u',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/imgproxy/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'imgproxy.net',
                href: 'https://imgproxy.net',
              },
              {
                label: 'Blog',
                href: 'https://imgproxy.net/blog',
              },
            ],
          },
          {
            title: 'Legal',
            items: [
              {
                label: 'Privacy policy',
                href: 'https://imgproxy.net/privacy/',
              },
              {
                label: 'Cookie policy',
                href: 'https://imgproxy.net/cookie/',
              },
            ],
          },
        ],
      },

      prism: {
        theme: require('./src/prism/theme'),
        darkTheme: require('./src/prism/theme'),
      },
    }),

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions & import('@docusaurus/types').PluginOptions} */
      ({
        indexBlog: false,
        docsRouteBasePath: '/',
        hashed: true,
        ignoreCssSelectors: ['.badge'],
      }),
    ],
  ],
};

module.exports = config;
