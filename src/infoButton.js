import "./text-container.css";
import { useState } from "react";

export default function InfoButton({ onClickAction }) {
  const shortText = "i";
  const expandedText =
    "Left-click anywhere to create a vertex \n Left-click a node to start drawing an edge \n Right-click to delete a vertex or edge";
  const [expanded, setExpanded] = useState(false);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      id="info-button"
      className="text-container info-button"
      onClick={handleClick}
      onMouseEnter={() => {
        setExpanded(true);
      }}
      onMouseLeave={() => {
        setExpanded(false);
      }}
    >
      {expanded ? expandedText : shortText}
    </div>
  );
}
