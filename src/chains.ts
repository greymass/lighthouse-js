import {Chains} from '@wharfkit/common'

const AYETU_MAINNET = {
	id: '9b06067cf9f0a293e854cbdbcf4bc0292bbf1137dd01d3d9300f403706444504',
	name: 'Ayetu',
	url: 'https://mainnet.ayetu.net',
}

const KOY_MAINNET = {
	id: 'adf3860dc671acafa2e4ce7ab4fd90920a487e8e82a36e8b4364aad5129552cd',
	name: 'KOY',
	url: 'https://api.mainnet.koynetwork.io',
}

const AYETU_TESTNET = {
	id: '38b20c9055b39035eaee7fdf450ce9b2572024bcc6d4ee8cddd50662a0cdeff1',
	name: 'Ayetu (Testnet)',
	url: 'https://testnet.ayetu.net',
}

const KOY_TESTNET = {
	id: '181e289803751d4e0fc257fd186edaa6df8169e28631f1bf63fc9287a80cfb5f',
	name: 'KOY (Testnet)',
	url: 'https://api.testnet.koynetwork.io',
}

export const MAINNET_CHAINS = [
	Chains.EOS,
	Chains.Telos,
	Chains.WAX,
	Chains.Proton,
	Chains.Libre,
	Chains.UX,
	Chains.FIO,
	AYETU_MAINNET,
	KOY_MAINNET,
]

export const TESTNET_CHAINS = [
	Chains.TelosTestnet,
	Chains.WAXTestnet,
	Chains.LibreTestnet,
	Chains.FIOTestnet,
	Chains.Jungle4,
	AYETU_TESTNET,
	KOY_TESTNET,
]
