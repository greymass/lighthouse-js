import {API, APIClient, type PermissionLevelType, PublicKey} from '@wharfkit/antelope'
import {MAINNET_CHAINS, TESTNET_CHAINS} from '$lib/chains'
import type {Chain} from '$lib/types'
import type {RequestEvent} from '@sveltejs/kit'
import {error, json} from '@sveltejs/kit'

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

const lookupNetwork = async (publicKey: PublicKey, chain: Chain, apiClient?: APIClient) => {
	try {
		const accounts = await networkRequest(publicKey, chain, apiClient)
		return {chain, accounts}
	} catch (error) {
		console.warn(`Lookup error on ${chain.name}: ${error}`)
		return {chain, accounts: []}
	}
}

export const GET = async ({params, url}: RequestEvent) => {
	const {publicKey} = params
	const includeTestnets = url.searchParams.get('includeTestnets') === 'true'

	if (!publicKey) {
		throw error(400, {message: 'Public key is required'})
	}

	try {
		const key = PublicKey.from(publicKey)
		const chains: Chain[] = includeTestnets
			? [...MAINNET_CHAINS, ...TESTNET_CHAINS]
			: MAINNET_CHAINS

		const lookups = (
			await Promise.all(chains.map((chain) => lookupNetwork(key, chain)))
		).filter(({accounts}) => accounts.length > 0)

		const networkAccounts = lookups.map(({chain, accounts}) => ({
			network: chain.name,
			chainId: chain.id,
			accounts,
		}))

		return json(networkAccounts)
	} catch (err) {
		console.error(err)
		throw error(400, {message: 'Invalid public key'})
	}
}
