import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/learn/"],
        disallow: ["/student/", "/teacher/", "/parent/", "/api/", "/auth/", "/account/", "/practice/"],
      },
    ],
    sitemap: [
      "https://hyelearn.com/sitemap.xml",
      "https://mathaino.net/sitemap.xml",
      "https://ta3allam.org/sitemap.xml",
      "https://diasporalearn.org/sitemap.xml",
      "https://talalearn.com/sitemap.xml",
    ],
  };
}
