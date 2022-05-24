import {
  convertDecStringToHexString,
  convertHexStringToDecString,
} from "@signumjs/util";

export function convertToContractBlockheight(blockheight: number): string {
  if (blockheight < 0) throw new Error("Negative blockheight not allowed");
  const hexBlockHeight = convertDecStringToHexString(String(blockheight));
  return convertHexStringToDecString(hexBlockHeight + "00000000");
}
