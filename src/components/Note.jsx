import { extractLabels } from "../state/notes.js";

export default function Note({ note, onOpen, onTogglePin, onToggleArchive, onDelete, onLabel }) {
  const labels = extractLabels(note.title, note.body);
  const bodyWithoutTags = note.body.replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, "$1").trim();

  return (
    <article className={`note note-color-${note.color}`}>
      <button type="button" className="note-open" onClick={() => onOpen(note)} aria-label={`Edit note ${note.title || bodyWithoutTags.slice(0, 30)}`}>
        {note.title && <h3>{note.title}</h3>}
        {bodyWithoutTags && <p>{bodyWithoutTags}</p>}
      </button>
      {labels.length > 0 && (
        <div className="labels">
          {labels.map((label) => <button type="button" key={label} className="label" onClick={() => onLabel(label)}>#{label}</button>)}
        </div>
      )}
      <div className="note-actions">
        <button type="button" onClick={() => onTogglePin(note.id)} aria-pressed={note.pinned} aria-label={note.pinned ? "Unpin note" : "Pin note"} title={note.pinned ? "Unpin" : "Pin"}>📌</button>
        <button type="button" onClick={() => onToggleArchive(note.id)} aria-label={note.archived ? "Unarchive note" : "Archive note"} title={note.archived ? "Unarchive" : "Archive"}>{note.archived ? "📤" : "🗄️"}</button>
        <button type="button" onClick={() => onDelete(note.id)} aria-label="Delete note" title="Delete">🗑️</button>
      </div>
    </article>
  );
}
