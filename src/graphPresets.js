export const GRAPH_PRESETS = {
  Star: {
    vertices: {
      1: { id: "1", x: 1010, y: 162, edges: 2 },
      2: { id: "2", x: 1247, y: 313, edges: 2 },
      3: { id: "3", x: 1166, y: 584, edges: 2 },
      4: { id: "4", x: 852, y: 571, edges: 2 },
      5: { id: "5", x: 775, y: 323, edges: 2 },
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
      1: { id: "1", x: 700, y: 200, edges: 2 },
      2: { id: "2", x: 1000, y: 200, edges: 3 },
      3: { id: "3", x: 1300, y: 200, edges: 2 },
      4: { id: "4", x: 1300, y: 500, edges: 2 },
      5: { id: "5", x: 1000, y: 500, edges: 3 },
      6: { id: "6", x: 700, y: 500, edges: 2 },
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
      1: { id: "1", x: 1000, y: 200, edges: 3 },
      2: { id: "2", x: 800, y: 400, edges: 1 },
      3: { id: "3", x: 1000, y: 400, edges: 2 },
      4: { id: "4", x: 1200, y: 400, edges: 1 },
      5: { id: "5", x: 1000, y: 600, edges: 1 },
    },
    edges: {
      1: { id: "1", vertex1Id: "1", vertex2Id: "2", label: "" },
      2: { id: "2", vertex1Id: "1", vertex2Id: "3", label: "" },
      3: { id: "3", vertex1Id: "1", vertex2Id: "4", label: "" },
      4: { id: "4", vertex1Id: "3", vertex2Id: "5", label: "" },
    },
  },
};
