# API Reference

All endpoints are defined as Protocol Buffer services. Each service supports both gRPC (port 9001) and HTTP/gRPC-Web (port 8001).

## 1. Applicant Service

| Method | HTTP | Path |
|--------|------|------|
| ListApplicants | GET | `/v1/applicants` |
| CreateApplicant | POST | `/v1/applicants` |
| GetApplicant | GET | `/v1/applicants/{id}` |
| UpdateApplicant | PUT | `/v1/applicants/{id}` |
| GetApplicantAttributes | GET | `/v1/applicants/{applicant_id}/attributes` |
| UpsertApplicantAttributes | POST | `/v1/applicants/{applicant_id}/attributes` |
| AddApplicantParty | POST | `/v1/applicants/{applicant_id}/parties` |
| UpdateApplicantParty | PUT | `/v1/applicants/{applicant_id}/parties/{party_id}` |
| RemoveApplicantParty | DELETE | `/v1/applicants/{applicant_id}/parties/{party_id}` |
| ListApplicantParties | GET | `/v1/applicants/{applicant_id}/parties` |

**Key Types:**
- `Applicant`: id, full_name, identity_number, tax_id, type (PERSONAL/CORPORATE), phone, email, address, province_code, city_code
- `ApplicantAttribute`: attribute_code, value, choice_id

## 2. Application Service

| Method | HTTP | Path |
|--------|------|------|
| CreateApplication | POST | `/v1/applications` |
| GetApplication | GET | `/v1/applications/{id}` |
| ListApplications | GET | `/v1/applications` |
| UpdateApplication | PUT | `/v1/applications/{id}` |
| GetApplicationAttributes | GET | `/v1/applications/{application_id}/attributes` |
| UpsertApplicationAttributes | POST | `/v1/applications/{application_id}/attributes` |
| ChangeApplicationStatus | PUT | `/v1/applications/{id}/status` |

### Party Sub-service

| Method | HTTP | Path |
|--------|------|------|
| AddPartyToApplication | POST | `/v1/applications/{application_id}/parties` |
| RemovePartyFromApplication | DELETE | `/v1/applications/{application_id}/parties/{party_id}` |
| ListApplicationParties | GET | `/v1/applications/{application_id}/parties` |

**Key Types:**
- `Application`: id, applicant_id, product_code, branch_code, loan_officer_code, amount, tenor, interest_rate, purpose, status

## 3. Reference Service

| Method | HTTP | Path |
|--------|------|------|
| ListLoanProducts | GET | `/v1/reference/loan-products` |
| GetLoanProduct | GET | `/v1/reference/loan-products/{id}` |
| ListBranches | GET | `/v1/reference/branches` |
| ListLoanOfficers | GET | `/v1/reference/branches/{branch_code}/officers` |
| ListApplicationStatuses | GET | `/v1/reference/application-statuses` |
| ListFinancialGLAccounts | GET | `/v1/reference/gl-accounts` |
| ListAttributeCategories | GET | `/v1/reference/attribute-categories` |
| GetAttributeCategory | GET | `/v1/reference/attribute-categories/{category_code}` |
| CreateAttributeCategory | POST | `/v1/reference/attribute-categories` |
| UpdateAttributeCategory | PUT | `/v1/reference/attribute-categories/{category_code}` |
| DeleteAttributeCategory | DELETE | `/v1/reference/attribute-categories/{category_code}` |
| ListAttributeRegistry | GET | `/v1/reference/attribute-registry` |
| ListAttributeRegistryByCategory | GET | `/v1/reference/attribute-registry/by-category/{category_code}` |
| CreateAttributeRegistry | POST | `/v1/reference/attribute-registry` |
| UpdateAttributeRegistry | PUT | `/v1/reference/attribute-registry/{attribute_code}` |
| DeleteAttributeRegistry | DELETE | `/v1/reference/attribute-registry/{id}` |
| ListSurveyTemplates | GET | `/v1/reference/survey-templates` |
| ListProvinces | GET | `/v1/reference/provinces` |
| ListCities | GET | `/v1/reference/cities` |

