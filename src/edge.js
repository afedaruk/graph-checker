import "./edge.css";

export default function Edge({ x1, y1, x2, y2, id, onEdgeClick, label }) {
  const ARROW_LENGTH = 50;
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const edgeLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const arrowCos = deltaX / edgeLength;
  const arrowSin = deltaY / edgeLength;
  const arrowTipDeltaX = Math.round(ARROW_LENGTH * arrowCos);
  const arrowTipDeltaY = Math.round(ARROW_LENGTH * arrowSin);
  const handleRightClick = (event) => {
    onEdgeClick(id);
    event.preventDefault();
    event.stopPropagation();
  };

  const handleLeftClickPassThrough = (event) => {
    event.stopPropagation();
    const elementsUnderCursor = document.elementsFromPoint(
      event.clientX,
      event.clientY,
    );
    const elementUnderneath = elementsUnderCursor.find(
      (element) => !element.classList.contains("graph-edge"),
    );
    if (elementUnderneath) {
      elementUnderneath.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: event.clientX,
          clientY: event.clientY,
          button: 0, // 0 = left click
        }),
      );
    }
  };

  return (
    <g>
      <g className="edge">
        <line
          style={{ pointerEvents: "stroke" }}
          onClick={handleLeftClickPassThrough}
          onContextMenu={handleRightClick}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
        />
        <line
          className="arrow-line"
          x1={x1}
          y1={y1}
          x2={x1 + arrowTipDeltaX}
          y2={y1 + arrowTipDeltaY}
          markerEnd={label == "" ? undefined : "url(#arrowhead)"} // attach an arrow head only if labels are set
        />
      </g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#84B59F" />
        </marker>
      </defs>
      <text
        fill="#50808E"
        x={x1 + arrowTipDeltaX / 2}
        y={y1 + arrowTipDeltaY / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {label}
      </text>
    </g>
  );
}
