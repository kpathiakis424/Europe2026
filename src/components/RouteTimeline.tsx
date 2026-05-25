import type { City } from "../types";
import { flagFor } from "../lib/flags";

interface Props {
  cities: City[]; // confirmed cities, already in route order
}

/** A compact ribbon of the confirmed route, with a marker where the group splits. */
export default function RouteTimeline({ cities }: Props) {
  const together = cities.filter((c) => c.phase === "together");
  const friends = cities.filter((c) => c.phase === "friends");

  if (cities.length === 0) {
    return <p className="route-empty">No confirmed stops yet — mark a city as “Going” to build the route.</p>;
  }

  return (
    <div className="route-ribbon" aria-label="Trip route">
      {together.map((c, i) => (
        <span key={c.id} className="route-step">
          {i > 0 && <span className="route-arrow">→</span>}
          <span className="route-chip together">
            {flagFor(c.country)} {c.name}
          </span>
        </span>
      ))}

      {together.length > 0 && friends.length > 0 && (
        <span className="route-split">
          <span className="route-arrow">→</span>
          <span className="split-badge">👋 group splits</span>
          <span className="route-arrow">→</span>
        </span>
      )}

      {friends.map((c, i) => (
        <span key={c.id} className="route-step">
          {i > 0 && <span className="route-arrow">→</span>}
          <span className="route-chip friends">
            {flagFor(c.country)} {c.name}
          </span>
        </span>
      ))}
    </div>
  );
}
