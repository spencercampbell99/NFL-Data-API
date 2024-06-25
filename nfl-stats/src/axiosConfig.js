import axios from 'axios';
// import { getCookie } from 'cookies-next';

export default axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
  headers: {
    "Content-Type": "application/json",
    // "Authorization": 'Bearer ' + getCookie('access_token'),
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});