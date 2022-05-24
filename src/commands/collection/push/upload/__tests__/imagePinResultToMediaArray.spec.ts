import { imagePinResultToMediaArray } from "../imagePinResultToMediaArray";

const TestResultMap = [
  {
    file: "00003.1-social.webp",
    hash: "hash-00003.1-social",
  },
  {
    file: "00003.1-thumb.webp",
    hash: "hash-00003.1-thumb",
  },
  {
    file: "00003.1.png",
    hash: "hash-00003.1",
  },
  {
    file: "00003.2-social.webp",
    hash: "hash-00003.2-social",
  },
  {
    file: "00003.2-thumb.webp",
    hash: "hash-00003.2-thumb",
  },
  {
    file: "00003.2.jpg",
    hash: "hash-00003.2",
  },
  {
    file: "00003.3-social.webp",
    hash: "hash-00003.3-social",
  },
  {
    file: "00003.3-thumb.webp",
    hash: "hash-00003.3-thumb",
  },
  {
    file: "00003.3.svg",
    hash: "hash-00003.3",
  },
];

const TestResultMapSmall = [
  {
    file: "00003.1-social.webp",
    hash: "hash-00003.1-social",
  },
  {
    file: "00003.1-thumb.webp",
    hash: "hash-00003.1-thumb",
  },
  {
    file: "00003.1.png",
    hash: "hash-00003.1",
  },
];

describe("imagePinResultToMediaArray", () => {
  it("should return the expected data structure", () => {
    const result = imagePinResultToMediaArray(TestResultMap);
    expect(result).toEqual([
      {
        social: "hash-00003.1-social",
        thumb: "hash-00003.1-thumb",
        "hash-00003.1": "image/png",
      },
      {
        social: "hash-00003.2-social",
        thumb: "hash-00003.2-thumb",
        "hash-00003.2": "image/jpg",
      },
      {
        social: "hash-00003.3-social",
        thumb: "hash-00003.3-thumb",
        "hash-00003.3": "image/svg+xml",
      },
    ]);
  });
  it("should return the expected data structure - small", () => {
    const result = imagePinResultToMediaArray(TestResultMapSmall);
    expect(result).toEqual([
      {
        social: "hash-00003.1-social",
        thumb: "hash-00003.1-thumb",
        "hash-00003.1": "image/png",
      },
    ]);
  });
  it("should throw error on invalid file format", () => {
    expect(() => {
      imagePinResultToMediaArray([
        {
          file: "myimpag.webp",
          hash: "hash-00003.1-social",
        },
      ]);
    }).toThrow();
  });
});
