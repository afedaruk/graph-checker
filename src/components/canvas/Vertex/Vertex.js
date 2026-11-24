import "./Vertex.css";
import { useState } from "react";

export default function Vertex({ x, y, id, onVertexClick, onRightClick }) {
  const [hovered, setHovered] = useState(false);

  const handleLeftClick = (event) => {
    event.stopPropagation();
    onVertexClick(id);
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRightClick(id);
  };

  return (
    <g
      className="vertex-group"
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
    >
      {/* Invisible larger hitbox */}
      <circle className="vertex-hitbox" cx={x} cy={y} r={25} />
      {/* Visible vertex */}
      <circle className="vertex" cx={x} cy={y} r={15} />
    </g>
  );
}
