export const COLORS = ["default", "sun", "peach", "mint", "sky", "lilac", "rose"];

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

/** "#work #ideas buy stuff" → ["work", "ideas"] — labels are just hashtags in the text. */
export function extractLabels(...texts) {
  const found = new Set();
  for (const text of texts) {
    for (const [, tag] of String(text).matchAll(/(?:^|\s)#([\p{L}\p{N}_-]{1,30})/gu)) found.add(tag.toLowerCase());
  }
  return [...found];
}

export const seedNotes = [
  { id: "welcome", title: "Welcome to NoteNest 🪺", body: "Click a note to edit it. Pin 📌 the important ones, pick a colour, and add hashtags anywhere in a note to label it.\n\n#tips", color: "sun", pinned: true, archived: false, updatedAt: 3 },
  { id: "groceries", title: "Groceries", body: "Mangoes, chai patti, oats, paneer, coriander\n#home", color: "mint", pinned: false, archived: false, updatedAt: 2 },
  { id: "ideas", title: "Side-project ideas", body: "- CLI that summarises git logs\n- Habit tracker with streak heatmap\n- Recipe scaler\n#ideas", color: "sky", pinned: false, archived: false, updatedAt: 1 },
];

export function notesReducer(notes, action) {
  switch (action.type) {
    case "create": {
      const title = action.title.trim();
      const body = action.body.trim();
      if (!title && !body) return notes;
      return [{ id: action.id ?? newId(), title, body, color: action.color ?? "default", pinned: false, archived: false, updatedAt: action.now ?? Date.now() }, ...notes];
    }
    case "update":
      return notes.map((n) => (n.id === action.id ? { ...n, ...action.changes, updatedAt: action.now ?? Date.now() } : n));
    case "togglePin":
      return notes.map((n) => (n.id === action.id ? { ...n, pinned: !n.pinned, archived: false } : n));
    case "toggleArchive":
      return notes.map((n) => (n.id === action.id ? { ...n, archived: !n.archived, pinned: false } : n));
    case "delete":
      return notes.filter((n) => n.id !== action.id);
    case "restore":
      // Undo delete: put the note back exactly where it was.
      return notes.some((n) => n.id === action.note.id) ? notes : [...notes.slice(0, action.index), action.note, ...notes.slice(action.index)];
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function selectNotes(notes, { query = "", label = null, view = "notes" }) {
  const q = query.trim().toLowerCase();
  const matching = notes
    .filter((n) => (view === "archive" ? n.archived : !n.archived))
    .filter((n) => !label || extractLabels(n.title, n.body).includes(label))
    .filter((n) => !q || `${n.title}\n${n.body}`.toLowerCase().includes(q))
    .toSorted((a, b) => b.updatedAt - a.updatedAt);
  return { pinned: matching.filter((n) => n.pinned), others: matching.filter((n) => !n.pinned) };
}
