import { useState } from "react";
import type { City, Traveler, Phase, CityStatus } from "../types";
import { flagFor, KNOWN_COUNTRIES } from "../lib/flags";
import Modal from "./Modal";
import EditableText from "./EditableText";

interface Props {
  city: City;
  travelers: Traveler[];
  meId: string;
  onClose: () => void;
  onChange: (patch: Partial<City>) => void;
  onAddActivity: (title: string) => void;
  onUpdateActivity: (actId: string, patch: Partial<City["activities"][number]>) => void;
  onRemoveActivity: (actId: string) => void;
  onToggleActivityVote: (actId: string) => void;
  onToggleCityVote: () => void;
  onDeleteCity: () => void;
}

export default function CityDetail(props: Props) {
  const { city, travelers, meId } = props;
  const [newAct, setNewAct] = useState("");
  const iVoted = city.votes.includes(meId);

  function addActivity() {
    const t = newAct.trim();
    if (!t) return;
    props.onAddActivity(t);
    setNewAct("");
  }

  // activities sorted by votes desc, keeping stable order otherwise
  const acts = [...city.activities].sort((a, b) => b.votes.length - a.votes.length);

  return (
    <Modal onClose={props.onClose} labelledBy="city-detail-title">
      <div className={`city-detail phase-${city.phase}`}>
        <header className="city-detail-head">
          <span className="city-detail-flag" aria-hidden>
            {flagFor(city.country)}
          </span>
          <div className="city-detail-titles">
            <h2 id="city-detail-title">
              <EditableText
                value={city.name}
                onChange={(name) => props.onChange({ name })}
                ariaLabel="City name"
              />
            </h2>
            <div className="city-detail-meta">
              <input
                className="country-input"
                list="country-list"
                value={city.country}
                onChange={(e) => props.onChange({ country: e.target.value })}
                aria-label="Country"
                placeholder="Country"
              />
              <datalist id="country-list">
                {KNOWN_COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
        </header>

        <div className="city-detail-controls">
          <label className="field">
            <span>Leg</span>
            <select
              value={city.phase}
              onChange={(e) => props.onChange({ phase: e.target.value as Phase })}
            >
              <option value="together">All of us together</option>
              <option value="friends">Friends' leg (Portugal & Spain)</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={city.status}
              onChange={(e) => props.onChange({ status: e.target.value as CityStatus })}
            >
              <option value="idea">Idea — still deciding</option>
              <option value="confirmed">Going for sure</option>
            </select>
          </label>

          <label className="field">
            <span>Nights</span>
            <input
              type="number"
              min={0}
              value={city.nights ?? ""}
              placeholder="–"
              onChange={(e) =>
                props.onChange({ nights: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>

          <button
            className={`vote-btn big ${iVoted ? "voted" : ""}`}
            onClick={props.onToggleCityVote}
          >
            {iVoted ? "★ Keen" : "☆ I'm keen"} · {city.votes.length}
          </button>
        </div>

        <label className="field full">
          <span>Notes</span>
          <textarea
            value={city.notes}
            placeholder="Anything the group should know about this stop…"
            onChange={(e) => props.onChange({ notes: e.target.value })}
            rows={2}
          />
        </label>

        <section className="acts-section">
          <h3>Things to do · {city.activities.length}</h3>

          <div className="add-act">
            <input
              value={newAct}
              placeholder="Add an idea (e.g. food market, museum, day trip…)"
              onChange={(e) => setNewAct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addActivity();
              }}
            />
            <button onClick={addActivity}>Add</button>
          </div>

          <ul className="acts-list">
            {acts.map((a) => {
              const voters = travelers.filter((t) => a.votes.includes(t.id));
              const voted = a.votes.includes(meId);
              return (
                <li key={a.id} className="act-row">
                  <button
                    className={`vote-btn ${voted ? "voted" : ""}`}
                    onClick={() => props.onToggleActivityVote(a.id)}
                    title="Vote for this"
                  >
                    {voted ? "★" : "☆"} {a.votes.length}
                  </button>
                  <div className="act-main">
                    <EditableText
                      value={a.title}
                      onChange={(title) => props.onUpdateActivity(a.id, { title })}
                      ariaLabel="Activity"
                      className="act-title"
                    />
                    {voters.length > 0 && (
                      <div className="voter-dots small" aria-hidden>
                        {voters.map((v) => (
                          <span
                            key={v.id}
                            className="dot"
                            style={{ background: v.color }}
                            title={v.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="icon-btn danger"
                    onClick={() => props.onRemoveActivity(a.id)}
                    aria-label="Remove activity"
                    title="Remove"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
            {acts.length === 0 && <li className="empty">No ideas yet — add the first one above.</li>}
          </ul>
        </section>

        <footer className="city-detail-foot">
          <button
            className="text-danger"
            onClick={() => {
              if (confirm(`Remove ${city.name} from the plan?`)) props.onDeleteCity();
            }}
          >
            Remove this city
          </button>
        </footer>
      </div>
    </Modal>
  );
}
