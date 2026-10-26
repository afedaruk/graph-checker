import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import Vertex from "./vertex.js";
import VertexLinker from "./vertexLinker.js";
import Edge from "./edge";
import GraphManagingButton from "./graphManagingButton.js";
import { GRAPH_PRESETS } from "./graphPresets.js";

import "./text-container.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default function GraphContainer() {
  const containerRef = useRef(null);
  const [vertices, setVertices] = useState(
    {},
    // {"1698000000": { id: "1698000000", x: 100, y: 150, edges: 0, label: 0 }}
  );
  const [edges, setEdges] = useState(
    {},
    // use createEdge wrapper
    // {"1698000000": { id: "1698000000", vertex1Id: 0, vertex2Id: 1, label: "" }}
  );
  const [isEulerian, setIsEulerian] = useState("");
  const [areEdgesLabeled, setAreEdgesLabeled] = useState(false);
  const [isLinkingActive, setIsLinkingActive] = useState(false);
  const [firstLinkingVertexId, setfirstLinkingVertexId] = useState(0);
  const NON_EULERIAN = "non-eulerian";
  const SEMI_EULERIAN = "semi-eulerian";
  const EULERIAN = "eulerian";

  const handleMouseClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now().toString();

    setVertices((prevVertices) => ({
      ...prevVertices,
      [id]: {
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        edges: 0,
      },
    }));

    clearEdgeLabels();
  };

  const clearGraph = () => {
    clearEdgeLabels();
    setVertices({});
    setEdges({});
  };

  const loadFromPreset = (presetName) => {
    setVertices(GRAPH_PRESETS[presetName].vertices);
    setEdges(GRAPH_PRESETS[presetName].edges);
    clearEdgeLabels();
  };

  const handleRightClick = (event) => {
    if (isLinkingActive) {
      setIsLinkingActive(false);
    }
    clearEdgeLabels();
    event.preventDefault();
    event.stopPropagation();
  };

  const handleVertexClicked = (vertexId) => {
    if (isLinkingActive) {
      if (vertexId != firstLinkingVertexId) {
        // link firstLinkingvertexId to vertexId
        createEdge(firstLinkingVertexId, vertexId);
      }
    } else {
      setfirstLinkingVertexId(vertexId);
    }
    setIsLinkingActive(!isLinkingActive);
    clearEdgeLabels();
  };

  const clearEdgeLabels = () => {
    if (areEdgesLabeled) {
      setEdges((prevEdges) => {
        const updatedEdges = {};

        // Loop through every edge ID in the current state
        Object.keys(prevEdges).forEach((id) => {
          updatedEdges[id] = {
            ...prevEdges[id],
            label: "",
          };
        });
        return updatedEdges;
      });
      setIsEulerian("");
      setAreEdgesLabeled(false);
    }
  };

  const createEdge = (vertex1Id, vertex2Id) => {
    const id = Date.now().toString();
    vertices[vertex1Id].edges++;
    vertices[vertex2Id].edges++;
    setEdges((prevEdges) => {
      const newEdges = prevEdges;
      newEdges[id] = { id, vertex1Id, vertex2Id, label: "" };
      return newEdges;
    });
  };

  const handleEdgeDeletion = (edgeId) => {
    const vertex1Id = edges[edgeId].vertex1Id;
    const vertex2Id = edges[edgeId].vertex2Id;
    vertices[vertex1Id].edges--;
    vertices[vertex2Id].edges--;
    setEdges((prevEdges) => {
      const { [edgeId]: deletedEdge, ...updatedEdges } = prevEdges;
      return updatedEdges;
    });
    clearEdgeLabels();
  };

  const handleVertexDeletion = (vertexId) => {
    if (isLinkingActive && firstLinkingVertexId == vertexId) {
      setIsLinkingActive(false);
    }
    Object.entries(edges).forEach(([edgeId, edgeData]) => {
      if (edgeData.vertex1Id === vertexId || edgeData.vertex2Id === vertexId) {
        handleEdgeDeletion(edgeId);
      }
    });
    setVertices((prevVertices) => {
      const { [vertexId]: deletedVertex, ...updatedVertices } = prevVertices;
      return updatedVertices;
    });
    clearEdgeLabels();
  };

  function findEulerCircuit() {
    const graph = {};
    const edgeIdByVertices = {};

    Object.keys(vertices).forEach((vertexId) => {
      graph[vertexId] = [];
    });

    Object.values(edges).forEach((edge) => {
      graph[edge.vertex1Id].push(edge.vertex2Id);
      graph[edge.vertex2Id].push(edge.vertex1Id);
      const edgeString1 = `${edge.vertex1Id}/${edge.vertex2Id}`;
      const edgeString2 = `${edge.vertex2Id}/${edge.vertex1Id}`;
      edgeIdByVertices[edgeString1] = edge.id;
      edgeIdByVertices[edgeString2] = edge.id;
    });

    let oddVertices = [];
    let startVertex = null;
    for (let [u, neighbors] of Object.entries(graph)) {
      if (neighbors.length % 2 !== 0) {
        oddVertices.push(u);
      }
      if (neighbors.length > 0 && startVertex === null) {
        startVertex = u;
      }
    }
    switch (oddVertices.length) {
      case 0:
        setIsEulerian(EULERIAN);
        setAreEdgesLabeled(true);
        break;
      case 2:
        setIsEulerian(SEMI_EULERIAN);
        setAreEdgesLabeled(true);
        startVertex = oddVertices[0];
        break;
      default:
        setIsEulerian(NON_EULERIAN);
        setAreEdgesLabeled(true);
        return;
    }

    if (startVertex === null) return [];

    let adj = new Map();
    for (let [u, neighbors] of Object.entries(graph)) {
      adj.set(u, [...neighbors]);
    }

    let currentPath = [startVertex];
    let circuit = [];

    while (currentPath.length > 0) {
      let u = currentPath[currentPath.length - 1];
      let neighbors = adj.get(u);

      if (neighbors && neighbors.length > 0) {
        let v = neighbors.pop();

        let reverseNeighbors = adj.get(v);
        if (reverseNeighbors) {
          let reverseIndex = reverseNeighbors.indexOf(u);
          if (reverseIndex !== -1) {
            reverseNeighbors.splice(reverseIndex, 1);
          }
        }
        currentPath.push(v);
      } else {
        circuit.push(currentPath.pop());
      }
    }

    let prevVertexId = circuit[0];
    const updatedEdges = new Map();
    for (let orderNumber = 1; orderNumber < circuit.length; orderNumber++) {
      const vertexId = circuit[orderNumber];
      const edgeString = `${prevVertexId}/${vertexId}`;
      const edgeId = parseInt(edgeIdByVertices[edgeString]);
      console.log(edgeIdByVertices);
      updatedEdges[edgeId] = {
        id: edgeId,
        vertex1Id: prevVertexId, // making the edge directed as it is in the circuit
        vertex2Id: vertexId,
        label: orderNumber,
      };
      prevVertexId = vertexId;
    }
    setEdges(updatedEdges);
    setAreEdgesLabeled(true);
    return circuit.reverse();
  }

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
        style={{
          position: "absolute",
          height: "100vh",
          width: "100%",
          backgroundColor: "#F0EEE5",
          overflow: "hidden",
          alignSelf: "top",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <svg
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Allows click events to pass through to target vertices
            zIndex: 5,
          }}
        >
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
              onEdgeClick={handleEdgeDeletion}
            />
          ))}
          {Object.values(vertices).map((vertex) => (
            <Vertex
              x={vertex.x}
              y={vertex.y}
              id={vertex.id}
              key={vertex.id}
              label=""
              containerRef={containerRef}
              onVertexClick={handleVertexClicked}
              onRightClick={handleVertexDeletion}
            />
          ))}
        </svg>
      </div>
      {isEulerian && (
        <div
          onClick={clearEdgeLabels}
          onContextMenu={handleRightClick}
          className="text-container pop-up"
        >
          {isEulerian}
        </div>
      )}
      <div
        style={{
          height: "10vh",
          width: "fit-content",
          transform: "translate(-50%, -50%)",
          top: "90%",
          left: "50%",
          //backgroundColor: "#DDD8C4",
          color: "#DDD8C4",
          padding: "1vh",
          display: "grid",
          gridAutoFlow: "column",
          borderRadius: 5,
          columnGap: "1vh",
          justifyContent: "center",
          position: "absolute",
          zIndex: 9999,
        }}
      >
        <GraphManagingButton
          onClickAction={() => {
            console.log(findEulerCircuit());
          }}
          buttonText="eulerian?"
        />
        <GraphManagingButton onClickAction={clearGraph} buttonText="clear" />
        <GraphManagingButton
          onClickAction={() => {
            loadFromPreset("Star");
          }}
          buttonText="star graph"
        />
        <GraphManagingButton
          onClickAction={() => {
            loadFromPreset("AdjacentSquares");
          }}
          buttonText="adjacent squares graph"
        />
        <GraphManagingButton
          onClickAction={() => {
            loadFromPreset("Tree");
          }}
          buttonText="tree graph"
        />
      </div>
    </div>
  );
}
