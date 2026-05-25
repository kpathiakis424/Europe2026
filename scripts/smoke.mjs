import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://example.com/europe2026/",
  pretendToBeVisual: true,
});

const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.localStorage = window.localStorage;
globalThis.location = window.location;
globalThis.history = window.history;
globalThis.btoa = window.btoa;
globalThis.atob = window.atob;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.getComputedStyle = window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const errors = [];
const origError = console.error;
console.error = (...a) => {
  errors.push(a.join(" "));
  origError(...a);
};

const { mount } = await import("../.smoke/harness.mjs");
const container = document.getElementById("root");
mount(container);

await new Promise((r) => setTimeout(r, 200));

const text = document.body.textContent || "";
const must = [
  "Europe 2026",
  "Zürich",
  "London",
  "Where should we go in between",
  "Friends' leg",
  "Lisbon",
  "Barcelona",
  "Who are you?",
];
const missing = must.filter((m) => !text.includes(m));

const cards = document.querySelectorAll(".city-card").length;

// --- interaction: click a vote button and confirm it persists ---
const voteBtn = document.querySelector(".city-card .vote-btn");
voteBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 100));
let votePersisted = false;
try {
  const saved = JSON.parse(localStorage.getItem("europe2026.trip.v1"));
  votePersisted = saved.cities.some((c) => c.votes.length > 0);
} catch {}

const realErrors = errors.filter((e) => !/not wrapped in act/i.test(e));

console.log(`\n--- smoke result ---`);
console.log("city cards rendered:", cards);
console.log("missing keywords:", missing.length ? missing : "none");
console.log("runtime console.error count:", realErrors.length);
console.log("vote persisted to storage:", votePersisted);

if (missing.length || cards < 8 || realErrors.length || !votePersisted) {
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("RESULT: PASS");
process.exit(0);
