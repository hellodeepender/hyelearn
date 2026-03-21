import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/student/", "/teacher/", "/parent/", "/api/", "/auth/", "/account/", "/practice/"],
      },
    ],
    sitemap: [
      "https://hyelearn.com/sitemap.xml",
      "https://mathaino.net/sitemap.xml",
      "https://diasporalearn.org/sitemap.xml",
    ],
  };
}
