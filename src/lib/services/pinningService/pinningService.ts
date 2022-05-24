export interface PinningService {
  pinFile: (filePath: string, metadata?: unknown) => Promise<string>;
}
