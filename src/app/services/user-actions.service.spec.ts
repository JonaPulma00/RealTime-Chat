import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserActionsService } from './user-actions.service';

describe('UserActionsService', () => {
  let service: UserActionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserActionsService]
    });

    service = TestBed.inject(UserActionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should send a message to the API', () => {
    const mockMessage = {
      content: 'Hello!',
      groupId: "2",
    };

    const mockResponse = { success: true, data: { message: 'Sent successfully' } };

    service.postMessage(mockMessage.content, mockMessage.groupId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.success).toBeTrue();
      expect(response.data.message).toBe('Sent successfully');
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/user/messages');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockMessage);

    req.flush(mockResponse);
  });

  describe('getMessages', () => {
    const mockGroupId = 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3';
    const mockMessages = [
      { MessageId: 1, Content: 'Hello', SentAt: new Date(), UserId: 'user1' },
      { MessageId: 2, Content: 'Hi', SentAt: new Date(), UserId: 'user2' }
    ];
    it('should fetch messages for a group with pagination', () => {

      const mockResponse = {
        success: true,
        data: mockMessages,
        pagination: { page: 1, limit: 50, total: 100 }
      };
  

      service.getMessages(mockGroupId, 1).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(2);
        expect(response.pagination.page).toBe(1);
      });
  
      const req = httpMock.expectOne(
        `${service.apiUrl}/groups/${mockGroupId}/messages?page=1&limit=50`
      );
      
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toContain('page=1');
      expect(req.request.urlWithParams).toContain('limit=50');

      req.flush(mockResponse);
    });

    it('should handle API errors', () => {
      const errorResponse = {
        success: false,
        message: 'Server error'
      };
  
      service.getMessages(mockGroupId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(errorResponse);
        }
      });
  
      const req = httpMock.expectOne(
        `${service.apiUrl}/groups/${mockGroupId}/messages?page=1&limit=50`
      );
      
      req.flush(errorResponse, { 
        status: 500, 
        statusText: 'Internal Server Error' 
      });
    });
    it('should use default page number if not provided', () => {
      service.getMessages(mockGroupId).subscribe();
  
      const req = httpMock.expectOne(
        `${service.apiUrl}/groups/${mockGroupId}/messages?page=1&limit=50`
      );
      
      expect(req.request.urlWithParams).toContain('page=1');
      req.flush({ success: true, data: [] });
    });
});

describe('getUserId', () => {
  it('should return null when no token exists', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    expect(service.getUserId()).toBeNull();
  });
  it('should return null for invalid token', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('invalid.token.here');
    expect(service.getUserId()).toBeNull();
  });
  it('should return userId from valid token', () => {
    const mockPayload = { userId: 123 };
    const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
    spyOn(sessionStorage, 'getItem').and.returnValue(mockToken);
    expect(service.getUserId()).toBe(123);
  });
  it('should return null if token has no userId', () => {
    const mockPayload = { otherProp: 'test' };
    const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
    spyOn(sessionStorage, 'getItem').and.returnValue(mockToken);
    expect(service.getUserId()).toBeNull();
  });
});

describe('getUserData', () => {  
  const mockUserData = { data: { user: 'testUser' } };
  const mockUserId = 123;

  beforeEach(() => {
    spyOn(service, 'getUserId').and.returnValue(mockUserId);
  });

  
  it('should fetch user data and set username', () => {
    service.getUserData().subscribe(response => {
      expect(response).toEqual(mockUserData);
      expect(service.currentUsername).toBe('testUser');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/${mockUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUserData);
  });

  it('should handle API error', () => {
    service.getUserData().subscribe({
      next: () => fail('Should have failed'),
      error: error => expect(error.status).toBe(500)
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/${mockUserId}`);
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });
});

describe('updateUser', () => {
  beforeEach(() => {
    spyOn(service, 'getUserId').and.returnValue(123);  
  });

  it('should send PUT request with user data', () => {
    const mockData = { username: 'newuser' };
    const mockResponse = { success: true };
    
    service.updateUser(mockData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/123`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should handle update errors', () => {
    service.updateUser({}).subscribe({
      next: () => fail('Should have failed'),
      error: error => expect(error.status).toBe(500)
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/123`);
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });
});
afterEach(() => {
    httpMock.verify();
  });
});
