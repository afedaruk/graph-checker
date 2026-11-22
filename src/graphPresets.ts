import { Vertex, Edge } from "./graph";

export type GraphPreset = {
  vertices: Record<string, Vertex>;
  edges: Record<string, Edge>;
};

export const GRAPH_PRESETS: Record<string, GraphPreset> = {
  Star: {
    vertices: {
      1: { id: "1", x: 0, y: -228.6, edges: 2 },
      2: { id: "2", x: 237, y: -77.6, edges: 2 },
      3: { id: "3", x: 156, y: 193.4, edges: 2 },
      4: { id: "4", x: -158, y: 193.4, edges: 2 },
      5: { id: "5", x: -235, y: -77.6, edges: 2 },
    },
    edges: {
      1: { id: "1", vertex1Id: "1", vertex2Id: "3", label: "" },
      2: { id: "2", vertex1Id: "3", vertex2Id: "5", label: "" },
      3: { id: "3", vertex1Id: "5", vertex2Id: "2", label: "" },
      4: { id: "4", vertex1Id: "2", vertex2Id: "4", label: "" },
      5: { id: "5", vertex1Id: "4", vertex2Id: "1", label: "" },
    },
  },
  AdjacentSquares: {
    vertices: {
      1: { id: "1", x: -300, y: -150, edges: 2 },
      2: { id: "2", x: 0, y: -150, edges: 3 },
      3: { id: "3", x: 300, y: -150, edges: 2 },
      4: { id: "4", x: 300, y: 150, edges: 2 },
      5: { id: "5", x: 0, y: 150, edges: 3 },
      6: { id: "6", x: -300, y: 150, edges: 2 },
    },
    edges: {
      1: { id: "1", vertex1Id: "1", vertex2Id: "2", label: "" },
      2: { id: "2", vertex1Id: "2", vertex2Id: "3", label: "" },
      3: { id: "3", vertex1Id: "3", vertex2Id: "4", label: "" },
      4: { id: "4", vertex1Id: "4", vertex2Id: "5", label: "" },
      5: { id: "5", vertex1Id: "5", vertex2Id: "6", label: "" },
      6: { id: "6", vertex1Id: "6", vertex2Id: "1", label: "" },
      7: { id: "7", vertex1Id: "5", vertex2Id: "2", label: "" },
    },
  },
  Tree: {
    vertices: {
      1: { id: "1", x: 0, y: -200, edges: 3 },
      2: { id: "2", x: -200, y: 0, edges: 1 },
      3: { id: "3", x: 0, y: 0, edges: 2 },
      4: { id: "4", x: 200, y: 0, edges: 1 },
      5: { id: "5", x: 0, y: 200, edges: 1 },
    },
    edges: {
      1: { id: "1", vertex1Id: "1", vertex2Id: "2", label: "" },
      2: { id: "2", vertex1Id: "1", vertex2Id: "3", label: "" },
      3: { id: "3", vertex1Id: "1", vertex2Id: "4", label: "" },
      4: { id: "4", vertex1Id: "3", vertex2Id: "5", label: "" },
    },
  },
};
