import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { UserActionsService } from '../../services/user-actions.service';
import { RegistreService } from '../../services/registre.service';
import { Router } from '@angular/router';
import { SocketService } from '../../models/socket.model';
import { of, throwError } from 'rxjs';
import { Chat } from '../../models/chat.model';
import { Group } from '../../models/group.model';
import { GroupService } from '../../services/group.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockUserActionsService: jasmine.SpyObj<UserActionsService>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSocketService: jasmine.SpyObj<SocketService>;
  let mockGroupService: jasmine.SpyObj<GroupService>
  let chatInstance: Chat;

  const mockGroups = [
    new Group("1", 'General', 'default-group.png', new Date().getTime()),
    new Group("2", 'Tech Talk', 'tech-group.png', new Date().getTime()),
  ];

  const mockUserData = { 
    data: { 
      user: 'testuser',
      email: 'test@example.com',
      userId: '123'
    } 
  };
  
  beforeEach(async () => {
    mockGroupService = jasmine.createSpyObj('mockGroupService', ['getUserGroups'])
    mockUserActionsService = jasmine.createSpyObj('UserActionsService', [
      'getGroups', 
      'postMessage',
      'getUserId',
      'getUserData',
      'getMessages',
      'currentUsername'
    ]);
    mockRegistreService = jasmine.createSpyObj('RegistreService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSocketService = jasmine.createSpyObj('SocketService', ['sendMessage', 'receiveMessage', 'joinRoom', 'leaveRoom']);
    mockUserActionsService.getUserId.and.returnValue(123);
    mockUserActionsService.getUserData.and.returnValue(of(mockUserData));
    mockUserActionsService.currentUsername = 'testuser';
    mockUserActionsService.getMessages.and.returnValue(of({ 
      success: true, 
      data: [],
      pagination: { page: 1, limit: 50, total: 0 }
    }));
    spyOn(console, 'error');
    chatInstance = new Chat(mockSocketService, mockUserActionsService, mockGroupService);

    await TestBed.configureTestingModule({
      imports: [ChatComponent, HttpClientTestingModule],
      providers: [
        { provide: UserActionsService, useValue: mockUserActionsService },
        { provide: RegistreService, useValue: mockRegistreService },
        { provide: Router, useValue: mockRouter },
        { provide: SocketService, useValue: mockSocketService },
        { provide: Chat, useValue: chatInstance },
        GroupService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load groups on init', fakeAsync(() => {
      mockGroupService.getUserGroups.and.returnValue(of({ success: true, data: mockGroups }));

      component.ngOnInit();
      tick(); 

      expect(mockGroupService.getUserGroups).toHaveBeenCalled();
      expect(component.chat.groups.length).toBe(2);
      expect(component.chat.groups[0] instanceof Group).toBeTrue();
    }));

    it('should handle error when loading groups', fakeAsync(() => {
      mockGroupService.getUserGroups.and.returnValue(throwError(() => new Error('Error')));
      
      component.ngOnInit();
      tick(); 

      expect(component.chat.groups.length).toBe(0);
    }));
  });

  describe('Group Management', () => {
    beforeEach(fakeAsync(() => {
      mockGroupService.getUserGroups.and.returnValue(of({ success: true, data: mockGroups }));
      component.ngOnInit();
      tick();
    }));

    it('should select a group', () => {
      component.chat.selectGroup("2");
      expect(component.chat.selectedGroupId).toBe("2");
    });

    it('should get default group image', () => {
      component.chat.selectGroup("3");
      expect(component.chat.currentGroupImage).toContain('city.jpg');
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      mockUserActionsService.postMessage.and.returnValue(of({ 
        success: true, 
        data: { messageId: '123' } 
      }));
    });

    it('should send messages', () => {
      component.chat.messageInput = 'Hello world!';
      component.chat.sendMessage();
      expect(mockSocketService.sendMessage).toHaveBeenCalled();
    });


    it('should not send empty messages', () => {
      component.chat.messageInput = '   ';
      component.chat.sendMessage();

      expect(mockSocketService.sendMessage).not.toHaveBeenCalled();
      expect(component.chat.messages.length).toBe(0);
    });

    it('should post messages correctly', fakeAsync(() => {
      mockUserActionsService.postMessage.and.returnValue(of({ success: true, data: {} }));
      component.chat.selectGroup("2");
      component.chat.messageInput = 'Hola mundo';
      component.chat.sendMessage();
      tick();
    
      expect(mockUserActionsService.postMessage).toHaveBeenCalledWith('Hola mundo', "2");
      expect(mockSocketService.sendMessage).toHaveBeenCalledWith('Hola mundo', "2", "testuser");
      expect(component.chat.messages.length).toBe(1);
    }));

    it('should create messages with username', () => {
      mockUserActionsService.currentUsername = 'testuser';
      component.chat.messageInput = 'Hello world!';
      component.chat.sendMessage();

      const sentMessage = component.chat.messages[0];
      expect(sentMessage.username).toBe('testuser');
      expect(sentMessage.text).toBe('Hello world!');
    });
  });

  describe('User Data Handling', () => {
    it('should load username on init', fakeAsync(() => {
      mockUserActionsService.getUserData.and.returnValue(of(mockUserData));
      
      component.ngOnInit();
      tick();
      
      expect(component.username).toBe('testuser');
      expect(mockUserActionsService.getUserData).toHaveBeenCalled();
    }));
  
    it('should handle error when loading user data', fakeAsync(() => {
      mockUserActionsService.getUserData.and.returnValue(throwError(() => new Error('Failed')));
      
      component.ngOnInit();
      tick();
      
      expect(component.username).toBe('Loading...');
      expect(console.error).toHaveBeenCalled();
    }));
  });
  describe('UI Interactions', () => {
    it('should toggle sidebar', () => {
      expect(component.chat.isSidebarActive).toBeFalse();
      component.chat.toggleSidebar();
      expect(component.chat.isSidebarActive).toBeTrue();
    });

    it('should handle click outside sidebar', () => {
      component.chat.toggleSidebar(); 
      const event = new MouseEvent('click');
      component.handleClickOutside(event);
      expect(component.chat.isSidebarActive).toBeFalse();
    });
  });



  it('should load messages from all users', fakeAsync(() => {
    mockUserActionsService.getMessages.and.returnValue(of({ 
      success: true, 
      data: [
        { Content: 'Hola', UserId: 'user-123' },
        { Content: 'Hola 2', UserId: 'current-user-id' }
      ] 
    }));

    component.chat.selectGroup('group-123');
    tick();

    expect(component.chat.messages.length).toBe(2);
    expect(component.chat.messages[1].sentByUser).toBeTrue();
  }));
  describe('Logout', () => {
    it('should perform logout', () => {
      component.logout();

      expect(mockRegistreService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
    });
  });
});
