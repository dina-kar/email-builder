import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Template {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDto {
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
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  html?: string;
  css?: string;
  components?: any;
  styles?: any;
  assets?: string[];
  thumbnail?: string;
  status?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/templates`;

  /**
   * Get all templates
   */
  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a single template by ID
   */
  getTemplate(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new template
   */
  createTemplate(template: CreateTemplateDto): Observable<Template> {
    return this.http.post<Template>(this.apiUrl, template).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing template
   */
  updateTemplate(id: string, template: UpdateTemplateDto): Observable<Template> {
    return this.http.patch<Template>(`${this.apiUrl}/${id}`, template).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload an asset file
   */
  uploadAsset(file: File): Observable<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ key: string; url: string }>(
      `${this.apiUrl}/upload/asset`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload a thumbnail image
   */
  uploadThumbnail(file: File): Observable<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ key: string; url: string }>(
      `${this.apiUrl}/upload/thumbnail`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload a base64 encoded image
   */
  uploadBase64Image(base64Data: string): Observable<{ key: string; url: string }> {
    return this.http.post<{ key: string; url: string }>(
      `${this.apiUrl}/upload/base64-image`,
      { image: base64Data }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate thumbnail from HTML content
   */
  generateThumbnail(html: string, css: string): string {
    // Create a simple thumbnail preview (you can enhance this with actual screenshot logic)
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText('Email Template', 10, 30);
    }
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Template Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
