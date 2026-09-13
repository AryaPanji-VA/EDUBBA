export type EngineMode = "dark" | "light";

export interface EngineController {
  start(): void;
  stop(): void;
  resize(): void;
  redraw(): void;
}

export type EngineFactory = (canvas: HTMLCanvasElement, mode: EngineMode, reduced: boolean) => EngineController;
