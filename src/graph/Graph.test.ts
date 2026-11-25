// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { Graph } from "./Graph";
import { EulerianStatus } from "./types";

describe("Graph", () => {
  let graph: Graph;

  const useGraphState = () =>
    useSyncExternalStore(graph.subscribe, graph.getSnapshot);

  beforeEach(() => {
    graph = new Graph();
  });

  afterEach(() => {
    cleanup();
  });

  it("adds and deletes a vertex", () => {
    const { result } = renderHook(useGraphState);

    act(() => {
      graph.addVertex(100, 200);
    });

    const ids = Object.keys(result.current.vertices);
    expect(ids).toHaveLength(1);

    act(() => {
      graph.deleteVertex(ids[0]);
    });

    expect(Object.keys(result.current.vertices)).toHaveLength(0);
  });

  it("does not mutate presets across repeated loads", () => {
    const { result } = renderHook(useGraphState);

    act(() => {
      graph.loadFromPreset("Tree", 500, 500);
    });
    const firstLoadX = result.current.vertices["1"].x;

    act(() => {
      graph.loadFromPreset("Tree", 500, 500);
    });
    expect(result.current.vertices["1"].x).toBe(firstLoadX);
  });

  it("detects Eulerian vs non-Eulerian presets", () => {
    renderHook(useGraphState);

    let isEulerianResult: unknown;
    act(() => {
      graph.loadFromPreset("Star", 0, 0);
      isEulerianResult = graph.getIsEulerian();
    });
    expect(isEulerianResult).toBe(EulerianStatus.EULERIAN);

    act(() => {
      graph.loadFromPreset("AdjacentSquares", 0, 0);
      isEulerianResult = graph.getIsEulerian();
    });
    expect(isEulerianResult).toBe(EulerianStatus.SEMI_EULERIAN);

    act(() => {
      graph.loadFromPreset("Tree", 0, 0);
      isEulerianResult = graph.getIsEulerian();
    });
    expect(isEulerianResult).toBe(EulerianStatus.NON_EULERIAN);
  });

  it("undoes and redoes adding a vertex", () => {
    const { result } = renderHook(useGraphState);

    act(() => {
      graph.addVertex(10, 20);
    });
    expect(Object.keys(result.current.vertices)).toHaveLength(1);

    act(() => {
      graph.undoLastAction();
    });
    expect(Object.keys(result.current.vertices)).toHaveLength(0);

    act(() => {
      graph.redoLastAction();
    });
    expect(Object.keys(result.current.vertices)).toHaveLength(1);
  });
});
