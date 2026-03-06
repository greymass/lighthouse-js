import {APIClient} from '@wharfkit/antelope'
import type {PublicKey} from '@wharfkit/antelope'
import type {PermissionLevelType} from '@wharfkit/antelope'
import type {Chain} from './chains'
import {logger} from './utils/logger'

const CHAIN_LOOKUP_UNSUPPORTED = new Set([
	'21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c',
	'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e',
])

// Keep timeout behavior aligned with the Swift Lighthouse implementation.
const CHAIN_LOOKUP_TIMEOUT_MS = 2000
const HISTORY_KEY_ACCOUNTS_TIMEOUT_MS = 5000
const HISTORY_GET_ACCOUNT_TIMEOUT_MS = 5000

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

const chainLookupSupport = (chain: Chain): boolean =>
	!CHAIN_LOOKUP_UNSUPPORTED.has(String(chain.id))

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

const historyLookup = async (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	const client = apiClient || new APIClient(chain)
	const targetKey = String(publicKey)

	const keyAccountsResponse = await withTimeout(
		client.v1.history.get_key_accounts(publicKey),
		HISTORY_KEY_ACCOUNTS_TIMEOUT_MS
	)

	const accountNames =
		keyAccountsResponse.account_names ||
		(keyAccountsResponse as unknown as {accountNames?: string[]}).accountNames ||
		[]

	const resolved = await Promise.all(
		accountNames.map((accountName) =>
			withTimeout(
				client.v1.chain.get_account(accountName),
				HISTORY_GET_ACCOUNT_TIMEOUT_MS
			).catch(() => null)
		)
	)

	const accounts: PermissionLevelType[] = []
	for (const account of resolved) {
		if (!account) {
			continue
		}

		for (const permission of account.permissions) {
			const keys = permission.required_auth?.keys || []
			const hasPermission = keys.some(
				(keyPermission) => String(keyPermission.key) === targetKey
			)
			if (hasPermission) {
				accounts.push({
					actor: account.account_name,
					permission: permission.perm_name,
				})
			}
		}
	}

	return accounts
}

export const networkRequest = async (
	publicKey: PublicKey,
	chain: Chain,
	apiClient?: APIClient
): Promise<PermissionLevelType[]> => {
	if (chainLookupSupport(chain)) {
		try {
			return await chainLookup(publicKey, chain, apiClient)
		} catch (error) {
			logger.warn(
				`Chain lookup error on ${chain.name}: ${error}, falling back to history API`
			)
		}
	}

	return await historyLookup(publicKey, chain, apiClient)
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
