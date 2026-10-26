import { useState, useEffect } from "react";
import "./edge.css";

export default function VertexLinker({ anchorX, anchorY, containerRef }) {
  const [cursor, setCursor] = useState({ x: anchorX, y: anchorY });
  useEffect(() => {
    const handleMouseMove = (event) => {
      const container = document.getElementById("graph-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        setCursor({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <line
      className="edge"
      x1={anchorX}
      y1={anchorY}
      x2={cursor.x}
      y2={cursor.y}
    />
  );
}
