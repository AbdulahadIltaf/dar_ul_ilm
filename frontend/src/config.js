// Central API configuration
// In production (Vercel), set VITE_API_URL in your Vercel environment variables
// to point to your deployed backend (e.g. https://your-backend.onrender.com)
// Locally it defaults to http://localhost:8000

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_BASE_URL;
