import { assert } from 'chai';
import sinon from 'sinon';
import { PublicKey } from "@wharfkit/antelope";
import { Chains } from "@wharfkit/common";
import { accountLookup, lookupNetwork, chainLookup } from '../src/index';
import { makeClient } from '@wharfkit/mock-data';

const TEST_PUBLIC_KEY = 'EOS6KybFkAb54UMSvHoj4BMGTKPd21GEw3HUCoB5uc1vabr63qYrV'

const mockClient = makeClient('https://jungle4.greymass.com');

describe("accountLookup", () => {
  let lookupNetworkStub: sinon.SinonStub;

  beforeEach(() => {
    lookupNetworkStub = sinon.stub(global, 'lookupNetwork');
  });

  afterEach(() => {
    lookupNetworkStub.restore();
  });

  it("should return 400 for invalid public key", async () => {
    const req = new Request("http://localhost/lookup/invalidKey");
    const res = await accountLookup(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, "Invalid public key");
  });

  it("should lookup accounts for a valid public key with mocked lookupNetwork", async () => {
    const mockResult = {
      chain: Chains.EOS,
      accounts: [
        {
          accountName: 'mockaccount',
          permissionName: 'active',
        }
      ]
    };

    lookupNetworkStub.resolves(mockResult);

    const req = new Request(`http://localhost/lookup/${TEST_PUBLIC_KEY}`);
    const res = await accountLookup(req);
    
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.isArray(json);
    assert.lengthOf(json, 1);
    assert.deepEqual(json[0].accounts[0], { accountName: 'mockaccount', permissionName: 'active' });
  });
});

describe("lookupNetwork", () => {
  it("should handle network lookup", async () => {
    const publicKey = PublicKey.from(TEST_PUBLIC_KEY);
    const chain = Chains.EOS;
    
    const result = await lookupNetwork(publicKey, chain, mockClient);
    assert.containsAllKeys(result, ['chain', 'accounts']);
    assert.equal(result.chain.name, chain.name);
    assert.isArray(result.accounts);
  });
});

describe("chainLookup", () => {
  it("should lookup accounts on the chain", async () => {
    const publicKey = PublicKey.from(TEST_PUBLIC_KEY);
    const chain = Chains.EOS;

    const accounts = await chainLookup(publicKey, chain, mockClient);
    assert.isArray(accounts);
    accounts.forEach(account => {
      assert.containsAllKeys(account, ['accountName', 'permissionName']);
    });
  });
});
