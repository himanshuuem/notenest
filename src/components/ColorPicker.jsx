import { COLORS } from "../state/notes.js";

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="colors" role="radiogroup" aria-label="Note colour">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          title={color}
          className={`swatch note-color-${color}`}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
