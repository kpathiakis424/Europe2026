import type { Trip } from "../types";
import { makeSeedTrip } from "./seed";

const KEY = "europe2026.trip.v1";

export function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    /* ignore corrupt storage */
  }
  return makeSeedTrip();
}

export function saveTrip(trip: Trip): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(trip));
  } catch {
    /* storage full / disabled — ignore */
  }
}

function migrate(trip: any): Trip {
  // Minimal forward-compat: ensure required arrays exist.
  trip.travelers ??= [];
  trip.cities ??= [];
  trip.dates ??= "";
  for (const c of trip.cities) {
    c.votes ??= [];
    c.activities ??= [];
    for (const a of c.activities) a.votes ??= [];
  }
  return trip as Trip;
}

// ---- Share via URL (no backend) ----
// Encodes the whole plan into the location hash as UTF-8 safe base64.

function toBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function fromBase64(b64: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(b64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function encodeTripToUrl(trip: Trip): string {
  const payload = toBase64(JSON.stringify(trip));
  const base = `${location.origin}${location.pathname}`;
  return `${base}#plan=${payload}`;
}

export function readSharedTripFromUrl(): Trip | null {
  const hash = location.hash;
  const match = hash.match(/#plan=(.+)$/);
  if (!match) return null;
  try {
    const trip = migrate(JSON.parse(fromBase64(match[1])));
    return trip;
  } catch {
    return null;
  }
}

export function clearUrlHash(): void {
  history.replaceState(null, "", `${location.origin}${location.pathname}${location.search}`);
}

// ---- Export / Import as a file ----
export function exportTripFile(trip: Trip): void {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "europe-2026-plan.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importTripFile(file: File): Promise<Trip> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(migrate(JSON.parse(String(reader.result))));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
