export interface PinningService {
  testAuthentication: () => Promise<boolean>;
  pinFile: (filePath: string, metadata?: unknown) => Promise<string>;
}
