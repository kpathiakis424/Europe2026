import type { City, Traveler } from "../types";
import { flagFor } from "../lib/flags";

interface Props {
  city: City;
  travelers: Traveler[];
  meId: string;
  index?: number;
  onOpen: () => void;
  onToggleVote: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function CityCard({
  city,
  travelers,
  meId,
  index,
  onOpen,
  onToggleVote,
  onMoveUp,
  onMoveDown,
}: Props) {
  const voters = travelers.filter((t) => city.votes.includes(t.id));
  const iVoted = city.votes.includes(meId);
  const topActivities = city.activities.slice(0, 3);

  return (
    <div
      className={`city-card phase-${city.phase} status-${city.status}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <div className="city-card-top">
        <span className="city-flag" aria-hidden>
          {index != null && <span className="city-index">{index}</span>}
          {flagFor(city.country)}
        </span>
        <div className="city-headings">
          <h3 className="city-name">{city.name}</h3>
          <span className="city-country">{city.country}</span>
        </div>
        {city.status === "idea" && <span className="tag tag-idea">Idea</span>}
        {city.status === "confirmed" && <span className="tag tag-confirmed">Going</span>}

        {(onMoveUp || onMoveDown) && (
          <div className="reorder" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-btn"
              onClick={onMoveUp}
              disabled={!onMoveUp}
              aria-label="Move earlier"
              title="Move earlier"
            >
              ▲
            </button>
            <button
              className="icon-btn"
              onClick={onMoveDown}
              disabled={!onMoveDown}
              aria-label="Move later"
              title="Move later"
            >
              ▼
            </button>
          </div>
        )}
      </div>

      {city.notes && <p className="city-notes">{city.notes}</p>}

      <div className="city-card-bottom">
        <button
          className={`vote-btn ${iVoted ? "voted" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVote();
          }}
          title="I'm keen on this place"
        >
          {iVoted ? "★" : "☆"} {city.votes.length}
        </button>

        <div className="voter-dots" aria-hidden>
          {voters.slice(0, 5).map((v) => (
            <span key={v.id} className="dot" style={{ background: v.color }} title={v.name} />
          ))}
        </div>

        <span className="activity-count">
          {city.activities.length} {city.activities.length === 1 ? "idea" : "ideas"}
        </span>
      </div>

      {topActivities.length > 0 && (
        <ul className="city-card-acts">
          {topActivities.map((a) => (
            <li key={a.id}>{a.title}</li>
          ))}
          {city.activities.length > 3 && <li className="more">+{city.activities.length - 3} more…</li>}
        </ul>
      )}
    </div>
  );
}
