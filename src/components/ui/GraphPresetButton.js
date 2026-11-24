import "./text-container.css";

export default function GraphPresetButton({ onClickAction, img }) {
  const handleClick = (event) => {
    onClickAction();
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      id="graph-managing-button"
      onClick={handleClick}
      className="text-container graph-preset-button"
    >
      <img src={img}></img>
    </div>
  );
}
