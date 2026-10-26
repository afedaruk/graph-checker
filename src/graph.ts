import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import { GRAPH_PRESETS } from "./graphPresets.ts";

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

class Graph {
  private vertices: Record<string, Vertex> = {};
  private edges: Record<string, Edge> = {};
  private listeners: Set<() => void> = new Set();
  // {"1698000000": { id: "1698000000", x: 100, y: 150, edges: 0, label: 0 }}
  // {"1698000000": { id: "1698000000", vertex1Id: 0, vertex2Id: 1, label: "" }}

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
    this.vertices = {};
    this.edges = {};
    this.notify();
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

  loadFromPreset = (presetName: string) => {
    this.vertices = GRAPH_PRESETS[presetName].vertices;
    this.edges = GRAPH_PRESETS[presetName].edges;
    this.clearEdgeLabels();
    this.notify();
  };

  createVertex = (x: number, y: number) => {
    const id = Date.now().toString();
    this.vertices = {
      ...this.vertices,
      [id]: {
        id,
        x,
        y,
        edges: 0,
      },
    };
    this.clearEdgeLabels();
    this.notify();
  };

  createEdge = (vertex1Id: string, vertex2Id: string) => {
    const id = Date.now().toString();
    this.vertices[vertex1Id].edges++;
    this.vertices[vertex2Id].edges++;
    this.edges = {
      ...this.edges,
      [id]: {
        id,
        vertex1Id,
        vertex2Id,
        label: "",
      },
    };
    this.clearEdgeLabels();
    this.notify();
  };

  startLinkingVertices = (vertexId: string) => {
    if (this.isLinkingActive) {
      if (vertexId != this.firstLinkingVertexId) {
        this.createEdge(this.firstLinkingVertexId, vertexId);
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
        break;
      case 2:
        this.isEulerian = this.SEMI_EULERIAN;
        startVertex = oddVertices[0];
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
    console.log(this.edges);
    return circuit.reverse();
  };
}

const graph = new Graph();
export default graph;
