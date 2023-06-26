import { Ledger, LedgerClientFactory } from "@signumjs/core";

export const Networks = [
  {
    name: "Signum Main Net",
    hosts: [
      "https://europe.signum.network",
      "https://europe1.signum.network",
      "https://europe2.signum.network",
      "https://latam.signum.network",
      "https://us-east.signum.network",
      "https://brazil.signum.network",
      "https://signapore.signum.network",
      "https://australia.signum.network",
    ],
  },
  {
    name: "Signum Test Net",
    hosts: ["https://europe3.testnet.signum.network"],
  },
];

function getNetworkHosts(networkName: string): string[] {
  const found = Networks.find((n) => n.name === networkName);
  if (!found) {
    throw new Error(`Unsupported Network Name: ${networkName}`);
  }
  return found.hosts;
}

async function tryGetLocalHosts(networkName: string) {
  const localHost =
    networkName === "Signum Test Net"
      ? "http://localhost:6876"
      : "http://localhost:8125";
  const client = LedgerClientFactory.createClient({
    nodeHost: localHost,
  });
  await client.network.getNetworkInfo();
  return client;
}

export const createNetworkClient = async (
  networkName: string
): Promise<Ledger> => {
  let ledger: Ledger;
  try {
    ledger = await tryGetLocalHosts(networkName);
  } catch (_) {
    const hosts = getNetworkHosts(networkName);
    ledger = LedgerClientFactory.createClient({
      nodeHost: hosts[0],
      reliableNodeHosts: hosts,
    });
    // this is not really reliable...
    await ledger.service.selectBestHost(true);
  }
  return ledger;
};
