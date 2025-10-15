import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Template {
  id?: string;
  name: string;
  description?: string;
  html: string;
  css: string;
  components?: any;
  styles?: any;
  assets?: string[];
  thumbnail?: string;
  status?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssetUploadResponse {
  key: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'http://localhost:3000/api/templates';

  constructor(private http: HttpClient) {}

  /**
   * Get all templates
   */
  getAllTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.apiUrl);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new template
   */
  createTemplate(template: Template): Observable<Template> {
    return this.http.post<Template>(this.apiUrl, template);
  }

  /**
   * Update existing template
   */
  updateTemplate(id: string, template: Partial<Template>): Observable<Template> {
    return this.http.patch<Template>(`${this.apiUrl}/${id}`, template);
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload asset file
   */
  uploadAsset(file: File): Observable<AssetUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AssetUploadResponse>(`${this.apiUrl}/upload/asset`, formData);
  }

  /**
   * Upload thumbnail
   */
  uploadThumbnail(file: File): Observable<AssetUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AssetUploadResponse>(`${this.apiUrl}/upload/thumbnail`, formData);
  }

  /**
   * Upload base64 image
   */
  uploadBase64Image(base64Data: string): Observable<AssetUploadResponse> {
    return this.http.post<AssetUploadResponse>(
      `${this.apiUrl}/upload/base64-image`,
      { image: base64Data }
    );
  }
}
