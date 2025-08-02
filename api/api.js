import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_baseURL || "http://shef-admin.test";

const api = axios.create({baseURL});

export {api};
