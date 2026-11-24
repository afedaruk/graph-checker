import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import { GRAPH_PRESETS } from "./GraphPresets.ts";
import { relative } from "node:path";
import { Action } from "./types.ts";
import Vertex from "../components/canvas/Vertex/Vertex.js";

export interface Vertex {
  id: string;
  x: number;
  y: number;
  edges: number;
}

export interface Edge {
  id: string;
  vertex1Id: string;
  vertex2Id: string;
  label: string;
}

export interface AdjacencyVertex {}

type HistoryEntry =
  | { action: Action.ADD_VERTEX; vertex: Vertex }
  | { action: Action.DELETE_VERTEX; vertex: Vertex }
  | { action: Action.ADD_EDGE; edge: Edge }
  | { action: Action.DELETE_EDGE; edge: Edge }
  | {
      action: Action.MOVE_VERTEX;
      vertex: Vertex;
      xBefore: number;
      yBefore: number;
    }
  | {
      action: Action.CLEAR_GRAPH;
      vertices: Record<string, Vertex>;
      edges: Record<string, Edge>;
    };

class Graph {
  private vertices: Record<string, Vertex> = {};
  // {"1698000000": { id: "1698000000", x: 100, y: 150, edges: 0, label: 0 }}
  private edges: Record<string, Edge> = {};
  // {"1698000000": { id: "1698000000", vertex1Id: 0, vertex2Id: 1, label: "" }}
  private listeners: Set<() => void> = new Set();
  private history: Array<HistoryEntry> = [];
  private undoneHistory: Array<HistoryEntry> = [];

  private isEulerian = "";
  private areEdgesLabeled = false;
  private isLinkingActive = false;
  private firstLinkingVertexId = "0";
  private readonly NON_EULERIAN = "non-eulerian";
  private readonly SEMI_EULERIAN = "semi-eulerian";
  private readonly EULERIAN = "eulerian";

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private snapshot = {
    vertices: this.vertices,
    edges: this.edges,
    isEulerian: this.isEulerian,
    isLinkingActive: this.isLinkingActive,
    firstLinkingVertexId: this.firstLinkingVertexId,
  };

  getSnapshot = () => this.snapshot;

  notify = () => {
    this.snapshot = {
      vertices: this.vertices,
      edges: this.edges,
      isEulerian: this.isEulerian,
      isLinkingActive: this.isLinkingActive,
      firstLinkingVertexId: this.firstLinkingVertexId,
    };
    this.listeners.forEach((listener) => listener());
  };

  clearGraph = () => {
    this.clearEdgeLabels();
    this.history.push({
      action: Action.CLEAR_GRAPH,
      vertices: { ...this.vertices },
      edges: { ...this.edges },
    });
    this.undoneHistory = [];
    this.vertices = {};
    this.edges = {};
    this.notify();
    console.log(Action.CLEAR_GRAPH);
  };

  clearEdgeLabels = () => {
    if (this.areEdgesLabeled) {
      const newEdges: Record<string, Edge> = {};

      Object.values(this.edges).forEach((edge) => {
        newEdges[edge.id] = {
          ...edge,
          label: "",
        };
      });
      this.edges = newEdges;

      this.isEulerian = "";
      this.areEdgesLabeled = false;

      this.notify();
    }
  };

  loadFromPreset = (
    presetName: string,
    windowCenterX: number,
    windowCenterY: number,
  ) => {
    const preset = GRAPH_PRESETS[presetName];
    this.clearGraph();
    this.vertices = Object.fromEntries(
      Object.entries(preset.vertices).map(([id, vertex]) => [
        id,
        {
          ...vertex,
          x: vertex.x + windowCenterX,
          y: vertex.y + windowCenterY,
        },
      ]),
    );
    this.edges = preset.edges;
    this.clearEdgeLabels();
    this.notify();
  };

  addVertex = (x: number, y: number) => {
    const id = Date.now().toString();
    const vertex = {
      id,
      x,
      y,
      edges: 0,
    };
    this.vertices = {
      ...this.vertices,
      [vertex.id]: vertex,
    };
    this.clearEdgeLabels();
    this.notify();
    this.history.push({ action: Action.ADD_VERTEX, vertex: vertex });
    this.undoneHistory = [];
    console.log(Action.ADD_VERTEX);
  };

