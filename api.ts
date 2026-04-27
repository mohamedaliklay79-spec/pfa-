// api.ts
const isEmulator = false;

export const API_URL = isEmulator
  ? 'http://10.0.2.2:3000'
  : 'https://backend-g3qj.onrender.com';