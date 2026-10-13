const MODULES = {
  vratKatha: { title: "Vrat Katha", route: "/vrat-katha" },
  teachingContent: { title: "Teachings" },
  chalisa: { title: "Chalisa", route: "/chalisa" },
  mantra: { title: "Mantra", route: "/mantra" },
  arti: { title: "Aarti", route: "/aarti" },
  jaapMala: { title: "Jaap Mala", route: "/jaapmala" },
  vrat: { title: "Vrat" },
  wallpaper: { title: "Wallpaper", route: "/wallpaper" },
  categories: { title: "Categories", route: "/kahaniya" },
  featureContent: { title: "Featured Content", route: "/kahaniya-details" },
  pujaKare: { title: "Puja Kare", route: "/puja-kare" },
};

export function getSearchGroups(response) {
  if (response?.status !== "success" || !response?.data ||
      !response.data.modules || typeof response.data.modules !== "object" ||
      Array.isArray(response.data.modules)) {
    throw new Error("Invalid search response");
  }

  return Object.entries(response.data.modules).flatMap(([key, value]) => {
    const items = Array.isArray(value)
      ? value.filter((item) => item && typeof item === "object" && (item.id || item._id))
      : [];
    if (!items.length) return [];
    const title = MODULES[key]?.title || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
    return [{ key, title, items }];
  });
}

export function getSearchTitle(item, language) {
  if (typeof item.title === "string") return item.title.trim();
  const title = item.title?.[language] || item.title?.en || item.title?.hi;
  return typeof title === "string" ? title.trim() : "";
}

export function getSearchDestination(item, group, origin) {
  if (typeof item.meta?.url === "string" && item.meta.url.trim()) {
    try {
      const url = new URL(item.meta.url, origin);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin === origin ? url.pathname + url.search + url.hash : url.href;
      }
    } catch {
      // Fall back to the existing module route when the supplied URL is invalid.
    }
  }

  const id = encodeURIComponent(item.id || item._id);
  if (MODULES[group]?.route) return `${MODULES[group].route}/${id}`;
  if (group === "teachingContent") {
    return item.meta?.categoryId ? `/guru-ji/${encodeURIComponent(item.meta.categoryId)}` : "/guru-ji";
  }
  if (group === "vrat") return "/vrat-katha";
  return null;
}
