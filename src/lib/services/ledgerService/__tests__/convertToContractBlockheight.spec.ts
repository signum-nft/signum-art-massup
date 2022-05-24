import { convertToContractBlockheight } from "../convertToContractBlockheight";

describe("convertToContractBlockheight", () => {
  it("should convert as expected", () => {
    expect(convertToContractBlockheight(0)).toBe("0");
    expect(convertToContractBlockheight(374538)).toBe("1608628461109248");
  });
  it("should throw on negative value", () => {
    expect(() => convertToContractBlockheight(-120)).toThrow();
  });
});
