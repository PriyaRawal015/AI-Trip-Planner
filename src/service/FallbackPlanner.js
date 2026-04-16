/**
 * FallbackPlanner.js
 *
 * Rule-Based Trip Planner — used automatically when the Gemini API
 * hits rate limits (429) or is unavailable.
 *
 * Strategy:
 *  1. Fetch top attractions for the destination via Google Places Text Search API.
 *  2. Fetch top hotels for the destination via Google Places Text Search API.
 *  3. Spread attractions across the requested number of days (3 per day).
 *  4. Return a JSON object in the EXACT same structure that Gemini produces,
 *     so the rest of the app (Firebase save, view-trip page) works without changes.
 */

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Call the Google Places Text Search (New) API.
 * Returns an array of raw place objects.
 */
async function searchPlaces(query, maxResults = 10) {
  const url = `https://places.googleapis.com/v1/places:searchText`;

  const body = {
    textQuery: query,
    maxResultCount: maxResults,
    languageCode: "en",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating," +
        "places.location,places.photos,places.priceLevel,places.editorialSummary,places.id",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Build a Google Places photo URL from a photo resource name.
 */
function buildPhotoUrl(place) {
  if (place.photos && place.photos.length > 0) {
    const photoName = place.photos[0].name;
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${PLACES_API_KEY}`;
  }
  // Return a reliable Unsplash fallback image
  return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80`;
}

/**
 * Map Google price level (0–4) to a human-readable price range string.
 */
function mapPriceLevel(priceLevel, budget) {
  const budgetMap = {
    Cheap:    { min: 30,  max: 80  },
    Moderate: { min: 80,  max: 200 },
    Luxury:   { min: 200, max: 600 },
  };
  const range = budgetMap[budget] || budgetMap["Moderate"];
  return `$${range.min} - $${range.max} per night`;
}

/**
 * Distribute an array of items into N day-buckets of `size` items each.
 */
function chunkByDay(items, numDays, perDay = 3) {
  const days = {};
  for (let d = 1; d <= numDays; d++) {
    const start = (d - 1) * perDay;
    days[`day${d}`] = items.slice(start, start + perDay);
  }
  return days;
}

// ─── Main Exported Function ──────────────────────────────────────────────────

/**
 * Generate a complete trip plan using rule-based logic (no AI).
 *
 * @param {object} params
 * @param {string} params.location   - Destination label (e.g. "Paris, France")
 * @param {number} params.noOfDays   - Number of trip days
 * @param {string} params.budget     - "Cheap" | "Moderate" | "Luxury"
 * @param {string} params.traveler   - Traveler description
 * @returns {string} JSON string in the same format as Gemini's output
 */
export async function generateFallbackPlan({ location, noOfDays, budget, traveler }) {
  const days = parseInt(noOfDays, 10) || 3;

  // ── 1. Fetch places & hotels in parallel ──────────────────────────────────
  const attractionsNeeded = days * 3 + 3; // a little buffer
  const [attractionResults, hotelResults] = await Promise.all([
    searchPlaces(`top tourist attractions in ${location}`, attractionsNeeded),
    searchPlaces(`${budget} hotels in ${location}`, 5),
  ]);

  // ── 2. Build hotel options ────────────────────────────────────────────────
  const hotelOptions = hotelResults.map((place) => ({
    hotelName: place.displayName?.text || "Hotel",
    hotelAddress: place.formattedAddress || location,
    price: mapPriceLevel(place.priceLevel, budget),
    hotelImageUrl: buildPhotoUrl(place),
    geoCoordinates: {
      latitude: place.location?.latitude || 0,
      longitude: place.location?.longitude || 0,
    },
    rating: place.rating || 4.0,
    description:
      place.editorialSummary?.text ||
      `A ${budget.toLowerCase()}-friendly hotel in ${location}.`,
  }));

  // ── 3. Build itinerary places ─────────────────────────────────────────────
  const dayThemes = [
    "Highlights & Landmarks",
    "Culture & History",
    "Nature & Local Life",
    "Food & Entertainment",
    "Hidden Gems & Relaxation",
    "Shopping & Souvenirs",
    "Off the Beaten Path",
    "Scenic Views & Photography",
    "Adventure & Activities",
    "Final Day Favourites",
  ];

  const mappedPlaces = attractionResults.map((place, idx) => ({
    placeName: place.displayName?.text || `Attraction ${idx + 1}`,
    placeDetails:
      place.editorialSummary?.text ||
      `A must-visit attraction in ${location}. Loved by travellers worldwide.`,
    placeImageUrl: buildPhotoUrl(place),
    geoCoordinates: {
      latitude: place.location?.latitude || 0,
      longitude: place.location?.longitude || 0,
    },
    ticketPricing: budget === "Cheap" ? "Free – $10" : budget === "Moderate" ? "$10 – $30" : "$30+",
    rating: place.rating || 4.3,
    timeTravel: idx % 3 === 0 ? "Morning" : idx % 3 === 1 ? "Afternoon" : "Evening",
  }));

  const dayBuckets = chunkByDay(mappedPlaces, days, 3);

  const itinerary = {};
  for (let d = 1; d <= days; d++) {
    const key = `day${d}`;
    itinerary[key] = {
      theme: dayThemes[(d - 1) % dayThemes.length],
      bestTimeToVisit: d <= 2 ? "Morning/Afternoon" : "Afternoon/Evening",
      places: dayBuckets[key] || [],
    };
  }

  // ── 4. Compose final JSON (same structure as Gemini output) ───────────────
  const tripPlan = {
    tripDetails: {
      location,
      duration: `${days} Days`,
      travelers: traveler,
      budget,
      generatedBy: "Rule-Based Fallback (Google Places)",
    },
    hotelOptions,
    itinerary,
  };

  return JSON.stringify(tripPlan);
}
