import { useState } from "react";
import { getArchetype, inferArchetypeFromName } from "../lib/archetypes";
import SidePanel from "./SidePanel";

export default function NewDomainForm({ onCreate, onClose }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const preview = getArchetype(inferArchetypeFromName(name));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Give your domain a name first.");
      return;
    }
    setBusy(true);
    try {
      await onCreate({ name });
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't create that domain — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SidePanel onClose={onClose} ariaLabel="Plant a new domain">
      <div className="panel-header">
        <div className="panel-heading">
          <span className="panel-heading-icon">🌱</span>
          <div>
            <h3>New Domain</h3>
            <p className="panel-subtitle">Name it after the activity</p>
          </div>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <form className="new-domain-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Reading, Gym, Coding"
            autoFocus
          />
        </label>

        <div className="archetype-preview" aria-live="polite">
          <span className="archetype-preview-sprite">{preview.stages[0]}</span>
          <div>
            <p className="archetype-preview-label">
              Grows into: <strong>{preview.icon} {preview.label}</strong>
            </p>
            <p className="archetype-preview-hint">
              Based on the name — try "Reading", "Study for exams", "Coding", "Gym", or "Cooking" to see it change.
            </p>
          </div>
        </div>

        {error && <p className="inline-error">{error}</p>}
        <div className="new-domain-actions">
          <button type="submit" disabled={busy}>
            {busy ? "Planting..." : "Plant it"}
          </button>
          <button type="button" className="link-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </SidePanel>
  );
}
