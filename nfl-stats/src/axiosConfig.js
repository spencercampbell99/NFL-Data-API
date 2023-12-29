import axios from 'axios';
// import { getCookie } from 'cookies-next';

export default axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    // "Authorization": 'Bearer ' + getCookie('access_token'),
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});