import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; 

interface AuthResponse {
  token: string;
  refreshToken: string;
  user?: any;
}

@Injectable({ 
  providedIn: 'root'
})
export class RegistreService {
  private baseApiUrl = 'http://localhost:3100/api/v1';

  constructor(private http: HttpClient) {}

  register(user: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseApiUrl}/register`, { user, email, password });
  }
  
  validateUser(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseApiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response?.token && response?.refreshToken) {
          this.saveTokens(response.token, response.refreshToken);
        }
      })
    );
  }

  saveTokens(token: string, refreshToken: string): void {
    sessionStorage.setItem('tokenVerificacio', token);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(`${this.baseApiUrl}/refresh`, { refreshToken });
  }

  getToken(): string { 
    return sessionStorage.getItem('tokenVerificacio') ?? ''; 
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken') ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  deleteTokens(): void {
    sessionStorage.removeItem('tokenVerificacio');
    sessionStorage.removeItem('refreshToken');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseApiUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        if (response?.token && response?.refreshToken) {
          this.saveTokens(response.token, response.refreshToken);
        }
      })
    );
  }
  
  logout(): void {
        this.deleteTokens();
    }
}
