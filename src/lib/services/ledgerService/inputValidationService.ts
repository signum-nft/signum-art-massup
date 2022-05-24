import isURL from "validator/lib/isURL";
import { Amount } from "@signumjs/util";

export class InvalidInputError extends Error {
  constructor(detail?: string) {
    super(`Invalid Argument ${detail ? ": " + detail : ""}`);
  }
}

export class InputValidationService {
  public static assertURL(url: string) {
    if (!InputValidationService.isValidURL(url)) {
      throw new InvalidInputError(
        "URLs with fragments or query parameters are not allowed"
      );
    }
  }

  public static assertAmountGreaterThan(minimum: Amount, actual: Amount) {
    if (!actual.greater(minimum)) {
      throw new InvalidInputError(
        `Amount must be greater than ${minimum.getSigna()} Signa`
      );
    }
  }

  public static assertAmountGreaterOrEqualThan(
    minimum: Amount,
    actual: Amount
  ) {
    if (!actual.greaterOrEqual(minimum)) {
      throw new InvalidInputError(
        `Amount must be greater or equal than ${minimum.getSigna()} Signa`
      );
    }
  }

  public static assertAmountBetween(
    minimum: Amount,
    maximum: Amount,
    actual: Amount
  ) {
    if (actual.greaterOrEqual(minimum) && actual.lessOrEqual(minimum)) return;
    throw new InvalidInputError(
      `Amount must be between ${minimum.getSigna()} and ${maximum.getSigna()} Signa`
    );
  }

  public static assertNumberBetween(
    minimum: number,
    maximum: number,
    actual: number
  ) {
    if (minimum <= actual && actual <= maximum) return;
    throw new InvalidInputError(
      `Value must be between ${minimum} and ${maximum}`
    );
  }

  public static assertNumberGreaterOrEqualThan(
    minimum: number,
    actual: number
  ) {
    if (actual < minimum) {
      throw new InvalidInputError(
        `Value must be greater or equal than ${minimum}`
      );
    }
  }

  public static assertNumberLessOrEqualThan(maximum: number, actual: number) {
    if (maximum < actual) {
      throw new InvalidInputError(
        `Value must be less or equal than ${maximum}`
      );
    }
  }

  public static isValidURL(url: string): boolean {
    return isURL(url, {
      allow_fragments: false,
      allow_query_components: false,
      require_protocol: true,
    });
  }

  public static isTextGreaterThan(text: string, characters: number): boolean {
    return text && text.length > characters ? true : false;
  }

  public static isTextLowerThan(text: string, characters: number): boolean {
    return text && text.length < characters ? true : false;
  }

  public static isNumberGreaterThan(
    value: string | number,
    amount: number
  ): boolean {
    if (typeof value === "number") {
      return value > amount;
    }

    const n = parseFloat(value);
    if (Number.isNaN(n)) return false;

    return n > amount;
  }

  public static isNumberLowerThan(
    value: string | number,
    amount: number
  ): boolean {
    if (typeof value === "number") {
      return value < amount;
    }
    const n = parseFloat(value);
    if (Number.isNaN(n)) return false;

    return n < amount;
  }
}
