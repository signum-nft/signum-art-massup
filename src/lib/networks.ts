import { Ledger, LedgerClientFactory } from "@signumjs/core";
export const Networks = [
  {
    name: "Signum Main Net",
    hosts: [
      "https://europe.signum.network",
      "https://localhost:8125",
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
    hosts: ["https://europe3.testnet.signum.network", "https://localhost:6876"],
  },
];

function getNetworkHosts(networkName: string): string[] {
  const found = Networks.find((n) => n.name === networkName);
  if (!found) {
    throw new Error(`Unsupported Network Name: ${networkName}`);
  }
  return found.hosts;
}

export const createNetworkClient = async (
  networkName: string
): Promise<Ledger> => {
  const hosts = getNetworkHosts(networkName);
  const ledger = LedgerClientFactory.createClient({
    nodeHost: hosts[0],
    reliableNodeHosts: hosts,
  });
  await ledger.service.selectBestHost(true);
  return ledger;
};
