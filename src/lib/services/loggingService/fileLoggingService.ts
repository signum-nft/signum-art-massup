import pino from "pino";

export class FileLoggingService {
  private logger: any;

  constructor(private logFilePath: string) {
    const transport = pino.transport({
      target: "pino-pretty",
      options: {
        colorize: false,
        translateTime: true,
        destination: logFilePath,
      },
    });
    this.logger = pino(transport);
  }

  log(msg: string, obj?: object): void {
    obj ? this.logger.info(obj, msg) : this.logger.info(msg);
  }

  warn(msg: string, obj?: object): void {
    obj ? this.logger.warn(obj, msg) : this.logger.warn(msg);
  }

  error(msg: string, err: Error): void {
    this.logger.error(err, msg);
  }
}
