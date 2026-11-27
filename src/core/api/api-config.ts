import { Platform } from "react-native";

const LOCAL_BACKEND_PORT = 3000;

const getBaseURL = () => {
  
    return `http://localhost:${LOCAL_BACKEND_PORT}`;
};

export const API_BASE_URL = getBaseURL();