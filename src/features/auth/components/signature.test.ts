import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createSignature } from "./signature.ts";

test("a tap without a stroke does not create a signature", () => {
  assert.equal(createSignature([{ x: 10, y: 20, start: true }], 400), null);
});

test("the signature uses the pad width and keeps strokes separate", () => {
  const signature = createSignature([
    { x: 10, y: 20, start: true },
    { x: 30, y: 40, start: false },
    { x: 350, y: 50, start: true },
    { x: 390, y: 60, start: false },
  ], 400);
  assert.ok(signature?.startsWith("data:image/svg+xml;base64,"));
  const svg = atob(signature.slice("data:image/svg+xml;base64,".length));
  assert.match(svg, /viewBox="0 0 400 160"/);
  assert.match(svg, /d="M 10 20 L 30 40 M 350 50 L 390 60"/);
});
