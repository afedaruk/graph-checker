import React, {
  useState,
  useRef,
  useSyncExternalStore,
  useEffect,
} from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import Vertex from "./components/canvas/Vertex/Vertex.js";
import VertexLinker from "./components/canvas/VertexLinker.js";
import Edge from "./components/canvas/Edge/Edge.js";
import GraphManagingButton from "./components/ui/GraphManagingButton.js";
import graph from "./graph/Graph.ts";
import InfoButton from "./components/ui/InfoButton.js";

import "./components/ui/text-container.css";
import "./index.css";
import GraphPresetButton from "./components/ui/GraphPresetButton.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default function GraphContainer() {
  const { vertices, edges, isEulerian, isLinkingActive, firstLinkingVertexId } =
    useSyncExternalStore(graph.subscribe, graph.getSnapshot);
  const containerRef = useRef(null);

  const handleMouseClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    graph.addVertex(x, y);
  };

  const handleRightClick = (event) => {
    graph.breakLinkingVertices();
    event.preventDefault();
    event.stopPropagation();
  };

  const [windowCenterX, setWindowCenterX] = useState(0);
  const [windowCenterY, setWindowCenterY] = useState(0);

  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;
      setWindowCenterX(width / 2);
      setWindowCenterY(height / 2);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isKeyCombination =
        (event.ctrlKey || event.metaKey) && !event.shiftKey;
      const letterIsZ = event.key.toLowerCase() === "z";
      const letterIsY = event.key.toLowerCase() === "y";
      if (isKeyCombination && letterIsZ) {
        event.preventDefault();
        graph.undoLastAction();
      }
      if (isKeyCombination && letterIsY) {
        event.preventDefault();
        graph.redoLastAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [graph]);

  return (
    <div
      id="global-container"
      style={{
        overflowX: "hidden",
      }}
    >
      <div
        id="graph-container"
        onClick={handleMouseClick}
        onContextMenu={handleRightClick}
        ref={containerRef}
        className="graph-container"
      >
        <svg className="svg-layer">
          {isLinkingActive && (
            <VertexLinker
              anchorX={vertices[firstLinkingVertexId].x}
              anchorY={vertices[firstLinkingVertexId].y}
              id={Date.now().toString()}
              containerRef={containerRef}
            />
          )}

          {Object.values(edges).map((edge) => (
            <Edge
              x1={vertices[edge.vertex1Id].x}
              y1={vertices[edge.vertex1Id].y}
              x2={vertices[edge.vertex2Id].x}
              y2={vertices[edge.vertex2Id].y}
              id={edge.id}
              key={edge.id}
              label={edge.label}
              containerRef={containerRef}
              onEdgeClick={graph.deleteEdge}
            />
          ))}
          {Object.values(vertices).map((vertex) => (
            <Vertex
              x={vertex.x}
              y={vertex.y}
              id={vertex.id}
              key={vertex.id}
              containerRef={containerRef}
              onVertexClick={graph.startLinkingVertices}
              onRightClick={graph.deleteVertex}
              setOwnPosition={(x, y, updateHistory) => {
                graph.setVertexPosition(vertex.id, x, y, updateHistory);
              }}
            />
          ))}
        </svg>
      </div>
      {isEulerian && (
        <div
          onClick={graph.clearEdgeLabels}
          onContextMenu={handleRightClick}
          className="text-container pop-up"
        >
          {isEulerian}
        </div>
      )}
      <InfoButton onClickAction={graph.clearEdgeLabels} />
      <div className="preset-button-container">
        <GraphPresetButton
          onClickAction={() => {
            graph.loadFromPreset("Star", windowCenterX, windowCenterY);
          }}
          img={`${process.env.PUBLIC_URL}/preset_buttons/star.png`}
        />
        <GraphPresetButton
          onClickAction={() => {
            graph.loadFromPreset(
              "AdjacentSquares",
              windowCenterX,
              windowCenterY,
            );
          }}
          img={`${process.env.PUBLIC_URL}/preset_buttons/squares.png`}
        />
        <GraphPresetButton
          onClickAction={() => {
            graph.loadFromPreset("Tree", windowCenterX, windowCenterY);
          }}
          img={`${process.env.PUBLIC_URL}/preset_buttons/tree.png`}
        />
      </div>

      <div className="button-container">
        <GraphManagingButton
          onClickAction={() => {
            console.log(graph.findEulerCircuit());
          }}
          buttonText="eulerian?"
        />
        <GraphManagingButton
          onClickAction={graph.clearGraph}
          buttonText="clear"
        />
        <GraphManagingButton
          onClickAction={() => {
            graph.undoLastAction();
          }}
          buttonText="↶"
        />
        <GraphManagingButton
          onClickAction={() => {
            graph.redoLastAction();
          }}
          buttonText="↷"
        />
      </div>
    </div>
  );
}
