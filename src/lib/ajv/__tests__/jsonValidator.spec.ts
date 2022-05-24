import { jsonValidator } from "../jsonValidator";

describe("JsonValidator", () => {
  describe("validateCollection", () => {
    it("should throw an error for invalid json", () => {
      const descriptor = {
        nc: "name",
        // ds: 'description',
        si: {
          ["Qm234"]: "image/webp",
        },
        bg: { ["Qm123"]: "image/webp" },
        hp: "https://foo.com",
        sc: "",
      };

      expect(() => {
        jsonValidator.validateCollection(descriptor);
      }).toThrow("must have required property 'ds'");
    });
    it("should validate as expected for valid json", () => {
      const descriptor = {
        nc: "name",
        ds: "description",
        si: {
          ["Qm234"]: "image/webp",
        },
        bg: { ["Qm123"]: "image/webp" },
        hp: "https://foo.com",
        sc: "",
      };
      expect(jsonValidator.validateCollection(descriptor)).toBeTruthy();
    });
  });
});
