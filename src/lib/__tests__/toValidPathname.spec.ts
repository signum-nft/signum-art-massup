import { toValidPathname } from "../toValidPathname";

describe("toValidPathname", () => {
  it("should generate valid pathnames", () => {
    expect(toValidPathname(" some path name    ")).toEqual("somepathname");
    expect(toValidPathname("%$^|||  weird 😁")).toEqual("weird");
    expect(
      toValidPathname("a very long path name cutted down to 24 chars")
    ).toEqual("averylongpathnamecuttedd");
    expect(
      toValidPathname("a very long weird^|😁 path name cutted down to 24 chars")
    ).toEqual("averylongweirdpathnamecu");
    expect(toValidPathname("já tomei cerveja hoje?")).toEqual(
      "jtomeicervejahoje"
    );
    expect(toValidPathname("har allerede drukket øl i dag")).toEqual(
      "harallerededrukketlidag"
    );
    expect(toValidPathname("это русский текст")).toMatch(/collection\d+/);
    expect(toValidPathname("这是一些俄文文本")).toMatch(/collection\d+/);
  });
});
