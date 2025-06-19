export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  uploadedAt: Date;
  uploadedBy: string; // user ID
} 