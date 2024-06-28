import { assert } from 'chai';
import { PublicKey } from "@wharfkit/antelope";
import { Chains } from "@wharfkit/common";
import { lookupNetwork, accountLookup } from '../src/index';
import { makeClient } from '@wharfkit/mock-data';

const PUBLIC_KEY = 'EOS65BFgzcH8uZW837HqadGcREfNViBV6Fqc1LsmwcWdfUCayHQzf'
const NON_EXISTENT_PUBLIC_KEY = 'EOS8hiZaTNknE75KH2UmBNqcVFN4u3vgJ8PcytevjygaJ6aGWfb7U'
const BAD_PUBLIC_KEY = 'EOS6KybFkAb54UMSvHoj4BMGTKPd21GEw3HUCoB5uc1vabasasqYrV'

const mockClient = makeClient('https://jungle4.greymass.com');

describe("accountLookup", () => {
  it("should handle case where bad public key is provided", async () => {
    const req = new Request(`https://lighthouse.greymass.com/lookup/${BAD_PUBLIC_KEY}`);
    const result = await accountLookup(req);
    assert.equal(result.status, 400);
  })

  it("should handle case where no public key is provided", async () => {
    const req = new Request(`https://lighthouse.greymass.com/lookup/`);
    const result = await accountLookup(req);
    assert.equal(result.status, 400);
  })
});

describe("lookupNetwork", () => {
  it("should handle network lookup", async () => {
    const publicKey = PublicKey.from(PUBLIC_KEY);
    const chain = Chains.EOS;
    
    const result = await lookupNetwork(publicKey, chain, mockClient);
    assert.containsAllKeys(result, ['chain', 'accounts']);
    assert.equal(result.chain.name, chain.name);
    assert.equal(result.accounts.length, 2);
    assert.deepEqual(String(result.accounts[0].accountName), "testerman123");
  });

  it("should handle network lookup with non existent public key", async () => {
    const publicKey = PublicKey.from(NON_EXISTENT_PUBLIC_KEY);
    const chain = Chains.EOS;
    
    const result = await lookupNetwork(publicKey, chain, mockClient);
    assert.containsAllKeys(result, ['chain', 'accounts']);
    assert.equal(result.chain.name, chain.name);
    assert.equal(result.accounts.length, 0);
  });
});
