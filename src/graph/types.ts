export enum Action {
  ADD_VERTEX = "ADD_VERTEX",
  DELETE_VERTEX = "DELETE_VERTEX",
  MOVE_VERTEX = "MOVE_VERTEX",
  ADD_EDGE = "ADD_EDGE",
  DELETE_EDGE = "DELETE_EDGE",
  CLEAR_GRAPH = "CLEAR_GRAPH",
}

export enum EulerianStatus {
  EULERIAN = "eulerian",
  SEMI_EULERIAN = "semi-eulerian",
  NON_EULERIAN = "non-eulerian",
  EMPTY_GRAPH = "graph is empty",
  UNDETERMINED = "",
}
