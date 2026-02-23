import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { createPromiseClient } from "@connectrpc/connect";
import { APP_CONFIG } from "../constants";
import { ApplicationService } from "../../gen/application/v1/application_connect";
import { ApplicantService } from "../../gen/applicant/v1/applicant_connect";

export const transport = createGrpcWebTransport({
    baseUrl: APP_CONFIG.API_BASE_URL,
});

export const applicationClient = createPromiseClient(ApplicationService, transport);
export const applicantClient = createPromiseClient(ApplicantService, transport);
