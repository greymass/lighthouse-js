import type {Handle} from '@sveltejs/kit'

export const handle: Handle = async ({event, resolve}) => {
	// Apply CORS headers to all responses
	const response = await resolve(event)

	// Set CORS headers
	response.headers.set('Access-Control-Allow-Origin', '*')
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

	// Handle OPTIONS preflight requests
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		})
	}

	return response
}
