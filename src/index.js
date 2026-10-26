import React, { useState, useRef, useSyncExternalStore } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import Vertex from "./vertex.js";
import VertexLinker from "./vertexLinker.js";
import Edge from "./edge";
import GraphManagingButton from "./graphManagingButton.js";
import graph from "./graph.ts";

import "./text-container.css";
import "./index.css";

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
    graph.createVertex(x, y);
  };

  const handleRightClick = (event) => {
    graph.breakLinkingVertices();
    event.preventDefault();
    event.stopPropagation();
  };

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
            graph.loadFromPreset("Star");
          }}
          buttonText="star graph"
        />
        <GraphManagingButton
          onClickAction={() => {
            graph.loadFromPreset("AdjacentSquares");
          }}
          buttonText="adjacent squares graph"
        />
        <GraphManagingButton
          onClickAction={() => {
            graph.loadFromPreset("Tree");
          }}
          buttonText="tree graph"
        />
      </div>
    </div>
  );
}
