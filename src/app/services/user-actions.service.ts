import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserActionsService {
  apiUrl = 'http://localhost:3100/api/v1'
  private _username = '';

  constructor(private http: HttpClient) {}

  postMessage(content: string, groupId: string): Observable<{success: boolean, data: any}> {
    return this.http.post<{success: boolean; data: any}>(
      `${this.apiUrl}/user/messages`, 
      { content, groupId } 
    );
  }

getMessages(groupId: string, page: number = 1): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/groups/${groupId}/messages?page=${page}&limit=50`
  );
}
  
  getUserId(): number | null {
    const token = sessionStorage.getItem('tokenVerificacio')
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || null;
    } catch (error) {
      console.error('Error decodificacio token', error)
      return null;
    }
  }

    getUserData(): Observable<any> {
      const userId = this.getUserId();
      return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
        tap(response => this._username = response.data.user)
      );
    }

    get currentUsername(): string {
      return this._username;
    }

    set currentUsername(value: string) {
      this._username = value;
    }

    
  updateUser(userData: { username?: string, email?: string, password?: string }): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('User not logged in'));
    
    return this.http.put<any>(
      `${this.apiUrl}/users/${userId}`,
      userData
    );
  }
}
