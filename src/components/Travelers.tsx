import type { Traveler } from "../types";
import EditableText from "./EditableText";

interface Props {
  travelers: Traveler[];
  meId: string;
  onSetMe: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Travelers({ travelers, meId, onSetMe, onRename }: Props) {
  return (
    <div className="travelers">
      <div className="travelers-label">Who are you?</div>
      <div className="travelers-row">
        {travelers.map((t) => (
          <div key={t.id} className={`traveler-chip ${t.id === meId ? "is-me" : ""}`}>
            <button
              className="avatar"
              style={{ background: t.color }}
              onClick={() => onSetMe(t.id)}
              title={t.id === meId ? "This is you" : `Set as you`}
              aria-pressed={t.id === meId}
            >
              {initials(t.name)}
            </button>
            <EditableText
              value={t.name}
              onChange={(name) => onRename(t.id, name || "Traveler")}
              ariaLabel="Traveler name"
              className="traveler-name"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
