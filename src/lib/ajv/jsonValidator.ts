import Ajv, { ValidateFunction } from "ajv";
import collectionSchema from "./schema-collection-descriptor.json";
import nftSchema from "./schema-nft-descriptor.json";
import nftRecordSchema from "./schema-nft-record.json";
import accountSchema from "./schema-account-descriptor.json";
import { formatErrorMessage } from "./formatErrorMessage";

class JsonValidator {
  private ajv: Ajv;
  private collectionValidator: ValidateFunction | null = null;
  private nftValidator: ValidateFunction | null = null;
  private profileValidator: ValidateFunction | null = null;
  private nftRecordValidator: ValidateFunction | null = null;

  constructor() {
    this.ajv = new Ajv({ coerceTypes: true });
  }

  private getValidatorInstance(
    schema: object,
    ref: ValidateFunction | null
  ): ValidateFunction {
    if (!ref) {
      ref = this.ajv.compile(schema);
    }
    return ref;
  }

  private validate(
    json: object,
    schema: object,
    validator: ValidateFunction | null
  ) {
    const validate = this.getValidatorInstance(schema, validator);
    const isValid = validate(json);

    if (isValid) {
      return true;
    }

    const message = formatErrorMessage({
      schema: schema,
      data: json,
      errors: validate.errors!,
    });
    throw new Error(message);
  }

  validateCollection(json: object): boolean {
    return this.validate(json, collectionSchema, this.collectionValidator);
  }

  validateProfile(json: object): boolean {
    return this.validate(json, accountSchema, this.profileValidator);
  }

  validateNftRecord(json: object): boolean {
    return this.validate(json, nftRecordSchema, this.nftRecordValidator);
  }

  validateNft(json: object): boolean {
    return this.validate(json, nftSchema, this.nftValidator);
  }
}

export const jsonValidator = new JsonValidator();
