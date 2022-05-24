import { Amount } from "@signumjs/util";
import startCase from "lodash.startcase";

export function printableTableObject(obj: any): any {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    let val = v as any;
    if (val instanceof Date) {
      val = val.toUTCString();
    }
    if (val instanceof Amount) {
      val = val.getSigna() + " SIGNA";
    }

    if (val.ipfsHash !== undefined && val.mimeType !== undefined) {
      val = val.ipfsHash ? val.ipfsHash + ":" + val.mimeType : "";
    }
    // @ts-ignore
    acc[startCase(k)] = val;
    return acc;
  }, {});
}
