export interface AddDocumentDTO {
  content: string;
  title?: string;
  source?: string;
  category?: string;
}

export interface AddDocumentResponse {
  success: boolean;
  documentId: string;
  message: string;
}