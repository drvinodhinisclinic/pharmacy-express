// Centralized API configuration
// Update baseUrl to point to your API server

const config = {
  baseUrl: 'https://192.168.0.104:3000',
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
