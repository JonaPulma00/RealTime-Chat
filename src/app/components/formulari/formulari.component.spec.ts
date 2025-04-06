import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormulariComponent } from './formulari.component';
import { RegistreService } from '../../services/registre.service';
import { User } from '../../models/user.model';
import { UserCredentials } from '../../models/userCredentials.model';

describe('FormulariComponent', () => {
  let component: FormulariComponent;
  let fixture: ComponentFixture<FormulariComponent>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const validUser = new User();
  const validCredentials = new UserCredentials();

  beforeEach(async () => {
    const registreServiceSpy = jasmine.createSpyObj('RegistreService', [
      'register', 
      'validateUser', 
      'saveTokens', 
      'deleteTokens'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientModule, RouterTestingModule, FormulariComponent], 
      providers: [
        { provide: RegistreService, useValue: registreServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
    

    mockRegistreService = TestBed.inject(RegistreService) as jasmine.SpyObj<RegistreService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    validUser.username = 'testuser';
    validUser.email = 'test@example.com';
    validUser.password = 'Password123!';
    validUser.confirmPassword = 'Password123!';

    validCredentials.email = 'test@example.com';
    validCredentials.password = 'Password123!';
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {  
    it('should validate empty username', () => {
      validUser.username = ''; 
      component.registerUser = validUser;
      component.onSubmit();
      expect(component.validationErrors.username).toBeTrue();
    });

    it('should validate empty email', () => {
      validUser.email = ''; 
      component.registerUser = validUser;
      component.onSubmit();
      expect(component.validationErrors.email).toBeTrue();
    });

    it('should validate password length and special character', () => {
      const testUser = new User();
      testUser.username = 'testuser';
      testUser.email = 'test@example.com';
      testUser.password = 'short'; 
      testUser.confirmPassword = 'short'; 
      
      component.registerUser = testUser;
      component.onSubmit();
      
      expect(component.validationErrors.passwordRegex).toBeTrue();
    });

    it('should validate password match', () => {
      validUser.password = 'Password123!'; 
      validUser.confirmPassword = 'DifferentPassword!'; 
      component.registerUser = validUser;
      component.onSubmit();
      expect(component.validationErrors.confirmPassword).toBeTrue();
    });
  });

  describe('Registration', () => {  
    it('should call register service on successful form validation', () => {
      const mockResponse = { success: true };
      mockRegistreService.register.and.returnValue(of(mockResponse));

      component.registerUser = new User(
        'testuser',
        'test@example.com',
        'Password123!',
        'Password123!',
        false
      );

      component.onSubmit();
    
      expect(mockRegistreService.register).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'Password123!'
      );
    });
  });

  describe('Sign In', () => {  
    it('should handle successful login', () => {
      const mockAuthResponse = { token: 'fake-jwt-token', refreshToken: 'fake-refresh-token' };
      mockRegistreService.validateUser.and.returnValue(of(mockAuthResponse));
  
      component.loginCredentials = validCredentials;
      component.handleSignIn();
  
      expect(mockRegistreService.validateUser).toHaveBeenCalledWith(
        validCredentials.email,
        validCredentials.password
      );
      expect(mockRegistreService.saveTokens).toHaveBeenCalledWith('fake-jwt-token', 'fake-refresh-token');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat-dashboard']);
    });
  });
  

  describe('Clear Inputs', () => { 
    it('should reset all input fields', () => {
      const testUser = new User();
      testUser.username = 'testuser';
      testUser.email = 'test@example.com';
      testUser.password = 'Password123!';
      testUser.confirmPassword = 'Password123!';
    
      component.registerUser = testUser; 
      component.registerUser.clear();
    
      expect(component.registerUser.username).toBe('');
      expect(component.registerUser.email).toBe('');
      expect(component.registerUser.password).toBe('');
      expect(component.registerUser.confirmPassword).toBe('');
    });
  });
});