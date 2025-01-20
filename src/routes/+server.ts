import {json} from '@sveltejs/kit'
import type {RequestEvent} from '@sveltejs/kit'

export const GET = async ({}: RequestEvent) => {
	return json({
		message: '💡🏠 Lighthouse API',
		endpoints: {
			lookup: '/lookup/:publicKey?includeTestnets=true|false',
		},
	})
}
