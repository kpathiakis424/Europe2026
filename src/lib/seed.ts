import type { Trip, City, Activity } from "../types";
import { uid } from "./id";

function act(title: string, category = "", notes = ""): Activity {
  return { id: uid("act"), title, category, notes, votes: [] };
}

function city(
  partial: Omit<City, "id" | "votes" | "activities"> & {
    activities?: Activity[];
  }
): City {
  return {
    id: uid("city"),
    votes: [],
    activities: partial.activities ?? [],
    ...partial,
  };
}

export function makeSeedTrip(): Trip {
  return {
    version: 1,
    title: "Europe 2026",
    dates: "",
    travelers: [
      { id: uid("trav"), name: "You", color: "#6366f1" },
      { id: uid("trav"), name: "Friend 2", color: "#10b981" },
      { id: uid("trav"), name: "Friend 3", color: "#f59e0b" },
      { id: uid("trav"), name: "Friend 4", color: "#ec4899" },
    ],
    cities: [
      // ---- Phase 1: all four of us together ----
      city({
        name: "Zürich",
        country: "Switzerland",
        phase: "together",
        status: "confirmed",
        nights: null,
        notes: "Our starting point — all four of us.",
        activities: [
          act("Wander the Altstadt (Old Town)", "Explore"),
          act("Lake Zürich boat / promenade walk", "Explore"),
          act("Lindenhof viewpoint", "Views"),
          act("Day trip to Lucerne + Mt. Rigi/Pilatus", "Day trip"),
          act("Bahnhofstrasse + a proper Swiss chocolate stop", "Food"),
        ],
      }),
      city({
        name: "London",
        country: "United Kingdom",
        phase: "together",
        status: "confirmed",
        nights: null,
        notes: "Second leg together before the group splits.",
        activities: [
          act("A West End show", "Night out"),
          act("Borough Market", "Food"),
          act("South Bank walk (Tate Modern → Tower Bridge)", "Explore"),
          act("Tower of London", "History"),
          act("Camden Market", "Explore"),
          act("Maybe a day trip — Oxford or Bath?", "Day trip"),
        ],
      }),

      // ---- In-between ideas to figure out together ----
      city({
        name: "Paris",
        country: "France",
        phase: "together",
        status: "idea",
        nights: null,
        notes: "On the way between Switzerland and the UK. Eurostar into London.",
        activities: [
          act("Eiffel Tower at golden hour", "Views"),
          act("Louvre / Musée d'Orsay", "Culture"),
          act("Le Marais wander + cafés", "Explore"),
        ],
      }),
      city({
        name: "Lucerne",
        country: "Switzerland",
        phase: "together",
        status: "idea",
        nights: null,
        notes: "Easy add-on from Zürich if we want more Alps.",
        activities: [
          act("Chapel Bridge & old town", "Explore"),
          act("Cable car up Mt. Pilatus", "Views"),
        ],
      }),
      city({
        name: "Amsterdam",
        country: "Netherlands",
        phase: "together",
        status: "idea",
        nights: null,
        notes: "Detour idea — short hop / train to London possible.",
        activities: [
          act("Canal walk + boat", "Explore"),
          act("Van Gogh Museum", "Culture"),
        ],
      }),
      city({
        name: "Bruges",
        country: "Belgium",
        phase: "together",
        status: "idea",
        nights: null,
        notes: "Charming + on the way toward the Channel.",
        activities: [act("Old town + canals", "Explore"), act("Waffles & beer", "Food")],
      }),

      // ---- Phase 2: friends continue — Portugal & Spain (~2 weeks) ----
      city({
        name: "Lisbon",
        country: "Portugal",
        phase: "friends",
        status: "confirmed",
        nights: null,
        notes: "Friends' leg after we split. ~2 weeks across Portugal & Spain.",
        activities: [
          act("Alfama & tram 28", "Explore"),
          act("Belém — pastéis de nata", "Food"),
          act("Day trip to Sintra", "Day trip"),
          act("Time Out Market", "Food"),
        ],
      }),
      city({
        name: "Porto",
        country: "Portugal",
        phase: "friends",
        status: "idea",
        nights: null,
        notes: "",
        activities: [
          act("Ribeira riverfront", "Explore"),
          act("Port wine tasting in Gaia", "Food"),
          act("Livraria Lello", "Culture"),
        ],
      }),
      city({
        name: "Seville",
        country: "Spain",
        phase: "friends",
        status: "idea",
        nights: null,
        notes: "",
        activities: [
          act("Real Alcázar", "History"),
          act("Flamenco night", "Night out"),
        ],
      }),
      city({
        name: "Madrid",
        country: "Spain",
        phase: "friends",
        status: "idea",
        nights: null,
        notes: "",
        activities: [
          act("Prado Museum", "Culture"),
          act("Retiro Park", "Explore"),
          act("Tapas crawl in La Latina", "Food"),
        ],
      }),
      city({
        name: "Barcelona",
        country: "Spain",
        phase: "friends",
        status: "confirmed",
        nights: null,
        notes: "Likely finish point for the friends' leg.",
        activities: [
          act("Sagrada Família", "Culture"),
          act("Gothic Quarter wander", "Explore"),
          act("Beach + seafood", "Food"),
        ],
      }),
    ],
  };
}
