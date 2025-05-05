// Allowed Origins
const allowedOrigins = [
	process.env.PROD_MODE,
	process.env.DEV_MODE,
	process.env.NODE_API,
	process.env.RENDER_API,
	process.env.VERCEL_URL,
	process.env.VERCEL_URL_DEVELOPMENT,
].filter(Boolean);


module.exports = {allowedOrigins};