## 4. Survey Service

| Method | HTTP | Path |
|--------|------|------|
| AssignSurvey | POST | `/v1/applications/{application_id}/surveys` |
| GetSurvey | GET | `/v1/surveys/{id}` |
| ListSurveysByApplication | GET | `/v1/applications/{application_id}/surveys` |
| ListSurveys | GET | `/v1/surveys` |
| StartSurvey | PUT | `/v1/surveys/{id}/start` |
| SubmitSurvey | PUT | `/v1/surveys/{id}/submit` |
| VerifySurvey | PUT | `/v1/surveys/{id}/verify` |
| SubmitSurveyAnswer | POST | `/v1/surveys/{survey_id}/answers` |
| UploadSurveyEvidence | POST | `/v1/surveys/{survey_id}/evidences` |
| GetSurveyTemplate | GET | `/v1/survey-templates/{id}` |
| ListSurveyTemplates | GET | `/v1/survey-templates` |
| CreateSurveyTemplate | POST | `/v1/survey-templates` |
| CreateSurveySection | POST | `/v1/survey-templates/{template_id}/sections` |
| CreateSurveyQuestion | POST | `/v1/sections/{section_id}/questions` |
| CreateSurveyQuestionOption | POST | `/v1/questions/{question_id}/options` |
| ListSurveySections | GET | `/v1/survey-templates/{template_id}/sections` |
| ListSurveyQuestions | GET | `/v1/sections/{section_id}/questions` |

**Survey Workflow:** ASSIGNED → IN_PROGRESS → SUBMITTED → VERIFIED

## 5. Financial Service

| Method | HTTP | Path |
|--------|------|------|
| UpsertFinancialFact | POST | `/v1/applications/{application_id}/financial-facts` |
| ListFinancialFacts | GET | `/v1/applications/{application_id}/financial-facts` |
| AddAsset | POST | `/v1/applications/{application_id}/assets` |
| UpdateAsset | PUT | `/v1/applications/{application_id}/assets/{id}` |
| ListAssetsByApplication | GET | `/v1/applications/{application_id}/assets` |
| AddLiability | POST | `/v1/applications/{application_id}/liabilities` |
| UpdateLiability | PUT | `/v1/applications/{application_id}/liabilities/{id}` |
| ListLiabilitiesByApplication | GET | `/v1/applications/{application_id}/liabilities` |
| CalculateFinancialRatios | POST | `/v1/applications/{application_id}/financial-ratios/calculate` |

## 6. Decision Service

### Committee Sub-service

| Method | HTTP | Path |
|--------|------|------|
| CreateCommitteeSession | POST | `/v1/committee/sessions` |
| GetCommitteeSession | GET | `/v1/committee/sessions/{id}` |
| SubmitCommitteeVote | POST | `/v1/committee/sessions/{committee_session_id}/votes` |
| FinalizeCommitteeDecision | POST | `/v1/committee/sessions/{committee_session_id}/finalize` |
| ListCommitteeSessionsByApplication | GET | `/v1/applications/{application_id}/committee-sessions` |

### Decision Sub-service

| Method | HTTP | Path |
|--------|------|------|
| RecordFinalDecision | POST | `/v1/applications/{application_id}/final-decision` |
| GetApplicationDecision | GET | `/v1/applications/{application_id}/decision` |
| AddDecisionCondition | POST | `/v1/applications/{application_id}/decision-conditions` |
| ListDecisionConditions | GET | `/v1/applications/{application_id}/decision-conditions` |

## 7. Media Service

| Method | HTTP | Path |
|--------|------|------|
| UploadDocument | POST | `/v1/media/documents` |
| ListDocuments | GET | `/v1/media/documents` |
| GetPresignedUrl | GET | `/v1/media/presigned-url` |

## Swagger UI

Available at `http://localhost:8001/docs` when the backend is running.
OpenAPI spec at `http://localhost:8001/openapi.yaml`.