  addEdge = (vertex1Id: string, vertex2Id: string) => {
    const existingEdge = Object.values(this.edges).find(
      (e) => e.vertex1Id === vertex1Id && e.vertex2Id === vertex2Id,
    );
    if (existingEdge != null) return;
    const id = Date.now().toString();
    this.vertices[vertex1Id].edges++;
    this.vertices[vertex2Id].edges++;
    const edge = {
      id,
      vertex1Id,
      vertex2Id,
      label: "",
    };
    this.edges = {
      ...this.edges,
      [id]: edge,
    };
    this.clearEdgeLabels();
    this.notify();
    this.history.push({ action: Action.ADD_EDGE, edge });
    this.undoneHistory = [];
    console.log(Action.ADD_EDGE);
  };

  startLinkingVertices = (vertexId: string) => {
    if (this.isLinkingActive) {
      if (vertexId != this.firstLinkingVertexId) {
        this.addEdge(this.firstLinkingVertexId, vertexId);
      }
    } else {
      this.firstLinkingVertexId = vertexId;
    }
    this.isLinkingActive = !this.isLinkingActive;
    this.clearEdgeLabels();
    this.notify();
  };

  breakLinkingVertices = () => {
    if (this.isLinkingActive) {
      this.isLinkingActive = false;
    }
    this.clearEdgeLabels();
    this.notify();
  };

  deleteEdge = (edgeId: string) => {
    const vertex1Id = this.edges[edgeId].vertex1Id;
    const vertex2Id = this.edges[edgeId].vertex2Id;
    this.vertices[vertex1Id].edges--;
    this.vertices[vertex2Id].edges--;
    const { [edgeId]: deletedEdge, ...updatedEdges } = this.edges;
    this.edges = updatedEdges;
    this.clearEdgeLabels();
    this.notify();
    this.history.push({ action: Action.DELETE_EDGE, edge: deletedEdge });
    this.undoneHistory = [];
    console.log(Action.DELETE_EDGE);
  };

  deleteVertex = (vertexId: string) => {
    if (this.isLinkingActive && this.firstLinkingVertexId == vertexId) {
      this.isLinkingActive = false;
    }
    Object.entries(this.edges).forEach(([edgeId, edge]) => {
      if (edge.vertex1Id === vertexId || edge.vertex2Id === vertexId) {
        this.deleteEdge(edgeId);
      }
    });
    const { [vertexId]: deletedVertex, ...updatedVertices } = this.vertices;
    this.vertices = updatedVertices;
    this.clearEdgeLabels();
    this.notify();
    this.history.push({ action: Action.DELETE_VERTEX, vertex: deletedVertex });
    this.undoneHistory = [];
    console.log(Action.DELETE_VERTEX);
  };

  findEulerCircuit = () => {
    let adj = new Map<string, string[]>();
    const edgeIdByVertices = new Map<string, string>();
    Object.values(this.vertices).forEach((vertex) => {
      adj.set(vertex.id, []);
    });
    Object.values(this.edges).forEach((edge) => {
      adj.get(edge.vertex1Id)!.push(edge.vertex2Id);
      adj.get(edge.vertex2Id)!.push(edge.vertex1Id);
      const edgeString1 = `${edge.vertex1Id}/${edge.vertex2Id}`;
      const edgeString2 = `${edge.vertex2Id}/${edge.vertex1Id}`;
      edgeIdByVertices.set(edgeString1, edge.id);
      edgeIdByVertices.set(edgeString2, edge.id);
    });

    let oddVertices = [];
    let startVertex = null;
    for (let [u, neighbors] of adj) {
      if (neighbors.length % 2 !== 0) {
        oddVertices.push(u);
      }
      if (neighbors.length > 0 && startVertex === null) {
        startVertex = u;
      }
    }
    switch (oddVertices.length) {
      case 0:
        this.isEulerian = this.EULERIAN;
        this.notify();
        break;
      case 2:
        this.isEulerian = this.SEMI_EULERIAN;
        startVertex = oddVertices[0];
        this.notify();
        break;
      default:
        this.isEulerian = this.NON_EULERIAN;
        this.areEdgesLabeled = true;
        this.notify();
        return;
    }

    if (startVertex === null) return [];

    let currentPath = [startVertex];
    let circuit = [];

    while (currentPath.length > 0) {
      let u = currentPath[currentPath.length - 1];
      let neighbors = adj.get(u);

      if (neighbors && neighbors.length > 0) {
        const v: string = neighbors.pop()!;

        let undoNeighbors = adj.get(v);
        if (undoNeighbors) {
          let undoIndex = undoNeighbors.indexOf(u);
          if (undoIndex !== -1) {
            undoNeighbors.splice(undoIndex, 1);
          }
        }
        currentPath.push(v);
      } else {
        circuit.push(currentPath.pop());
      }
    }
    if (circuit.length !== Object.keys(this.edges).length + 1) {
      this.isEulerian = this.NON_EULERIAN;
      this.areEdgesLabeled = true;
      this.notify();
      return;
    }
    let prevVertexId: string = circuit[0]!;
    const updatedEdges: Record<string, Edge> = {};
    for (let orderNumber = 1; orderNumber < circuit.length; orderNumber++) {
      const vertexId: string = circuit[orderNumber]!;
      const edgeString = `${prevVertexId}/${vertexId}`;
      const edgeId = edgeIdByVertices.get(edgeString)!;
      updatedEdges[edgeId] = {
        id: edgeId,
        vertex1Id: prevVertexId, // making the edge directed as it is in the circuit
        vertex2Id: vertexId,
        label: `${orderNumber}`,
      };
      prevVertexId = vertexId;
    }
    this.edges = updatedEdges;
    this.areEdgesLabeled = true;
    this.notify();
    return circuit.reverse();
  };

