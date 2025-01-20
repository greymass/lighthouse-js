import type {ChainDefinition} from '@wharfkit/common'

export type Chain =
	| ChainDefinition
	| {
			id: string
			name: string
			url: string
	  }
