import axios from "axios";
import store from "../redux/store";
import {
  KEY_ACCESS_TOKEN,
  getItem,
  removeItem,
  setItem,
} from "./localStorageManager";
import { setLoading, showToast } from "../redux/slices/appConfigSlice";
import { TOAST_FAILURE } from "../App";
export const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL,
  withCredentials: true, //tells Axios to send any cookies associated with the domain of the request
});

axiosClient.interceptors.request.use((request) => {
  const accessToken = getItem(KEY_ACCESS_TOKEN);
  request.headers["Authorization"] = `Bearer ${accessToken}`;
  store.dispatch(setLoading(true))
  return request;
});

axiosClient.interceptors.response.use(
  async (response) => {
        store.dispatch(setLoading(false));

    const data = response.data; // this will return response from the server
    if (data.status === "ok") {
      return data;
    }

    const originalRequest = response.config;
    const statusCode = data.statusCode;
    const error = data.message;
    store.dispatch(
      showToast({
        type: TOAST_FAILURE,
        message: error,
      })
    );
    if (statusCode === 401) {
      const response = await axios
        .create({
          withCredentials: true, //tells Axios to send any cookies associated with the domain of the request
        })
        .get(`${process.env.REACT_APP_SERVER_BASE_URL}/auth/refresh`);
      if (response.data.status === "ok") {
        setItem(KEY_ACCESS_TOKEN, response.data.result.accessToken);

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${response.data.result.accessToken}`;
        return axios(originalRequest);
      } else {
        removeItem(KEY_ACCESS_TOKEN);
        window.location.replace("/login", "_self"); //this is javascript function
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
  async (error) => {
        store.dispatch(setLoading(false));

    store.dispatch(
      showToast({
        type: TOAST_FAILURE,
        message: error.message,
      })
    );
    return Promise.reject(error);
  }
);
