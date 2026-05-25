import { useEffect, useMemo, useRef, useState } from "react";
import type { Trip, City, Activity, Phase } from "./types";
import { uid } from "./lib/id";
import {
  loadTrip,
  saveTrip,
  encodeTripToUrl,
  readSharedTripFromUrl,
  clearUrlHash,
  exportTripFile,
  importTripFile,
} from "./lib/storage";
import Travelers from "./components/Travelers";
import RouteTimeline from "./components/RouteTimeline";
import CityCard from "./components/CityCard";
import CityDetail from "./components/CityDetail";
import EditableText from "./components/EditableText";

const ME_KEY = "europe2026.me.v1";

export default function App() {
  const [trip, setTrip] = useState<Trip>(() => loadTrip());
  const [meId, setMeId] = useState<string>(
    () => localStorage.getItem(ME_KEY) || ""
  );
  const [openCityId, setOpenCityId] = useState<string | null>(null);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);
  const [shareMsg, setShareMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Detect a shared plan in the URL on first load.
  useEffect(() => {
    const shared = readSharedTripFromUrl();
    if (shared) setSharedTrip(shared);
  }, []);

  // Persist on change.
  useEffect(() => saveTrip(trip), [trip]);
  useEffect(() => {
    if (meId) localStorage.setItem(ME_KEY, meId);
  }, [meId]);

  // Keep "me" valid against current travelers.
  useEffect(() => {
    if (trip.travelers.length === 0) return;
    if (!trip.travelers.some((t) => t.id === meId)) {
      setMeId(trip.travelers[0].id);
    }
  }, [trip.travelers, meId]);

  // ---- mutations ----
  const update = (fn: (draft: Trip) => Trip) => setTrip((t) => fn(structuredCloneSafe(t)));

  const updateCity = (id: string, patch: Partial<City>) =>
    update((t) => {
      const c = t.cities.find((x) => x.id === id);
      if (c) Object.assign(c, patch);
      return t;
    });

  const toggleVoteList = (list: string[]): string[] =>
    list.includes(meId) ? list.filter((x) => x !== meId) : [...list, meId];

  const toggleCityVote = (id: string) =>
    update((t) => {
      const c = t.cities.find((x) => x.id === id);
      if (c) c.votes = toggleVoteList(c.votes);
      return t;
    });

  const addCity = (phase: Phase) => {
    const id = uid("city");
    update((t) => {
      t.cities.push({
        id,
        name: "New stop",
        country: "",
        phase,
        status: "idea",
        nights: null,
        notes: "",
        votes: [],
        activities: [],
      });
      return t;
    });
    setOpenCityId(id);
  };

  const deleteCity = (id: string) =>
    update((t) => {
      t.cities = t.cities.filter((c) => c.id !== id);
      return t;
    });

  const addActivity = (cityId: string, title: string) =>
    update((t) => {
      const c = t.cities.find((x) => x.id === cityId);
      if (c)
        c.activities.push({ id: uid("act"), title, category: "", notes: "", votes: [] } as Activity);
      return t;
    });

  const updateActivity = (cityId: string, actId: string, patch: Partial<Activity>) =>
    update((t) => {
      const a = t.cities.find((x) => x.id === cityId)?.activities.find((y) => y.id === actId);
      if (a) Object.assign(a, patch);
      return t;
    });

  const removeActivity = (cityId: string, actId: string) =>
    update((t) => {
      const c = t.cities.find((x) => x.id === cityId);
      if (c) c.activities = c.activities.filter((a) => a.id !== actId);
      return t;
    });

  const toggleActivityVote = (cityId: string, actId: string) =>
    update((t) => {
      const a = t.cities.find((x) => x.id === cityId)?.activities.find((y) => y.id === actId);
      if (a) a.votes = toggleVoteList(a.votes);
      return t;
    });

  const renameTraveler = (id: string, name: string) =>
    update((t) => {
      const trav = t.travelers.find((x) => x.id === id);
      if (trav) trav.name = name;
      return t;
    });

  // Reorder a city within its "lane" (the displayed, ordered subset).
  const moveCity = (id: string, lane: City[], dir: -1 | 1) => {
    const pos = lane.findIndex((c) => c.id === id);
    const neighbor = lane[pos + dir];
    if (!neighbor) return;
    update((t) => {
      const i = t.cities.findIndex((c) => c.id === id);
      const j = t.cities.findIndex((c) => c.id === neighbor.id);
      [t.cities[i], t.cities[j]] = [t.cities[j], t.cities[i]];
      return t;
    });
  };

  // ---- derived lanes ----
  const togetherConfirmed = useMemo(
    () => trip.cities.filter((c) => c.phase === "together" && c.status === "confirmed"),
    [trip.cities]
  );
  const togetherIdeas = useMemo(
    () =>
      trip.cities
        .filter((c) => c.phase === "together" && c.status === "idea")
        .sort((a, b) => b.votes.length - a.votes.length),
    [trip.cities]
  );
  const friendsCities = useMemo(
    () => trip.cities.filter((c) => c.phase === "friends"),
    [trip.cities]
  );
  const confirmedRoute = useMemo(
    () => trip.cities.filter((c) => c.status === "confirmed"),
    [trip.cities]
  );

  const openCity = trip.cities.find((c) => c.id === openCityId) || null;

  // ---- share / import ----
  async function share() {
    const url = encodeTripToUrl(trip);
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied — paste it to the group!");
    } catch {
      setShareMsg("Copy this link: " + url);
    }
    setTimeout(() => setShareMsg(""), 4000);
  }

  function loadShared() {
    if (!sharedTrip) return;
    setTrip(sharedTrip);
    setMeId(sharedTrip.travelers[0]?.id || "");
    setSharedTrip(null);
    clearUrlHash();
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importTripFile(file);
      if (confirm("Replace the current plan with this file?")) {
        setTrip(imported);
        setMeId(imported.travelers[0]?.id || "");
      }
    } catch {
      alert("Sorry — that file didn't look like a valid plan.");
    }
    e.target.value = "";
  }

  return (
    <div className="app">
      {sharedTrip && (
        <div className="share-banner">
          <span>📨 Someone shared a plan with you ({sharedTrip.cities.length} stops).</span>
          <div>
            <button className="btn primary" onClick={loadShared}>
              Load it
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setSharedTrip(null);
                clearUrlHash();
              }}
            >
              Keep mine
            </button>
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="topbar-main">
          <h1 className="trip-title">
            <EditableText
              value={trip.title}
              onChange={(title) => update((t) => ((t.title = title), t))}
              ariaLabel="Trip title"
            />
          </h1>
          <div className="trip-dates">
            <span className="cal">🗓️</span>
            <EditableText
              value={trip.dates}
              onChange={(dates) => update((t) => ((t.dates = dates), t))}
              placeholder="Add dates"
              ariaLabel="Trip dates"
            />
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn primary" onClick={share} title="Copy a link with the whole plan">
            🔗 Share
          </button>
          <button className="btn ghost" onClick={() => exportTripFile(trip)} title="Download a backup">
            ⬇︎ Export
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()} title="Load a saved file">
            ⬆︎ Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={onImportFile}
          />
        </div>
      </header>

      {shareMsg && <div className="toast">{shareMsg}</div>}

      <Travelers
        travelers={trip.travelers}
        meId={meId}
        onSetMe={setMeId}
        onRename={renameTraveler}
      />

      <section className="route-card">
        <h2 className="route-title">The route so far</h2>
        <RouteTimeline cities={confirmedRoute} />
      </section>

      {/* ---- Together leg ---- */}
      <Section
        kicker="Phase 1 · all four of us"
        title="Together — Zürich, London & in between"
        accent="together"
        onAdd={() => addCity("together")}
        addLabel="Add a stop"
      >
        {togetherConfirmed.length === 0 ? (
          <Empty>No confirmed stops yet.</Empty>
        ) : (
          <div className="grid">
            {togetherConfirmed.map((c, i) => (
              <CityCard
                key={c.id}
                city={c}
                travelers={trip.travelers}
                meId={meId}
                index={i + 1}
                onOpen={() => setOpenCityId(c.id)}
                onToggleVote={() => toggleCityVote(c.id)}
                onMoveUp={i > 0 ? () => moveCity(c.id, togetherConfirmed, -1) : undefined}
                onMoveDown={
                  i < togetherConfirmed.length - 1
                    ? () => moveCity(c.id, togetherConfirmed, 1)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </Section>

      {/* ---- In-between ideas ---- */}
      <Section
        kicker="Help decide"
        title="Where should we go in between? — vote ⭐"
        accent="together"
        onAdd={() => addCity("together")}
        addLabel="Suggest a place"
      >
        {togetherIdeas.length === 0 ? (
          <Empty>No suggestions yet — add one!</Empty>
        ) : (
          <div className="grid">
            {togetherIdeas.map((c) => (
              <CityCard
                key={c.id}
                city={c}
                travelers={trip.travelers}
                meId={meId}
                onOpen={() => setOpenCityId(c.id)}
                onToggleVote={() => toggleCityVote(c.id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* ---- Friends' leg ---- */}
      <Section
        kicker="Phase 2 · friends continue (~2 weeks)"
        title="Friends' leg — Portugal & Spain"
        accent="friends"
        onAdd={() => addCity("friends")}
        addLabel="Add a stop"
      >
        {friendsCities.length === 0 ? (
          <Empty>Nothing here yet.</Empty>
        ) : (
          <div className="grid">
            {friendsCities.map((c, i) => (
              <CityCard
                key={c.id}
                city={c}
                travelers={trip.travelers}
                meId={meId}
                index={i + 1}
                onOpen={() => setOpenCityId(c.id)}
                onToggleVote={() => toggleCityVote(c.id)}
                onMoveUp={i > 0 ? () => moveCity(c.id, friendsCities, -1) : undefined}
                onMoveDown={
                  i < friendsCities.length - 1 ? () => moveCity(c.id, friendsCities, 1) : undefined
                }
              />
            ))}
          </div>
        )}
      </Section>

      <footer className="app-foot">
        <p>
          Saved on this device automatically. Use <strong>Share</strong> to send the latest plan to the
          group, or <strong>Export</strong> for a backup. Pick yourself up top so your ⭐ votes are yours.
        </p>
      </footer>

      {openCity && (
        <CityDetail
          city={openCity}
          travelers={trip.travelers}
          meId={meId}
          onClose={() => setOpenCityId(null)}
          onChange={(patch) => updateCity(openCity.id, patch)}
          onAddActivity={(title) => addActivity(openCity.id, title)}
          onUpdateActivity={(actId, patch) => updateActivity(openCity.id, actId, patch)}
          onRemoveActivity={(actId) => removeActivity(openCity.id, actId)}
          onToggleActivityVote={(actId) => toggleActivityVote(openCity.id, actId)}
          onToggleCityVote={() => toggleCityVote(openCity.id)}
          onDeleteCity={() => {
            deleteCity(openCity.id);
            setOpenCityId(null);
          }}
        />
      )}
    </div>
  );
}

function Section(props: {
  kicker: string;
  title: string;
  accent: "together" | "friends";
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`section accent-${props.accent}`}>
      <div className="section-head">
        <div>
          <div className="section-kicker">{props.kicker}</div>
          <h2 className="section-title">{props.title}</h2>
        </div>
        <button className="btn add" onClick={props.onAdd}>
          + {props.addLabel}
        </button>
      </div>
      {props.children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="section-empty">{children}</p>;
}

// structuredClone exists in modern browsers; fall back to JSON for safety.
function structuredCloneSafe<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}
