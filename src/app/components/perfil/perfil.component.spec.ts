import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilComponent } from './perfil.component';
import { UserActionsService } from '../../services/user-actions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { User } from '../../models/user.model';
import { of, throwError } from 'rxjs';
describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let userService: UserActionsService
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent, HttpClientTestingModule],
      providers: [UserActionsService]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserActionsService);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on init', () => {
    spyOn(userService, 'getUserData').and.returnValue(of({
      success: true,
      data: { user: 'testuser' }
    }));
    
    component.ngOnInit();
    expect(userService.getUserData).toHaveBeenCalled();
    expect(component.user.username).toBe('testuser');
  });

  
  it('should validate form correctly', () => {
    component.user.username = '';
    component.validateForm();
    
    expect(component.validationErrors.username).toBeTrue();
  });

  
  it('should handle double click save', () => {
    spyOn(component, 'saveChanges');
    
    component.attemptSave();
    expect(component.confirmChangesRequested).toBe(true);
    
    component.attemptSave();
    expect(component.saveChanges).toHaveBeenCalled();
  });

  it('should reset on reset button', () => {
    component.originalUserData = { user: 'testuser' };
    
    component.user.username = 'changed';
    component.cancelChanges();
    expect(component.user.username).toBe('testuser'); 
  });
});
