import { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "getting_started",
    {
      type: "link",
      label: "imgproxy Pro",
      href: "https://imgproxy.net#pro",
      className: "menu__list-item--badge badge--pro",
    },
    "installation",
    {
      type: "category",
      label: "Configuration",
      link: {
        type: "generated-index",
        description: "Learn about how to configure imgproxy",
      },
      items: [
        "configuration/options",
        "configuration/loading_environment_variables",
      ],
    },
    {
      type: "category",
      label: "Usage",
      link: {
        type: "generated-index",
        description:
          "Learn about how to use imgproxy to process images or get images info",
      },
      items: [
        "usage/processing",
        {
          type: "doc",
          id: "usage/getting_info",
          className: "menu__list-item--badge badge--pro",
        },
        "usage/signing_url",
        {
          type: "doc",
          id: "usage/encrypting_source_url",
          className: "menu__list-item--badge badge--pro",
        },
        "usage/presets",
      ],
    },
    {
      type: "category",
      label: "Features",
      link: {
        type: "generated-index",
        description: "Learn about imgproxy features",
      },
      items: [
        "features/watermark",
        {
          type: "doc",
          id: "features/object_detection",
          className: "menu__list-item--badge badge--pro",
        },
        {
          type: "doc",
          id: "features/autoquality",
          className: "menu__list-item--badge badge--pro",
        },
        {
          type: "doc",
          id: "features/best_format",
          className: "menu__list-item--badge badge--pro",
        },
        {
          type: "doc",
          id: "features/chained_pipelines",
          className: "menu__list-item--badge badge--pro",
        },
      ],
    },
    {
      type: "category",
      label: "Image sources",
      link: {
        type: "generated-index",
        description:
          "Learn about how to configure imgproxy to serve images from various sources",
      },
      items: [
        "image_sources/local_files",
        "image_sources/amazon_s3",
        "image_sources/google_cloud_storage",
        "image_sources/azure_blob_storage",
        "image_sources/openstack_swift",
      ],
    },
    {
      type: "category",
      label: "Monitoring",
      link: {
        type: "generated-index",
        description:
          "Learn about how to configure monitoring of your imgproxy instances",
      },
      items: [
        "monitoring/new_relic",
        "monitoring/prometheus",
        "monitoring/datadog",
        "monitoring/open_telemetry",
        "monitoring/cloud_watch",
      ],
    },
    "image_formats_support",
    "about_processing_pipeline",
    "healthcheck",
    "memory_usage_tweaks",
  ],
};

export default sidebars;
