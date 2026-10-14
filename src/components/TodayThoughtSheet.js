import React, { useEffect, useRef, useState } from "react";
import { Quote, Share2 } from "lucide-react";
import "./TodayThoughtSheet.css";

const plainText = (value) => typeof value === "string" ? value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]*>/g, "").trim() : "";

export default function TodayThoughtSheet({ thought, language, loading = false, onClose }) {
  const dialog = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const english = language === "en";
  const title = english ? "Today's Thought" : "आज का सुविचार";
  const text = plainText(typeof thought === "string" ? thought : thought?.thought);
  const author = plainText(thought?.author);

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const shareThought = async () => {
    if (!text || sharing) return;
    const shareText = `${title}\n\n${text}${author ? `\n\n— ${author}` : ""}`;
    setSharing(true);
    setShareMessage("");
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareMessage(english ? "Thought copied. You can paste it to share." : "सुविचार कॉपी हो गया। अब इसे पेस्ट करके साझा करें।");
      } else {
        setShareMessage(english ? "Sharing is unavailable. You can select and copy the thought above." : "ऊपर दिए सुविचार को चुनकर कॉपी करें और साझा करें।");
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareMessage(english ? "Unable to share. Please try again." : "साझा नहीं हो पाया। कृपया दोबारा कोशिश करें।");
    } finally {
      setSharing(false);
    }
  };

  return (
    <dialog ref={dialog} className="suvichar-dialog" aria-labelledby="suvichar-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="suvichar-sheet">
        <h2 id="suvichar-title" className={`suvichar-title ${english ? "font-eng" : "font-devanagari"}`}>
          <Quote size={23} fill="currentColor" aria-hidden="true" />
          <span>{title}</span>
          <Quote size={23} fill="currentColor" className="rotate-180" aria-hidden="true" />
        </h2>
        {text ? (
          <blockquote className="font-devanagari">
            <p className="suvichar-text">{text}</p>
            {author && <footer className="suvichar-author">- {author}</footer>}
          </blockquote>
        ) : (
          <p className="suvichar-text font-devanagari" role="status">
            {loading ? (english ? "Loading today's thought..." : "आज का सुविचार लोड हो रहा है...") : (english ? "Today's thought is not available yet." : "आज का सुविचार अभी उपलब्ध नहीं है।")}
          </p>
        )}
        <button type="button" className="suvichar-share font-eng" onClick={shareThought} disabled={!text || sharing}>
          <Share2 size={25} aria-hidden="true" /> {sharing ? "Sharing..." : "Share Now"}
        </button>
        {shareMessage && <p className="mt-4 text-center text-sm leading-relaxed" role="status">{shareMessage}</p>}
        <button type="button" className="suvichar-close font-eng" onClick={onClose}>Close</button>
      </section>
    </dialog>
  );
}
