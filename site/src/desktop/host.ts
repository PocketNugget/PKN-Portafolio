export interface DeskApp {
  pause(): void;
  resume(): void;
  destroy(): void;
}

export const idleApp: DeskApp = {
  pause() {},
  resume() {},
  destroy() {},
};
