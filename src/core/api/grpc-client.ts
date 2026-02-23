import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { APP_CONFIG } from "../constants";

export const transport = createGrpcWebTransport({
    baseUrl: "/api/grpc",
});
