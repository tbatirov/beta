export interface ConversionHistory {
  id: string;
  date: Date;
  gaapData: any;
  ifrsData: any;
  explanations: string[];
  recommendations: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  uploadDate: Date;
  fileType: string;
}

export interface UserAction {
  id: string;
  date: Date;
  action: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastUpdated?: Date;
  status: 'idle' | 'in-progress' | 'completed';
  conversionHistory: ConversionHistory[];
  uploadedFiles: UploadedFile[];
  userActions: UserAction[];
  generatedReports: string[];
}