import { getAttributesFromNftRecord } from "../getAttributesFromNftRecord";
import { NftRecord } from "../../../../../lib/services/csvService";

const TestNftRecord1 = {
  name: "Awesome NFT #1",
  description: "This is the most valuable NFT ever",
  symbol: "AWESOME",
  edition: "Summer",
  royalties: 10,
  identifier: 1,
  image1: "/home/ohager/Desktop/massup_test_data/1.png",
  image2: "/home/ohager/Desktop/massup_test_data/2.png",
  image3: "",
  attribute1: "key1:value1",
  attribute2: "key2:value2",
  attribute3: "key3:value3",
  attribute4: "key4:value4",
  attribute5: "key5:value5",
  attribute6: "key6:value6",
  attribute7: "key7:value7",
  attribute8: "key8:value8",
  listingMode: "OnAuction",
  price: 1000,
  offerPrice: 2000,
  auctionEnd: "2022-05-19T18:59:02.417Z",
} as NftRecord;

const TestNftRecord2 = {
  name: "Awesome NFT #1",
  description: "This is the most valuable NFT ever",
  symbol: "AWESOME",
  edition: "Summer",
  royalties: 10,
  identifier: 1,
  image1: "/home/ohager/Desktop/massup_test_data/1.png",
  image2: "/home/ohager/Desktop/massup_test_data/2.png",
  image3: "",
  attribute1: "key1:value1",
  attribute2: "key2:value2",
  attribute3: "",
  attribute4: "",
  attribute5: "",
  attribute6: "key6:value6",
  attribute7: "",
  attribute8: "key8:value8",
  listingMode: "OnAuction",
  price: 1000,
  offerPrice: 2000,
  auctionEnd: "2022-05-19T18:59:02.417Z",
} as NftRecord;

const TestNftRecord3 = {
  name: "Awesome NFT #1",
  description: "This is the most valuable NFT ever",
  symbol: "AWESOME",
  edition: "Summer",
  royalties: 10,
  identifier: 1,
  image1: "/home/ohager/Desktop/massup_test_data/1.png",
  image2: "/home/ohager/Desktop/massup_test_data/2.png",
  image3: "",
  attribute1: "",
  attribute2: "",
  attribute3: "",
  attribute4: "",
  attribute5: "",
  attribute6: "",
  attribute7: "",
  attribute8: "",
  listingMode: "OnAuction",
  price: 1000,
  offerPrice: 2000,
  auctionEnd: "2022-05-19T18:59:02.417Z",
} as NftRecord;

describe("getAttributesFromNftRecord", () => {
  it("should map attributes as expected - #1", () => {
    const result = getAttributesFromNftRecord(TestNftRecord1);
    expect(result).toEqual([
      { key1: "value1" },
      { key2: "value2" },
      { key3: "value3" },
      { key4: "value4" },
      { key5: "value5" },
      { key6: "value6" },
      { key7: "value7" },
      { key8: "value8" },
    ]);
  });

  it("should map attributes as expected - #2", () => {
    const result = getAttributesFromNftRecord(TestNftRecord2);
    expect(result).toEqual([
      { key1: "value1" },
      { key2: "value2" },
      { key6: "value6" },
      { key8: "value8" },
    ]);
  });

  it("should deal with no attributes at all", () => {
    const result = getAttributesFromNftRecord(TestNftRecord3);
    expect(result).toEqual([]);
  });
});
