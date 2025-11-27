import axios from "axios";

const instanceId = process.env.ZAPI_INSTANCE_ID;
const token = process.env.ZAPI_TOKEN;
const clientToken = process.env.ZAPI_CLIENT_TOKEN;
const baseURL = process.env.ZAPI_BASE_URL;

export const zapi = axios.create({
    baseURL: `${baseURL}/instances/${instanceId}/token/${token}`,
    headers: {
        "Content-Type": "application/json",
        "client-token": clientToken || "",
    },
});
