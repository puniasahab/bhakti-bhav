import React from 'react';

export const renderHindiText = (rawName) => {
  // Step 1 - Clean the raw text
  const text = (typeof rawName === "string" ? rawName : (rawName?.hi || ""))
    .normalize("NFC")
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "") // remove zero-width chars
    .replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d).toString()) // Hindi digits → English
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  // Step 2 - Split into Hindi and non-Hindi parts
  // Captures: numbers, brackets, colon, comma, dot
  const parts = text.split(/([0-9()\[\]:.,]+)/g).filter(Boolean);

  return parts.map((part, index) => {
    const isSpecial = /^[0-9()\[\]:.,]+$/.test(part);

    if (isSpecial) {
      return (
        <span
          key={index}
          style={{ fontFamily: 'Arial, sans-serif' }} // normal English font
        >
          {part}
        </span>
      );
    }

    return (
      <span
        key={index}
        className="font-hindi" // your existing KrutiDev class
      >
        {part}
      </span>
    );
  });
};