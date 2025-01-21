import {json} from '@sveltejs/kit'

export const GET = async () => {
	return json({
		message: '💡🏠 Lighthouse API',
		endpoints: {
			lookup: '/lookup/:publicKey?includeTestnets=true|false',
		},
	})
}
