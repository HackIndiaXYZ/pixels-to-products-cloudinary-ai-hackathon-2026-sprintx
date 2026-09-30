import { expect, it } from "vitest";
import { isSameOrigin } from "./request-origin";
it("accepts the browser's requested host when Next reconstructs localhost", () => {
  expect(isSameOrigin(new Request("http://localhost:3000/api/upload", { headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" } }))).toBe(true);
});
it("rejects a different website, port or scheme", () => {
  for (const origin of ["https://attacker.example", "http://127.0.0.1:4000", "https://127.0.0.1:3000", "null"]) {
    expect(isSameOrigin(new Request("http://localhost:3000/api/upload", { headers: { origin, host: "127.0.0.1:3000" } }))).toBe(false);
  }
});
it("accepts same-origin production requests and nonbrowser requests", () => {
  expect(isSameOrigin(new Request("https://lens.example/api/upload", { headers: { origin: "https://lens.example", host: "lens.example" } }))).toBe(true);
  expect(isSameOrigin(new Request("http://localhost:3000/api/upload"))).toBe(true);
});
