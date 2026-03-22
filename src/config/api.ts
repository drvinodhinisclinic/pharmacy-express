// Centralized API configuration
// All base URLs and dynamic endpoints are driven by environment variables.
// Update values in .env (prefixed with VITE_) — no hardcoding needed.

const config = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://192.168.0.104:3000',
  endpoints: {
    pharmaSearch: '/api/pharma/search',
    pharmaBill: '/api/pharma/billed',
    patientSearch: '/api/patients/search',
    locations: '/api/productmgmt/locations',
    doctors: '/api/doctors',
    prescriptions: '/prescriptions',
    recordedByUsers: import.meta.env.VITE_RECORDED_BY_API || '/api/config/recorded-by-users',
  },
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
};

export function getUrl(endpoint: keyof typeof config.endpoints): string {
  return `${config.baseUrl}${config.endpoints[endpoint]}`;
}

export default config;
