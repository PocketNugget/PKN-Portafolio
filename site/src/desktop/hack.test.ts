// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { setLang } from "../i18n";
import { mountClippy } from "./buddy";
import { NUGGET_HACKED, NUGGET_RELIEF } from "./facts";
import { HACK_LINES, HACK_POPS, mountHack } from "./hack";

const random = Math.random;

afterEach(() => {
  vi.useRealTimers();
  Math.random = random;
  document.body.replaceChildren();
  sessionStorage.clear();
  setLang("en");
});

function desk(): { host: HTMLElement; layer: HTMLElement; app: HTMLElement } {
  document.body.innerHTML = `<div id="app"><div id="desktop">
      <button class="desk-icon" data-app="about"><span class="label">About Me</span></button>
      <a class="social-link" href="https://github.com/PocketNugget"><span>GitHub</span></a>
      <div id="windows"></div>
    </div></div>`;
  const app = document.getElementById("app");
  const desktop = document.getElementById("desktop");
  const layer = document.getElementById("windows");
  const host = document.createElement("div");
  if (!(app instanceof HTMLElement) || !(desktop instanceof HTMLElement) || !(layer instanceof HTMLElement)) {
    throw new Error("desk fixture");
  }
  mountClippy(desktop);
  document.body.append(host);
  return { host, layer, app };
}

function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const found = [...host.querySelectorAll("button")].find((item) => item.textContent === name);
  if (!(found instanceof HTMLButtonElement)) throw new Error(name);
  return found;
}

describe("desk payload", () => {
  it("keeps the drop inside the page", () => {
    const text = [...HACK_LINES, ...HACK_POPS.map((pop) => `${pop.title}\n${pop.body}`)].join("\n");
    expect(HACK_LINES.at(-1)).toContain("Payload is live");
    expect(text.toLowerCase()).toContain("payload");
    expect(text).not.toMatch(/fake|falso|falscher|faux/i);
    expect(text).not.toContain("—");
    expect(text).not.toContain("40%");
    expect(text).not.toMatch(/pickle|torch\.load/i);
    expect(HACK_POPS).toHaveLength(5);
  });

  it("has the nugget react when the payload drops and relax at Reset", async () => {
    vi.useFakeTimers();
    Math.random = () => 0;
    const { host, layer, app } = desk();
    mountHack(host, layer, app.querySelector("#desktop") as HTMLElement);
    buttonNamed(host, "Drop the payload").click();
    await vi.advanceTimersByTimeAsync(40);
    expect(document.querySelector("#clippy .balloon p")?.textContent).toBe(NUGGET_HACKED[0]);
    buttonNamed(host, "Reset").click();
    expect(document.querySelector("#clippy .balloon p")?.textContent).toBe(NUGGET_RELIEF);
    expect(document.getElementById("clippy")?.classList.contains("is-scared")).toBe(false);
  });

  it("dirties the desk until reset, then puts the labels back", async () => {
    vi.useFakeTimers();
    Math.random = () => 0;
    const { host, layer, app } = desk();
    mountHack(host, layer, app.querySelector("#desktop") as HTMLElement);
    expect(host.textContent).toContain("aggressive payload");
    const warning = host.querySelector(".hack-warning");
    expect(warning?.textContent).toContain("photosensitive epilepsy");
    const drop = host.querySelector(".hack-drop");
    expect(warning && drop && (warning.compareDocumentPosition(drop) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true);
    expect(host.textContent).not.toMatch(/fake|falso/i);
    buttonNamed(host, "Drop the payload").click();
    await vi.advanceTimersByTimeAsync(40);
    expect(document.getElementById("clippy")?.classList.contains("is-scared")).toBe(true);
    expect(document.querySelector("#clippy .balloon p")?.textContent).toBe(NUGGET_HACKED[0]);
    expect(app.classList.contains("is-hacked")).toBe(true);
    expect(document.querySelector(".hack-tear")).not.toBeNull();
    expect(document.querySelector(".desk-icon.is-corrupt")).not.toBeNull();
    expect(document.querySelector(".social-link.is-corrupt")).not.toBeNull();
    const label = document.querySelector(".desk-icon .label");
    expect(label?.textContent).toBe("█████ ██");
    expect(label).toHaveProperty("dataset.hackClean", "About Me");
    await vi.advanceTimersByTimeAsync(30000);
    expect(app.classList.contains("is-hacked")).toBe(true);
    expect(host.querySelector(".hack-log")?.textContent).toContain("Payload delivered");
    expect(layer.querySelectorAll(".hack-pop")).toHaveLength(HACK_POPS.length);
    buttonNamed(host, "Reset").click();
    expect(document.getElementById("clippy")?.classList.contains("is-scared")).toBe(false);
    expect(app.classList.contains("is-hacked")).toBe(false);
    expect(document.querySelector(".hack-tear")).toBeNull();
    expect(document.querySelector(".is-corrupt")).toBeNull();
    expect(layer.querySelector(".hack-pop")).toBeNull();
    expect(document.querySelector(".desk-icon .label")?.textContent).toBe("About Me");
    expect(document.querySelector(".social-link span")?.textContent).toBe("GitHub");
    expect(host.querySelector(".hack-log")?.textContent).toBe("Payload recalled. The desktop is clean.");
  });

  it("restores the desk when the window closes mid hack", async () => {
    vi.useFakeTimers();
    Math.random = () => 0;
    const { host, layer } = desk();
    const desktop = document.getElementById("desktop");
    if (!(desktop instanceof HTMLElement)) throw new Error("desktop");
    const handle = mountHack(host, layer, desktop);
    buttonNamed(host, "Drop the payload").click();
    await vi.advanceTimersByTimeAsync(40);
    expect(document.getElementById("app")?.classList.contains("is-hacked")).toBe(true);
    handle.destroy();
    await vi.advanceTimersByTimeAsync(30000);
    expect(document.getElementById("app")?.classList.contains("is-hacked")).toBe(false);
    expect(document.querySelector(".desk-icon .label")?.textContent).toBe("About Me");
    expect(document.querySelector(".hack-pop")).toBeNull();
  });

  it("shows the spanish warning before the hack starts", () => {
    setLang("es");
    const { host, layer } = desk();
    const desktop = document.getElementById("desktop");
    if (!(desktop instanceof HTMLElement)) throw new Error("desktop");
    mountHack(host, layer, desktop);
    expect(host.textContent).toContain("payload agresivo");
    expect(host.textContent).not.toMatch(/falso|fake/i);
    expect(buttonNamed(host, "Reiniciar").textContent).toBe("Reiniciar");
  });
});
