import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/hawl", "/snapshot"],
    },
    sitemap: "https://zakatplanner.com/sitemap.xml",
  };
}
