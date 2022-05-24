import { app } from "./app";

(async () => {
  try {
    await app.parseAsync(process.argv);
  } catch (e: any) {
    console.error(
      "❌ Damn, something failed - Check the log files for more details"
    );
    process.exit(-1);
  }
})();
