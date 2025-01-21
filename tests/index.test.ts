import {assert} from 'chai'
import {PublicKey} from '@wharfkit/antelope'
import {Chains} from '@wharfkit/common'
import {lookupNetwork} from '../src/lib/lookup'
import {makeClient} from '@wharfkit/mock-data'

const PUBLIC_KEY = 'EOS65BFgzcH8uZW837HqadGcREfNViBV6Fqc1LsmwcWdfUCayHQzf'
const NON_EXISTENT_PUBLIC_KEY = 'EOS8hiZaTNknE75KH2UmBNqcVFN4u3vgJ8PcytevjygaJ6aGWfb7U'

const mockClient = makeClient('https://jungle4.greymass.com')

describe('lookupNetwork', () => {
	it('should handle network lookup', async () => {
		const publicKey = PublicKey.from(PUBLIC_KEY)
		const chain = Chains.Jungle4

		const result = await lookupNetwork(publicKey, Chains.Jungle4, mockClient)
		assert.containsAllKeys(result, ['chain', 'accounts'])
		assert.equal(result.chain.name, chain.name)
		assert.equal(result.accounts.length, 2)
		assert.deepEqual(String(result.accounts[0].actor), 'testerman123')
	})

	it('should handle network lookup with non existent public key', async () => {
		const publicKey = PublicKey.from(NON_EXISTENT_PUBLIC_KEY)
		const chain = Chains.Jungle4

		const result = await lookupNetwork(publicKey, chain, mockClient)
		assert.containsAllKeys(result, ['chain', 'accounts'])
		assert.equal(result.chain.name, chain.name)
		assert.equal(result.accounts.length, 0)
	})

	it('should handle network lookup error', async () => {
		const publicKey = PublicKey.from(PUBLIC_KEY)
		const chain = Chains.Jungle4

		const result = await lookupNetwork(
			publicKey,
			chain,
			makeClient('https://jungle0.greymass.com')
		)
		assert.containsAllKeys(result, ['chain', 'accounts'])
		assert.equal(result.chain.name, chain.name)
		assert.equal(result.accounts.length, 0)
	})
})
