import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hallomada.de";

  const routes = ["", "/jobs", "/listings", "/communities"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "weekly",
    priority: route === "" ? 1 : 0.8,
    alternates: {
      languages: {
        en: `${baseUrl}/en${route}`,
        fr: `${baseUrl}/fr${route}`,
        de: `${baseUrl}/de${route}`,
      },
    },
  }));
}
