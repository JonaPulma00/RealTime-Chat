import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistreService } from './registre.service';

describe('RegistreService', () => {
  let service: RegistreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistreService],
    });
    service = TestBed.inject(RegistreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should register a new user successfully', () => {
    const mockResponse = { message: 'User registered successfully' };
    const user = 'testUser';
    const email = 'test@example.com';
    const password = 'password123';

    service.register(user, email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user, email, password });
    req.flush(mockResponse);
  });

  it('should validate a user and save tokens', () => {
    const mockResponse = {
      token: 'testToken123',
      refreshToken: 'refreshToken123',
      user: { id: 1, name: 'Test User' }
    };
    const email = 'test@example.com';
    const password = 'password123';

    spyOn(service, 'saveTokens').and.callThrough();

    service.validateUser(email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(service.saveTokens).toHaveBeenCalledWith(mockResponse.token, mockResponse.refreshToken);
      expect(service.getToken()).toBe(mockResponse.token);
      expect(service.getRefreshToken()).toBe(mockResponse.refreshToken);
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password });
    req.flush(mockResponse);
  });

  it('should save the token to sessionStorage', () => {
    const token = 'testToken123';
    const refreshToken = 'tokenRefresh';
    service.saveTokens(token, refreshToken);
    expect(sessionStorage.getItem('tokenVerificacio')).toBe(token);
  });

  it('should retrieve the token from sessionStorage', () => {
    const token = 'testToken123';
    sessionStorage.setItem('tokenVerificacio', token);
    expect(service.getToken()).toBe(token);
  });

  it('should delete tokens from sessionStorage', () => {
    sessionStorage.setItem('tokenVerificacio', 'testToken123');
    service.deleteTokens();
    expect(sessionStorage.getItem('tokenVerificacio')).toBeNull();
  });

  it('should check if user is logged in', () => {
    sessionStorage.setItem('tokenVerificacio', 'testToken123');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false if user is not logged in', () => {
    sessionStorage.removeItem('tokenVerificacio');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should log in and set token', () => {
    const mockResponse = { token: 'test-token', refreshToken: 'refresh-token' };
    service.login('test@example.com', 'password').subscribe((response) => {
      expect(response.token).toEqual(mockResponse.token);
      expect(service.getToken()).toEqual(mockResponse.token);
    });

    const req = httpMock.expectOne('http://localhost:3100/api/v1/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
    req.flush(mockResponse);
  });


  it('should log out and clear tokens', () => {
    spyOn(service, 'deleteTokens').and.callThrough();
    service.logout();
    expect(service.deleteTokens).toHaveBeenCalled();
  });
});
