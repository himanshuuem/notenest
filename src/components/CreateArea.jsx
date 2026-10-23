import { useEffect, useRef, useState } from "react";
import ColorPicker from "./ColorPicker.jsx";

/** The classic Keeper "expanding" input — collapsed to one line until you click it. */
export default function CreateArea({ onCreate }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState("default");
  const formRef = useRef(null);

  const submit = () => {
    if (title.trim() || body.trim()) onCreate({ title, body, color });
    setTitle("");
    setBody("");
    setColor("default");
    setExpanded(false);
  };

  // Clicking outside the form saves and collapses it, like Google Keep.
  useEffect(() => {
    if (!expanded) return undefined;
    const onPointerDown = (event) => {
      if (!formRef.current?.contains(event.target)) submit();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  });

  return (
    <form
      ref={formRef}
      className={`create note-color-${color}`}
      onSubmit={(event) => { event.preventDefault(); submit(); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") submit();
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
      }}
    >
      {expanded && (
        <input aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      )}
      <textarea
        aria-label="Take a note"
        placeholder="Take a note… (#labels work too)"
        rows={expanded ? 4 : 1}
        value={body}
        onFocus={() => setExpanded(true)}
        onChange={(e) => setBody(e.target.value)}
        maxLength={5000}
      />
      {expanded && (
        <div className="create-bar">
          <ColorPicker value={color} onChange={setColor} />
          <button type="submit" className="add-btn" aria-label="Add note">Add</button>
        </div>
      )}
    </form>
  );
}
