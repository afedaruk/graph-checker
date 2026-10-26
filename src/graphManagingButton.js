import "./text-container.css";

export default function GraphManagingButton({ onClickAction, buttonText }) {
  const handleClick = (event) => {
    onClickAction();
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      id="graph-managing-button"
      onClick={handleClick}
      className="text-container button"
    >
      {buttonText}
    </div>
  );
}
