import {APIClient} from '@wharfkit/antelope'
import type {API, PublicKey} from '@wharfkit/antelope'
import type {PermissionLevelType} from '@wharfkit/antelope'
import type {Chain} from './chains'
import {logger} from './utils/logger'

export const networkRequest = (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	return new Promise((resolve, reject) => {
		const client = apiClient || new APIClient(chain)

		const timeoutId = setTimeout(() => {
			reject(new Error('Request timed out.'))
		}, 2000)

		client.v1.chain
			.get_accounts_by_authorizers({
				keys: [publicKey],
			})
			.then((response: API.v1.AccountsByAuthorizers) => {
				clearTimeout(timeoutId)
				resolve(
					response.accounts.map((account) => ({
						actor: account.account_name,
						permission: account.permission_name,
					}))
				)
			})
			.catch((error) => {
				clearTimeout(timeoutId)
				reject(error)
			})
	})
}

export const lookupNetwork = async (publicKey: PublicKey, chain: Chain, apiClient?: APIClient) => {
	try {
		const accounts = await networkRequest(publicKey, chain, apiClient)
		return {chain, accounts}
	} catch (error) {
		logger.warn(`Lookup error on ${chain.name}: ${error}`)
		return {chain, accounts: [], error: `Lookup error: ${error}`}
	}
}
