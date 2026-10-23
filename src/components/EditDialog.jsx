import { useEffect, useRef, useState } from "react";
import ColorPicker from "./ColorPicker.jsx";

export default function EditDialog({ note, onSave, onClose }) {
  const ref = useRef(null);
  const [draft, setDraft] = useState(note);

  useEffect(() => {
    setDraft(note);
    const dialog = ref.current;
    if (note && dialog && !dialog.open) dialog.showModal?.();
    if (!note && dialog?.open) dialog.close?.();
  }, [note]);

  const close = () => {
    if (draft && (draft.title !== note.title || draft.body !== note.body || draft.color !== note.color)) {
      onSave(note.id, { title: draft.title.trim(), body: draft.body.trim(), color: draft.color });
    }
    onClose();
  };

  return (
    <dialog ref={ref} className={`edit-dialog note-color-${draft?.color ?? "default"}`} onCancel={(e) => { e.preventDefault(); close(); }} onClick={(e) => e.target === ref.current && close()} aria-label="Edit note">
      {draft && (
        <div className="edit-body">
          <input aria-label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" maxLength={120} />
          <textarea aria-label="Note" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={10} maxLength={5000} />
          <div className="create-bar">
            <ColorPicker value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
            <button type="button" className="add-btn" onClick={close}>Done</button>
          </div>
        </div>
      )}
    </dialog>
  );
}
