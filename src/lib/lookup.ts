import {APIClient} from '@wharfkit/antelope'
import type {PublicKey} from '@wharfkit/antelope'
import type {PermissionLevelType} from '@wharfkit/antelope'
import type {Chain} from './chains'
import {logger} from './utils/logger'

// Keep chain lookup timeout behavior aligned with previous production behavior.
const CHAIN_LOOKUP_TIMEOUT_MS = 2000

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	const timeoutPromise = new Promise<T>((_resolve, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error('Request timed out.'))
		}, timeoutMs)
	})

	try {
		return await Promise.race([promise, timeoutPromise])
	} finally {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
	}
}

const chainLookup = async (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	const client = apiClient || new APIClient(chain)
	const response = await withTimeout(
		client.v1.chain.get_accounts_by_authorizers({
			keys: [publicKey],
		}),
		CHAIN_LOOKUP_TIMEOUT_MS
	)

	return response.accounts.map((account) => ({
		actor: account.account_name,
		permission: account.permission_name,
	}))
}

export const networkRequest = async (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	return await chainLookup(publicKey, chain, apiClient)
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