  undoLastAction = () => {
    if (this.history.length == 0) return;
    const historyEntry: HistoryEntry = this.history.pop()!;
    console.log(historyEntry);
    switch (historyEntry.action) {
      case Action.ADD_VERTEX:
        this.undoAddVertex(historyEntry.vertex);
        break;
      case Action.DELETE_VERTEX:
        this.undoDeleteVertex(historyEntry.vertex);
        break;
      case Action.ADD_EDGE:
        this.undoAddEdge(historyEntry.edge);
        break;
      case Action.DELETE_EDGE:
        this.undoDeleteEdge(historyEntry.edge);
        break;
      case Action.CLEAR_GRAPH:
        const newHistoryEntryVertices = this.vertices;
        const newHistoryEntryEdges = this.edges;
        this.undoClearGraph(historyEntry.vertices, historyEntry.edges);
        historyEntry.vertices = newHistoryEntryVertices;
        historyEntry.edges = newHistoryEntryEdges;
    }
    this.undoneHistory.push(historyEntry);
    console.log("undone history", this.undoneHistory);
  };

  undoDeleteVertex = (vertex: Vertex) => {
    this.vertices = {
      ...this.vertices,
      [vertex.id]: vertex,
    };
    this.clearEdgeLabels();
    this.notify();
  };

  undoAddVertex = (vertex: Vertex) => {
    if (this.isLinkingActive && this.firstLinkingVertexId == vertex.id) {
      this.isLinkingActive = false;
    }
    const { [vertex.id]: deletedVertex, ...updatedVertices } = this.vertices;
    this.vertices = updatedVertices;
    this.clearEdgeLabels();
    this.notify();
  };

  undoDeleteEdge = (edge: Edge) => {
    this.vertices[edge.vertex1Id].edges++;
    this.vertices[edge.vertex2Id].edges++;
    this.edges = {
      ...this.edges,
      [edge.id]: edge,
    };
    this.clearEdgeLabels();
    this.notify();
  };

  undoAddEdge = (edge: Edge) => {
    const vertex1Id = edge.vertex1Id;
    const vertex2Id = edge.vertex2Id;
    this.vertices[vertex1Id].edges--;
    this.vertices[vertex2Id].edges--;
    const { [edge.id]: deletedEdge, ...updatedEdges } = this.edges;
    this.edges = updatedEdges;
    this.clearEdgeLabels();
    this.notify();
  };

  undoClearGraph = (
    vertices: Record<string, Vertex>,
    edges: Record<string, Edge>,
  ) => {
    this.vertices = vertices;
    this.edges = edges;
    this.clearEdgeLabels();
    this.notify();
  };

  redoLastAction = () => {
    if (this.undoneHistory.length == 0) return;
    const historyEntry: HistoryEntry = this.undoneHistory.pop()!;
    switch (historyEntry.action) {
      case Action.ADD_VERTEX:
        this.undoDeleteVertex(historyEntry.vertex);
        break;
      case Action.DELETE_VERTEX:
        this.undoAddVertex(historyEntry.vertex);
        break;
      case Action.ADD_EDGE:
        this.undoDeleteEdge(historyEntry.edge);
        break;
      case Action.DELETE_EDGE:
        this.undoAddEdge(historyEntry.edge);
        break;
      case Action.CLEAR_GRAPH:
        const newHistoryEntryVertices = this.vertices;
        const newHistoryEntryEdges = this.edges;
        this.undoClearGraph(historyEntry.vertices, historyEntry.edges);
        historyEntry.vertices = newHistoryEntryVertices;
        historyEntry.edges = newHistoryEntryEdges;
    }
    this.history.push(historyEntry);
  };
}

const graph = new Graph();
export default graph;
