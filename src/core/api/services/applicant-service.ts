import { createClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicantService } from "@/gen/applicant/v1/applicant_pb";

const client = createClient(ApplicantService, transport);

export const applicantService = {
    create: async (data: any) => {
        // Map any fields if necessary, though ideally the caller should be updated
        const response = await client.createApplicant({
            headType: data.applicantType || data.headType,
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
            })) || [],
        });
        return response;
    },

    getById: (id: string) =>
        client.getApplicant({ id }),

    update: (id: string, data: any) =>
        client.updateApplicant({
            id,
            headType: data.applicantType || data.headType,
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
            })) || [],
        }),

    list: async (params?: Record<string, string>) => {
        const response = await client.listApplicants({
            cursor: params?.cursor || "",
        });

        // Map back to existing UI structure/types to avoid breaking components
        return {
            applicants: response.applicants.map((app: any) => ({
                ...app,
                applicantType: app.headType, // Map headType back to applicantType
            })),
            nextCursor: response.nextCursor,
        };
    },

    upsertAttribute: (applicantId: string, attribute: any) =>
        client.upsertApplicantAttributes({
            applicantId,
            attributes: [{
                key: attribute.key,
                value: attribute.value,
                dataType: attribute.dataType,
            }],
        }),
};
