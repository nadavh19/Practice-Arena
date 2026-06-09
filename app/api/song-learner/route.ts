import { apiError, apiSuccess } from "@/lib/api-response";
import { getRegularUserFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { songLearnerSchema } from "@/lib/validators";

type SerpApiOrganicResult = {
  link?: unknown;
  title?: unknown;
};

type SerpApiSearchResponse = {
  organic_results?: SerpApiOrganicResult[];
  error?: string;
};

type MatchResult = {
  isFallback: boolean;
  url: string;
};

const learningGuide =
  "Start by listening to the song a few times and marking the main sections. Learn the easiest recognizable part first, slow it down, and loop short phrases until your timing feels steady. Add the next section only when the current one feels comfortable, then practice the transitions and finish by playing along with the original track.";

function buildSearchText(title: string, artist?: string) {
  return [title, artist].filter(Boolean).join(" ").trim();
}

function buildGoogleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

async function searchGoogle(query: string): Promise<SerpApiOrganicResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not set");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    engine: "google",
    num: "10",
    q: query,
  });

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SerpApi request failed");
  }

  const payload = (await response.json()) as SerpApiSearchResponse;
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.organic_results ?? [];
}

function getHostname(link: unknown) {
  if (typeof link !== "string") {
    return null;
  }

  try {
    return new URL(link).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getLink(link: unknown) {
  return typeof link === "string" ? link : null;
}

function getUltimateGuitarPriority(hostname: string) {
  if (hostname === "tabs.ultimate-guitar.com") {
    return 0;
  }

  if (hostname === "www.ultimate-guitar.com") {
    return 1;
  }

  if (hostname === "ultimate-guitar.com" || hostname.endsWith(".ultimate-guitar.com")) {
    return 2;
  }

  return null;
}

function pickUltimateGuitarResult(results: SerpApiOrganicResult[], fallbackUrl: string): MatchResult {
  const matches = results
    .map((result, index) => {
      const link = getLink(result.link);
      const hostname = getHostname(result.link);
      if (!link || !hostname) {
        return null;
      }

      const priority = getUltimateGuitarPriority(hostname);
      if (priority === null) {
        return null;
      }

      return { index, link, priority };
    })
    .filter((match): match is { index: number; link: string; priority: number } => Boolean(match))
    .sort((a, b) => a.priority - b.priority || a.index - b.index);

  const bestMatch = matches[0];
  return {
    isFallback: !bestMatch,
    url: bestMatch?.link ?? fallbackUrl,
  };
}

function pickYoutubeResult(results: SerpApiOrganicResult[], fallbackUrl: string): MatchResult {
  const youtubeResults = results
    .map((result, index) => {
      const link = getLink(result.link);
      const hostname = getHostname(result.link);
      if (!link || !hostname || (hostname !== "youtube.com" && !hostname.endsWith(".youtube.com"))) {
        return null;
      }

      const isWatchUrl = link.includes("youtube.com/watch");
      return { index, isWatchUrl, link };
    })
    .filter((match): match is { index: number; isWatchUrl: boolean; link: string } => Boolean(match));

  const watchMatch = youtubeResults.find((result) => result.isWatchUrl);
  const bestMatch = watchMatch ?? youtubeResults[0];

  return {
    isFallback: !bestMatch,
    url: bestMatch?.link ?? fallbackUrl,
  };
}

export async function POST(request: Request) {
  const authUser = await getRegularUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = songLearnerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const searchText = buildSearchText(parsed.data.title, parsed.data.artist);
  const ultimateGuitarQuery = `${searchText} tabs`;
  const youtubeQuery = `${searchText} official audio OR official video`;
  const ultimateGuitarFallbackUrl = buildGoogleSearchUrl(ultimateGuitarQuery);
  const youtubeFallbackUrl = buildGoogleSearchUrl(youtubeQuery);

  try {
    const [ultimateGuitarResults, youtubeResults] = await Promise.all([
      searchGoogle(ultimateGuitarQuery),
      searchGoogle(youtubeQuery),
    ]);

    const ultimateGuitarMatch = pickUltimateGuitarResult(ultimateGuitarResults, ultimateGuitarFallbackUrl);
    const youtubeMatch = pickYoutubeResult(youtubeResults, youtubeFallbackUrl);

    return apiSuccess({
      learningGuide,
      ultimateGuitarIsFallback: ultimateGuitarMatch.isFallback,
      ultimateGuitarUrl: ultimateGuitarMatch.url,
      youtubeIsFallback: youtubeMatch.isFallback,
      youtubeUrl: youtubeMatch.url,
    });
  } catch (error) {
    const message = error instanceof Error && error.message === "SERPAPI_API_KEY is not set"
      ? "SERPAPI_API_KEY is not set. Add it to your environment to enable Song Learner search."
      : "Song Learner could not search right now. Please try again.";

    return apiError(500, {
      code: "SONG_LEARNER_SEARCH_FAILED",
      message,
    });
  }
}
