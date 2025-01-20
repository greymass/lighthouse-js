import {PublicKey} from '@wharfkit/antelope'
import {MAINNET_CHAINS, TESTNET_CHAINS} from '$lib/chains'
import type {Chain} from '$lib/types'
import type {RequestEvent} from '@sveltejs/kit'
import {error, json} from '@sveltejs/kit'
import {lookupNetwork} from '$lib/lookup'

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
