import { deriveKey } from "../deriveKey";

describe("deriveKey", () => {
  it("should generate a key with random salt", () => {
    const result = deriveKey("secret");
    const result1 = deriveKey("secret");
    expect(result.derivedKey).not.toHaveLength(0);
    expect(result1.derivedKey).not.toHaveLength(0);
    expect(result1.derivedKey).not.toEqual(result.derivedKey);
    expect(result.salt).not.toHaveLength(0);
    expect(result.salt).not.toEqual(result1.salt);
  });
  it("should generate the same key with same salt", () => {
    const result = deriveKey("secret");
    const result1 = deriveKey("secret", result.salt);
    expect(result.derivedKey).toEqual(result1.derivedKey);
  });
});
