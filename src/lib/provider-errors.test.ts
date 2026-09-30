import { describe, expect, it } from "vitest";
import { uploadFailureMessage } from "./provider-errors";

describe("safe upload diagnostics", () => {
  it("explains authentication failures in both SDK error shapes", () => {
    expect(uploadFailureMessage({ http_code: 401 })).toContain("matching key and secret");
    expect(uploadFailureMessage({ error: { http_code: 401 } })).toContain("matching key and secret");
  });
  it("does not expose arbitrary provider error content", () => {
    const message = uploadFailureMessage({ message: "secret=do-not-show", request_options: { auth: "key:secret" } });
    expect(message).not.toContain("do-not-show");
    expect(message).not.toContain("key:secret");
  });
  it("distinguishes permissions and rate limits", () => {
    expect(uploadFailureMessage({ http_code: 403 })).toContain("permissions");
    expect(uploadFailureMessage({ http_code: 429 })).toContain("rate limit");
  });
});
