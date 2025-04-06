import { TestBed } from '@angular/core/testing';

import { GroupService } from './group.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock : HttpTestingController
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService]
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should return all groups from the API', () => {
    const mockGroups = [{ name: 'Group 1' }, { name: 'Group 2' }];
    const mockResponse = { success: true, data: mockGroups };

    service.getAllGroups().subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.success).toBeTrue();
      expect(response.data).toEqual(mockGroups);
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/groups/all');
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  
  it('should return user groups from the API', () => {
    const mockGroups = [{ name: 'Group 1' }, { name: 'Group 2' }];
    const mockResponse = { success: true, data: mockGroups };

    service.getUserGroups().subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.success).toBeTrue();
      expect(response.data).toEqual(mockGroups);
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/usuari/groups');
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should handle join group', () => {
    const groupId = 'test-group-id';
    
    service.joinGroup(groupId).subscribe(response => {
      expect(response.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${service.apiUrl}/groups/${groupId}/join`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should handle leaving group', () => {
    const groupId = 'test-group-id'
    
    service.leaveGroup(groupId).subscribe(response => {
      expect(response.success).toBeTrue();
    })

    const req = httpMock.expectOne(`${service.apiUrl}/groups/${groupId}/leave`)
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  })
});
