import { createConnectTransport } from "@connectrpc/connect-web";
import { APP_CONFIG } from "../constants";

export const transport = createConnectTransport({
    baseUrl: APP_CONFIG.API_BASE_URL,
});
