import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ReferenceService } from "@/gen/reference/v1/reference_connect";
import { Empty } from "@bufbuild/protobuf";

const client = createPromiseClient(ReferenceService, transport);

export const referenceService = {
    getLoanProducts: () => client.listLoanProducts(new Empty()),
    getBranches: () => client.listBranches(new Empty()),
    getGLAccounts: () => client.listFinancialGLAccounts(new Empty()),
    getAttributeRegistry: () => client.listAttributeRegistry(new Empty()),
    createAttributeRegistry: (data: any) => client.createAttributeRegistry(data),
    updateAttributeRegistry: (data: any) => client.updateAttributeRegistry(data),
};

