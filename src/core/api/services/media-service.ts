import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { MediaService } from "@/gen/media/v1/media_connect";
import { Document } from "@/shared/types/api";
import { parseTimestamp } from "@/shared/lib/utils";

const client = createPromiseClient(MediaService, transport);

/**
 * Service for handling media and documents using gRPC (ConnectRPC).
 */
export const mediaService = {
    /**
     * Lists all documents for a specific application.
     * Uses ConnectRPC: api.media.v1.MediaService/ListDocuments
     */
    listByApplicationId: async (applicationId: string): Promise<Document[]> => {
        try {
            const response = await client.listDocuments({ applicationId });
            
            return (response.documents || []).map((doc: any) => ({
                id: doc.id || '',
                applicationId: doc.applicationId || applicationId,
                documentName: doc.documentName || '',
                fileUrl: doc.fileUrl || '',
                documentType: doc.documentType || '',
                uploadedAt: parseTimestamp(doc.uploadedAt),
            }));
        } catch (error) {
            console.error('Error fetching application documents via gRPC:', error);
            return [];
        }
    },

    /**
     * Get a single document by ID
     * Uses ConnectRPC: api.media.v1.MediaService/GetDocument
     */
    getById: async (documentId: string): Promise<Document | null> => {
        try {
            const doc = await client.getDocument({ documentId });
            return {
                id: doc.id || '',
                applicationId: doc.applicationId || '',
                documentName: doc.documentName || '',
                fileUrl: doc.fileUrl || '',
                documentType: doc.documentType || '',
                uploadedAt: parseTimestamp(doc.uploadedAt),
            };
        } catch (error) {
            console.error('Error fetching document via gRPC:', error);
            return null;
        }
    }
};
