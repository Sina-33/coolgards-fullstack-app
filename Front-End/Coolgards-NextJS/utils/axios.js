import axios from "axios";

export const ax = axios.create({
        withCredentials: true,
    }
);