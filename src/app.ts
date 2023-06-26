import { program } from "commander";
import { init, reset, show } from "@commands/profile";
import { ProfileData } from "@lib/profileData";
import { create, commit, pull, push } from "@commands/collection";
import inquirer from "inquirer";
import { transferRoyalties } from "@commands/collection/transferRoyalties";
const { version } = require("../package.json");

interface ActionArgs {
  opts: any;
  context?: any;
  action: (...args: any[]) => void | Promise<void>;
}

async function startAction(args: ActionArgs) {
  const { action, opts, context } = args;
  return action(opts, context);
}

async function promptPin() {
  return inquirer.prompt<{ pin: string }>([
    {
      type: "password",
      message: "For this operation you need to enter your PIN",
      name: "pin",
    },
  ]);
}

async function withProfile(fn: (profile: ProfileData) => void | Promise<void>) {
  try {
    const { pin } = await promptPin();
    const profileData = await ProfileData.load(pin);
    return fn(profileData);
  } catch (e: any) {
    console.warn(
      "Could not load the profile. Is your PIN correct? Did you initialize your Profile with [profile init]?"
    );
  }
}

const app = program.version(version).description(`
            @@@@@@@@  @@@@@@@           
         @@@@@    @@@@@    @@@@@        
           @@@  @@@  @@@ @@@@@          
    @@@      @@@@@     @@@@       @@@   
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@ 
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@  
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@ 
    @@@       @@@@     @@@@@      @@@   
           @@@@  @@@  @@@  @@@          
         @@@@@    @@@@@    @@@@@        
            @@@@@@@  @@@@@@@@    
 
         SignumArt Mass Upload Tool          
      
  Author: ohager
  Version: ${version}
  `);

const profile = program.command("profile");

profile
  .command("show")
  .description("Shows the current Profile")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: show,
      })
    )
  );

profile
  .command("init")
  .alias("create")
  .description("Configures a Profile")
  .action((opts) =>
    startAction({
      opts,
      action: init,
    })
  );

profile
  .command("reset")
  .alias("remove")
  .description("Resets the Profile")
  .action((opts) =>
    startAction({
      opts,
      action: reset,
    })
  );

const collection = program.command("collection");

collection
  .command("create")
  .alias("init")
  .option(
    "-t, --try",
    "Runs without creating anything on chain. Good for testing purposes"
  )
  .description("Creates a new Collection")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: create,
      })
    )
  );

collection
  .command("pull")
  .alias("continue")
  .description(
    "Pulls existing collection information to continue on adding new NFTs"
  )
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: pull,
      })
    )
  );

collection
  .command("commit")
  .alias("prepare")
  .option("-t, --try", "Validates the CSV file without generating artifacts")
  .description("Prepares the collection for upload")
  .action((opts) =>
    startAction({
      opts,
      action: commit,
    })
  );

collection
  .command("push")
  .alias("upload")
  .option(
    "-t, --try",
    "Runs without creating anything on chain. Good for testing"
  )
  .description("Uploads the collection")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: push,
      })
    )
  );

collection
  .command("transfer-royalties")
  .option(
    "-t, --try",
    "Runs without creating anything on chain. Good for testing"
  )
  .description("Transfers the royalties to a new owner")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: transferRoyalties,
      })
    )
  );
export { app };
