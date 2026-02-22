import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { APP_CONFIG } from "../constants";

export const transport = createGrpcWebTransport({
    baseUrl: APP_CONFIG.API_BASE_URL,
});
