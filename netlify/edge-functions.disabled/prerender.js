export default async (request, context) => {
  const uaRaw = request.headers.get("user-agent") || "";
  const ua = uaRaw.toLowerCase();
  const url = new URL(request.url);

  // Don't re-prerender prerender's own rendering requests (prevents loops)
  const alreadyFromPrerender =
    request.headers.get("x-prerender") ||
    request.headers.get("x-prerender-token") ||
    request.headers.get("x-rendering") ||
    request.headers.get("x-prerender-forwarded");

  if (alreadyFromPrerender) return context.next();

  // Force test in browser with ?prerender=1
  const force = url.searchParams.get("prerender") === "1";

  const isBot =
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("yandex") ||
    ua.includes("baiduspider") ||
    ua.includes("duckduckbot") ||
    ua.includes("slurp") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot") ||
    ua.includes("linkedinbot") ||
    ua.includes("pinterest") ||
    ua.includes("slackbot") ||
    ua.includes("whatsapp") ||
    ua.includes("telegram") ||
    ua.includes("prerender");

  // Skip assets
  const p = url.pathname.toLowerCase();
  const isAsset =
    p.startsWith("/assets/") ||
    p.endsWith(".js") ||
    p.endsWith(".css") ||
    p.endsWith(".png") ||
    p.endsWith(".jpg") ||
    p.endsWith(".jpeg") ||
    p.endsWith(".webp") ||
    p.endsWith(".svg") ||
    p.endsWith(".ico") ||
    p.endsWith(".txt") ||
    p.endsWith(".xml") ||
    p.endsWith(".map") ||
    p.endsWith(".json") ||
    p.endsWith(".woff") ||
    p.endsWith(".woff2") ||
    p.endsWith(".ttf") ||
    p.endsWith(".eot") ||
    p.endsWith(".webmanifest");

  // Only prerender bots (or forced test)
  if (!force && (!isBot || isAsset)) return context.next();

  const token = Deno.env.get("PRERENDER_TOKEN");
  if (!token) return context.next();

  // Remove test param so prerender fetches a clean URL
  url.searchParams.delete("prerender");
  const cleanSearch = url.searchParams.toString();
  const cleanUrl =
    url.origin + url.pathname + (cleanSearch ? `?${cleanSearch}` : "");

  const prerenderUrl = `https://service.prerender.io/${cleanUrl}`;

  const upstream = await fetch(prerenderUrl, {
    headers: {
      "X-Prerender-Token": token,
      "User-Agent": uaRaw || "bot",
    },
  });

  const headers = new Headers(upstream.headers);
  headers.set("x-edge-prerender", "hit");

  return new Response(upstream.body, { status: upstream.status, headers });
};

