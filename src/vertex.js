import "./vertex.css";

export default function Vertex({
  x,
  y,
  id,
  containerRef,
  label,
  onVertexClick,
  onRightClick,
}) {
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
    <circle
      className="vertex"
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
      key={id}
      cx={x}
      cy={y}
    />
  );
}
