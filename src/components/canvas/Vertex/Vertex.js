import "./Vertex.css";
import { useRef } from "react";

const DRAG_THRESHOLD = 8;

export default function Vertex({
  x,
  y,
  id,
  onVertexClick,
  onRightClick,
  setOwnPosition,
}) {
  const dragRef = useRef({
    active: false,
    hasDragged: false,
    startClientX: 0,
    startClientY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      active: true,
      hasDragged: false,
      startClientX: event.clientX,
      startClientY: event.clientY,
      initialX: x,
      initialY: y,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const dx = event.clientX - drag.startClientX;
    const dy = event.clientY - drag.startClientY;

    if (!drag.hasDragged) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.hasDragged = true;
    }

    setOwnPosition(drag.initialX + dx, drag.initialY + dy, false);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.active = false;

    if (drag.hasDragged) {
      setOwnPosition(event.clientX, event.clientY, true);
    } else {
      onVertexClick(id);
    }
  };

  const handlePointerCancel = () => {
    dragRef.current.active = false;
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRightClick(id);
  };

  const handleLeftClick = (event) => {
    event.stopPropagation();
  };

  return (
    <g
      className="vertex-group"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
    >
      <circle className="vertex-hitbox" cx={x} cy={y} r={25} />
      <circle className="vertex" cx={x} cy={y} r={15} />
    </g>
  );
}
