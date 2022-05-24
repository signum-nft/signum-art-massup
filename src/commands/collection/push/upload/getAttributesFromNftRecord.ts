import { Attribute } from "@commands/collection/push/upload/nftDescriptor";
import { NftRecord } from "@lib/services/csvService";

export function getAttributesFromNftRecord(record: NftRecord): Attribute[] {
  const attributes: Attribute[] = [];
  for (let i = 1; i <= 8; ++i) {
    // @ts-ignore
    const att = record[`attribute${i}`];
    if (att) {
      const [key, value] = att.split(":");
      attributes.push({ [key]: value });
    }
  }
  return attributes;
}
