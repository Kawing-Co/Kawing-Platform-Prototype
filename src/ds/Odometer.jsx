import React from "react";
// A digit-roll number. The real number is ordinary text (selectable, searchable, read aloud as
// written); each digit is painted by a CSS strip that slides to its value, so nothing extra is in the DOM.
export default function Odometer({ value, prefix = "₱", className = "" }) {
  const txt = Math.round(value).toLocaleString("en-US");
  const chars = [...txt];
  return (
    <span className={"k-odo " + className} key={chars.map((c) => (/\d/.test(c) ? "d" : c)).join("") /* rebuild when the digit count changes so it rolls in */}>
      <span className="k-odo-s">{prefix}</span>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <span className="k-odo-d" style={{ "--d": Number(c) }} key={i}>{c}</span>
        ) : (
          <span className="k-odo-s" key={i}>{c}</span>
        ),
      )}
    </span>
  );
}
