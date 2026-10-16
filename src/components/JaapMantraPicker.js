import { useEffect, useId, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import "./JaapMantraPicker.css";

export default function JaapMantraPicker({ options, selectedKey, language, onConfirm, onClose, allowCustom = false, customMantra = "" }) {
  const dialogRef = useRef(null);
  const headingId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const [draftKey, setDraftKey] = useState(selectedKey ?? options[0]?.key);
  const [editingCustom, setEditingCustom] = useState(Boolean(customMantra));
  const [draftText, setDraftText] = useState(customMantra);
  const isEnglish = language === "en";

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="jaap-mantra-picker font-devanagari" aria-labelledby={headingId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <form onSubmit={(event) => {
        event.preventDefault();
        onConfirm(draftKey, editingCustom ? draftText.trim() : "");
      }}>
        <div className="jaap-mantra-picker-heading">
          <Sparkles size={28} aria-hidden="true" />
          <h2 id={headingId}>{isEnglish ? "Select a mantra" : "मंत्र का चयन करें"}</h2>
          <button type="button" className="jaap-mantra-picker-close" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <p id={descriptionId} className="jaap-mantra-picker-description">{isEnglish ? "Choose the mantra you would like to chant:" : "जिस मंत्र का आप जाप करना चाहते हैं, उसे चुनें:"}</p>
        <div className="jaap-mantra-picker-options" role="radiogroup" aria-labelledby={headingId}>
          {options.map((option) => (
            <label key={option.key} className={`jaap-mantra-picker-option ${!editingCustom && draftKey === option.key ? "is-selected" : ""}`}>
              <input type="radio" name={headingId} value={option.key} checked={!editingCustom && draftKey === option.key}
                onChange={() => { setDraftKey(option.key); setEditingCustom(false); }} />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
        {allowCustom && (
          <div className="jaap-mantra-picker-custom">
            <button type="button" onClick={() => setEditingCustom((value) => !value)} aria-expanded={editingCustom}>
              {isEnglish ? "Enter a custom mantra" : "अपना मंत्र लिखें"}
            </button>
            {editingCustom && <>
              <label htmlFor={inputId}>God name or mantra</label>
              <input id={inputId} value={draftText} onChange={(event) => setDraftText(event.target.value)} maxLength={120} required />
            </>}
          </div>
        )}
        <div className="jaap-mantra-picker-actions">
          <button type="submit" disabled={editingCustom ? !draftText.trim() : !options.some((option) => option.key === draftKey)}>Confirm</button>
        </div>
      </form>
    </dialog>
  );
}
