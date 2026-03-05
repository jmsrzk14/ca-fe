import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { createPromiseClient, Interceptor } from "@connectrpc/connect";
import { ApplicationService } from "../../gen/application/v1/application_connect";
import { ApplicantService } from "../../gen/applicant/v1/applicant_connect";

function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

const authInterceptor: Interceptor = (next) => async (req) => {
    const token = getAccessTokenFromCookie();
    if (token) {
        req.header.set("Authorization", `Bearer ${token}`);
    }
    return next(req);
};

// Empty baseUrl: requests go through Next.js rewrites proxy, avoiding CORS.
export const transport = createGrpcWebTransport({
    baseUrl: "",
    interceptors: [authInterceptor],
});

export const applicationClient = createPromiseClient(ApplicationService, transport);
export const applicantClient = createPromiseClient(ApplicantService, transport);
