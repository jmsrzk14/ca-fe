// Re-export everything from applicant_pb for compatibility.
// The service definition is now generated directly in applicant_pb.ts by protoc-gen-es v2.
export {
  ApplicantService,
  ApplicantSchema,
  ApplicantAttributeSchema,
  ApplicantAttributesSchema,
  CreateApplicantRequestSchema,
  GetApplicantRequestSchema,
  GetApplicantAttributesRequestSchema,
  UpdateApplicantRequestSchema,
  ListApplicantsRequestSchema,
  ListApplicantsResponseSchema,
  UpsertApplicantAttributesRequestSchema,
} from "./applicant_pb";

export type {
  Applicant,
  ApplicantAttribute,
  ApplicantAttributes,
  CreateApplicantRequest,
  GetApplicantRequest,
  GetApplicantAttributesRequest,
  UpdateApplicantRequest,
  ListApplicantsRequest,
  ListApplicantsResponse,
  UpsertApplicantAttributesRequest,
} from "./applicant_pb";
