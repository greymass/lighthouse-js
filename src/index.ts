import { serve } from "bun";
import { APIClient, PublicKey } from "@wharfkit/antelope";
import { ChainDefinition, Chains } from "@wharfkit/common";

const MAINNET_CHAINS = [
    Chains.EOS,
    Chains.Telos,
    Chains.WAX,
    Chains.Proton,
    Chains.Libre,
    Chains.UX,
    Chains.FIO,
    // Chains.Ayetu,
    // Chains.KOY,
];

const TESTNET_CHAINS = [
    Chains.TelosTestnet,
    Chains.WAXTestnet,
    Chains.ProtonTestnet,
    Chains.LibreTestnet,
    Chains.FIOTestnet,
    // Chains.UXTestnet,
    // Chains.AyetuTestnet,
    // Chains.KOYTestnet,
];

export const accountLookup = async (req: Request) => {
  const url = new URL(req.url);
  const key = url.pathname.split("/")[2];
  const includeTestnets = url.searchParams.get("includeTestnets") === "true";

  let publicKey: PublicKey;

  try {
    publicKey = PublicKey.from(key)
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid public key" }), { status: 400 });
  }

  const chains: ChainDefinition[] = includeTestnets ? [...MAINNET_CHAINS, ...TESTNET_CHAINS] : MAINNET_CHAINS;
  const lookups = await Promise.all(chains.map(chain => lookupNetwork(publicKey, chain)));

  const networkAccounts = lookups.map(({ chain, accounts }) => ({
    network: chain.name,
    chainId: chain.id,
    accounts,
  }));

  const totalAccounts = networkAccounts.reduce((total, { accounts }) => total + accounts.length, 0);
  console.log(`Found ${totalAccounts} auth(s) across ${networkAccounts.length} network(s)`);

  return new Response(JSON.stringify(networkAccounts));
};

export const lookupNetwork = async (publicKey: PublicKey, chain: ChainDefinition, apiClient?: APIClient) => {
  try {
    const accounts = await networkRequest(publicKey, chain, apiClient);
    return { chain, accounts };
  } catch (error) {
    console.warn(`Lookup error on ${chain.name}: ${error}`);
    return { chain, accounts: [] };;
  }
};

const networkRequest = async (publicKey: PublicKey, chain: ChainDefinition, apiClient?: APIClient) => {
  const client = apiClient || new APIClient(chain);
  const response = await client.v1.chain.get_accounts_by_authorizers({ keys: [publicKey] });
  return response.accounts.map((account: any) => ({
    accountName: account.account_name,
    permissionName: account.permission_name,
  }));
};

serve({
  fetch(req: Request) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/lookup")) {
      return accountLookup(req);
    }

    return new Response("💡🏠", { status: 200 });
  },
  port: 3000,
});
