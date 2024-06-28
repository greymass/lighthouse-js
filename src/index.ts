import {serve} from 'bun'
import {API, APIClient, type PermissionLevelType, PublicKey} from '@wharfkit/antelope'
import {MAINNET_CHAINS, TESTNET_CHAINS} from './chains'
import type {Chain} from './types'

export const accountLookup = async (req: Request) => {
	const url = new URL(req.url)
	const key = url.pathname.split('/')[2]
	const includeTestnets = url.searchParams.get('includeTestnets') === 'true'

	let publicKey: PublicKey

	try {
		publicKey = PublicKey.from(key)
	} catch (error) {
		return new Response(JSON.stringify({error: 'Invalid public key'}), {status: 400})
	}

	const chains: Chain[] = includeTestnets
		? [...MAINNET_CHAINS, ...TESTNET_CHAINS]
		: MAINNET_CHAINS
	const lookups = (
		await Promise.all(chains.map((chain) => lookupNetwork(publicKey, chain)))
	).filter(({accounts}) => accounts.length > 0)

	const networkAccounts = lookups.map(({chain, accounts}) => ({
		network: chain.name,
		chainId: chain.id,
		accounts,
	}))

	return new Response(JSON.stringify(networkAccounts))
}

export const lookupNetwork = async (publicKey: PublicKey, chain: Chain, apiClient?: APIClient) => {
	try {
		const accounts = await networkRequest(publicKey, chain, apiClient)
		return {chain, accounts}
	} catch (error) {
		log(`Lookup error on ${chain.name}: ${error}`)
		return {chain, accounts: []}
	}
}

const networkRequest = (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	return new Promise((resolve, reject) => {
		const client = apiClient || new APIClient(chain)
		client.v1.chain
			.get_accounts_by_authorizers({
				keys: [publicKey],
			})
			.then((response: API.v1.AccountsByAuthorizers) => {
				resolve(
					response.accounts.map((account) => ({
						actor: account.account_name,
						permission: account.permission_name,
					}))
				)
			})
			.catch((error) => {
				reject(error)
			})
		setTimeout(() => {
			reject('Request timed out.')
		}, 1000)
	})
}

function log(message: string) {
	// eslint-disable-next-line no-console
	console.warn(message)
}

serve({
	fetch(req: Request) {
		const url = new URL(req.url)
		if (url.pathname.startsWith('/lookup')) {
			return accountLookup(req)
		}

		return new Response('💡🏠', {status: 200})
	},
	port: 3000,
})

log('Server running at http://localhost:3000/ 🚀')
