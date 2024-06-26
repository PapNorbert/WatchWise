import axios from 'axios'

export const serverUrl = 'http://localhost:3000';

export default axios.create({
  baseURL: serverUrl,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true
});
