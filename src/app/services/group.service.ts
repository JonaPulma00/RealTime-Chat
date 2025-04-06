import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GroupService {
  apiUrl = 'http://localhost:3100/api/v1'
  constructor(private http: HttpClient) { }
    
    getAllGroups(): Observable<{ success: boolean; data: any[] }> {
      return this.http.get<{ success: boolean; data: any[] }>(
        `${this.apiUrl}/groups/all`
      );
    }

    getUserGroups(): Observable<{ success: boolean; data: any[] }> {
      return this.http.get<{ success: boolean; data: any[] }>(
        `${this.apiUrl}/usuari/groups`
      );
    }

    joinGroup(groupId: string): Observable<{ success: boolean }> {
      return this.http.post<{ success: boolean }>(
        `${this.apiUrl}/groups/${groupId}/join`,
        {}
      );
    }

    leaveGroup(groupId: string): Observable<{ success: boolean}> {
      return this.http.delete<{ success: boolean}>(
        `${this.apiUrl}/groups/${groupId}/leave`
      )
    }
}
