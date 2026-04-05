// Allowed Origins
const allowedOrigins = [
    // Existing origins
    "http://localhost:5173",
    "http://localhost:4173", 
    "http://localhost:8201",
    "https://server-32bo.onrender.com",
    "https://client-qqq1.vercel.app",
    
    // Add React Native Web origins
    "http://localhost:8081",     // React Native Web default
    "http://localhost:19006",    // Expo Web default
    "http://localhost:19000",    // Expo Metro bundler
    "http://localhost:19001",    // Expo Metro alternative
    "http://127.0.0.1:8081",     // Localhost alternative
    
    // For physical devices (replace with your actual IP)
    "http://192.168.1.100:8081", // Your computer's IP - UPDATE THIS
    
    // For Expo Go app (native)
    "exp://localhost:19000",
    "exp://127.0.0.1:19000",

];

module.exports = {allowedOrigins};
// process.env.PROD_MODE,
// process.env.DEV_MODE,
// process.env.NODE_API,
// process.env.RENDER_API,
// process.env.VERCEL_URL,
// process.env.VERCEL_URL_DEVELOPMENT,
