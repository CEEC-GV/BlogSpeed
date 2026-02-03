import axios from "axios";
//import appId from "../config/auth.txt?raw";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true 
});





export default api;
