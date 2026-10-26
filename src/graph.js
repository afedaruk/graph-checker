/*
  const solveEulerian = () => {
    const graph = {};
    const edgesByVertices = {};
    const nextEdgeId = {};
    const visitedFrom = {};

    Object.keys(vertices).forEach((vertexId) => {
      graph[vertexId] = [];
      visitedFrom[vertexId] = -1;
    });

    Object.values(edges).forEach((edge) => {
      graph[edge.vertex1Id].push(edge.vertex2Id);
      graph[edge.vertex2Id].push(edge.vertex1Id);
      edgesByVertices[`${edge.vertex1Id}/${edge.vertex2Id}`] = edge.id;
      edgesByVertices[`${edge.vertex2Id}/${edge.vertex1Id}`] = edge.id;
      nextEdgeId[edge.id] = -1;
    });

    const oddVertices = [];
    const lastCheckedVertexId = -1;
    const finalVertexId = -1;

    Object.keys(graph).forEach((vertexId) => {
      const connectedTo = graph[vertexId];
      if (connectedTo.length % 2 == 1) oddVertices.push(vertexId);
      lastCheckedVertexId = vertexId;
    });
    const path = [];
    switch (oddVertices.length) {
      case 0:
        alert("eulerian");
        path.push(lastCheckedVertexId);
        break;
      case 2:
        alert("semi eulerian");
        // bfs find any path between odd vertices
        const fromId = oddVertices[0];
        const toId = oddVertices[1];
        const queue = new Queue();
        visitedFrom[fromId] = 0;
        queue.push(fromId);
        while (!queue.empty()) {
          let vertexId = queue.retrieve();
          if (vertexId == toId) {
            while (vertexId != 0) {
              path.push(vertexId);
              vertexId = visitedFrom[vertexId];
            }
            queue.clear();
            break;
          }
          graph[vertexId].forEach((neighbourId) => {
            if (visitedFrom[neighbourId] == -1) {
              queue.push(neighbourId);
              visitedFrom[neighbourId] = vertexId;
            }
          });
        }

        break;
      default:
        alert("non eulerian");
        return;
    }

    const prevVertexId = -1;
    path.forEach((vertexId) => {
      if (prevVertexId != -1) {
        //next Id[prevVertexId] = vertexId;
      }
      prevVertexId = vertexId;
    });
    nextId[prevVertexId] = 0;
    console.log(path);

    const verticesToCheck = new Queue();
    verticesToCheck.push(...path);
    while (!verticesToCheck.empty()) {
      Object.values(visitedFrom).forEach((visitedFromValue) => {
        visitedFromValue = -1;
      });
      const fromId = verticesToCheck.retrieve();
      const toId = fromId;
      const bfs = new Queue();
      visitedFrom[fromId] = 0;
      graph[fromId].forEach((neighbourId) => {
        bfs.push(neighbourId);
        graph[neighbourId].visitedFrom = fromId;
      });
      while (!bfs.empty()) {
        let vertexId = bfs.retrieve();
        if (vertexId == toId) {
          while (vertexId != 0) {
            path.push(vertexId);
            vertexId = visitedFrom[vertexId];
          }
          bfs.clear();
          break;
        }
        graph[vertexId].forEach((neighbourId) => {
          if (graph[neighbourId].visitedFrom == -1) {
            bfs.push(neighbourId);
            graph[neighbourId].visitedFrom = vertexId;
          }
        });
      }
      const prevVertexId = fromId;
      path.forEach((vertexId) => {
        prevVertexId.nextId = 

        //if (vertexId != fromId) verticesToCheck.push(vertexId);
      });

    }
  };
*/
// From the Wikipedia article Eulerian path:
// The term Eulerian graph has two common meanings in graph theory.
// One meaning is a graph with an Eulerian circuit,
// and the other is a graph with every vertex of even degree.
// These definitions coincide for connected graphs.
// This function uses the weaker definition.
/*const checkIsEulerian = () => {
    let oddVertices = 0;
    Object.values(vertices).forEach((vertex) => {
      if (vertex.edges % 2 == 1) {
        oddVertices++;
      }
    });
    if (oddVertices == 0) {
      return "Eulerian. Can be traversed starting and ending at the same vertex";
    }
    if (oddVertices == 2) {
      return "Semi-Eulerian. Can be traversed starting and ending at different vertices";
    }
    return "Neither Eulerian nor Semi-Eulerian. Cannot be traversed with a continuous path without repeating an edge";
  };*/
