// Central API configuration
// In production (Vercel), both the frontend and backend are on the same domain.
// So we use an empty string as the base URL, making all API calls relative (e.g. /api/courses).
// In local development, the FastAPI backend runs separately on localhost:8000.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default API_BASE_URL;
