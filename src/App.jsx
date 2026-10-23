import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { extractLabels, notesReducer, seedNotes, selectNotes } from "./state/notes.js";
import CreateArea from "./components/CreateArea.jsx";
import Note from "./components/Note.jsx";
import EditDialog from "./components/EditDialog.jsx";

const STORAGE_KEY = "notenest-notes";

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : seedNotes;
  } catch {
    return seedNotes;
  }
}

export default function App() {
  const [notes, dispatch] = useReducer(notesReducer, undefined, load);
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState(null);
  const [view, setView] = useState("notes");
  const [editing, setEditing] = useState(null);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Storage blocked: notes live in memory for this visit.
    }
  }, [notes]);

  const { pinned, others } = useMemo(() => selectNotes(notes, { query, label, view }), [notes, query, label, view]);
  const allLabels = useMemo(() => [...new Set(notes.flatMap((n) => extractLabels(n.title, n.body)))].sort(), [notes]);

  const remove = (id) => {
    const index = notes.findIndex((n) => n.id === id);
    const note = notes[index];
    dispatch({ type: "delete", id });
    clearTimeout(undoTimer.current);
    setUndo({ note, index });
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };

  const restore = () => {
    dispatch({ type: "restore", ...undo });
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const noteProps = {
    onOpen: setEditing,
    onTogglePin: (id) => dispatch({ type: "togglePin", id }),
    onToggleArchive: (id) => dispatch({ type: "toggleArchive", id }),
    onDelete: remove,
    onLabel: (l) => { setLabel(l); setView("notes"); },
  };

  const isEmpty = pinned.length + others.length === 0;

  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo"><span aria-hidden="true">🪺</span> NoteNest</h1>
        <div className="search">
          <label htmlFor="search" className="visually-hidden">Search notes</label>
          <input id="search" type="search" placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <aside className="sidebar" aria-label="Views">
        <button type="button" aria-pressed={view === "notes" && !label} onClick={() => { setView("notes"); setLabel(null); }}>💡 Notes</button>
        {allLabels.map((l) => (
          <button type="button" key={l} aria-pressed={label === l} onClick={() => { setLabel(l); setView("notes"); }}>🏷️ {l}</button>
        ))}
        <button type="button" aria-pressed={view === "archive"} onClick={() => { setView("archive"); setLabel(null); }}>🗄️ Archive</button>
      </aside>

      <main className="content">
        {view === "notes" && <CreateArea onCreate={(note) => dispatch({ type: "create", ...note })} />}
        {label && <p className="filter-chip">Showing <strong>#{label}</strong> <button type="button" onClick={() => setLabel(null)} aria-label="Clear label filter">✕</button></p>}

        {isEmpty && (
          <p className="empty">{query ? `No notes match “${query}”.` : view === "archive" ? "Nothing archived." : "Your nest is empty. Jot something down ✍️"}</p>
        )}
        {pinned.length > 0 && (
          <section aria-label="Pinned notes">
            <h2 className="section-label">Pinned</h2>
            <div className="masonry">{pinned.map((n) => <Note key={n.id} note={n} {...noteProps} />)}</div>
          </section>
        )}
        {others.length > 0 && (
          <section aria-label={view === "archive" ? "Archived notes" : "Other notes"}>
            {pinned.length > 0 && <h2 className="section-label">Others</h2>}
            <div className="masonry">{others.map((n) => <Note key={n.id} note={n} {...noteProps} />)}</div>
          </section>
        )}
      </main>

      <EditDialog note={editing} onSave={(id, changes) => dispatch({ type: "update", id, changes })} onClose={() => setEditing(null)} />

      <div className={undo ? "snackbar show" : "snackbar"} role="status" aria-live="polite">
        {undo && <>Note deleted <button type="button" onClick={restore}>Undo</button></>}
      </div>
      <footer className="footer">NoteNest · React 19 · by <a href="https://github.com/himanshuuem">Himanshu</a></footer>
    </div>
  );
}
