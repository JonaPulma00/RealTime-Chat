import { Message } from './message.model';
import { Group } from './group.model';
import { SocketService } from './socket.model';
import { UserActionsService } from '../services/user-actions.service';
import { GroupService } from '../services/group.service';
import { BehaviorSubject, Observable } from 'rxjs';

export class Chat {
  private _messages: { [groupId: string]: Message[] } = {};
  private _groups: Group[] = [];
  private _selectedGroupId: string | null = null;
  private _messageInput: string = '';
  private _isSidebarActive = false;
  private _currentPages: { [groupId: string]: number } = {};
  private _messagesSubject = new BehaviorSubject<void>(undefined);
  private _messageError: string | null = null;
  constructor(
    private socketService: SocketService,
    private userActionsService: UserActionsService,
    private groupService: GroupService
  ) {
    this.initializeMessageListener();
  }

  // Getters
  get messages(): Message[] {
    return this._selectedGroupId !== null 
      ? this._messages[this._selectedGroupId] || [] 
      : [];
  }

  get groups(): Group[] {
    return this._groups;
  }

  get selectedGroupId(): string | null {
    return this._selectedGroupId;
  }

  get messageInput(): string {
    return this._messageInput;
  }

  get isSidebarActive(): boolean {
    return this._isSidebarActive;
  }

  get messageError(): string | null{
    return this._messageError;
  }

  get selectedGroup(): Group | undefined {
    return this._groups.find(g => g.groupId === this._selectedGroupId);
  }

  get currentGroupName(): string {
    return this.selectedGroup?.groupName || 'No te has unido a ningun grupo, unete a un grupo!';
  }

  get currentGroupImage(): string {
    return this.selectedGroup?.imageUrl || 'city.jpg';
  }

  get messages$(): Observable<void> {
    return this._messagesSubject.asObservable();
  }

  // Setters
  set messageInput(value: string) {
    this._messageInput = value;
  }


  loadGroups(): void {
    this.groupService.getUserGroups().subscribe({
        next: ({ data }) => {
            const groups = (data || []).map(({ GroupId, GroupName, imageUrl, CreatedAt }: any) => 
                new Group(GroupId, GroupName, imageUrl, new Date(CreatedAt).getTime())
            );

            if (groups.length && !this._selectedGroupId) {
                this.selectGroup(groups[0].groupId);
            }

            this._groups = groups;
        },
        error: (error) => {
            console.error('Error loading groups:', error);
            this._groups = [];
        }
    });
}




  selectGroup(groupId: string): void {
    if (this._selectedGroupId === groupId) return;
  

    if (this._selectedGroupId !== null) {
      this.socketService.leaveRoom(this._selectedGroupId);
    }
  
    this._selectedGroupId = groupId;
    this._messages[groupId] = [];
    this.loadMessages(groupId, 1);
  
    this.socketService.joinRoom(groupId);
  }
  sendMessage(): void {
    if (this._messageInput.trim()) {
      if (this._messageInput.length > 150) {
        this._messageError = "Los mensajes no pueden ser superiores a 150 carácteres";
        setTimeout(() => {
          this._messageError = null;
        }, 5000);
        return;
      }
      this.userActionsService.postMessage(this._messageInput, this._selectedGroupId!)
        .subscribe({
          next: (response) => {
            this.socketService.sendMessage(
              this._messageInput,
              this._selectedGroupId!,
              this.userActionsService.currentUsername
            );
            this.addMessage(new Message(
              this._messageInput,
              true,
              response.data.messageId,
              this.userActionsService.currentUsername
            ));
            this.clearMessageInput();
          },
          error: (error) => {
            console.error('Error sending message:', error)
            this._messageError = error.error?.error || 'Error al enviar el mensaje';
            setTimeout(() => {
              this._messageError = null;
            }, 5000); 
          }
        });
    }
  }

  private addMessage(message: Message): void {
    if (!this._selectedGroupId) return;
    this._messages[this._selectedGroupId] ??= [];
    this._messages[this._selectedGroupId].push(message);
    this._messagesSubject.next();
  }

  
  loadMessages(groupId: string, page: number): void {
    const userId = this.userActionsService.getUserId()?.toString();

    if (page === 1) {
        this._messages[groupId] = []; 
    }

    this.userActionsService.getMessages(groupId, page).subscribe({
        next: (response) => {
            if (response.success && response.data.length > 0) {
                const newMessages = response.data.map((m: any) => 
                    new Message(m.Content, m.UserId === userId, m.MessageId, m.Username)
                );
                const existingIds = new Set(this._messages[groupId].map((msg: Message) => msg.id));
                const uniqueMessages = newMessages.filter((msg: Message) => !existingIds.has(msg.id));
                if (page === 1) {
                    this._messages[groupId] = uniqueMessages; 
                } else {
                    this._messages[groupId].unshift(...uniqueMessages);
                }

                this._currentPages[groupId] = page + 1; 
            }
        },
        error: (error) => console.error('Error loading messages:', error)
    });
}


  private clearMessageInput(): void {
    this._messageInput = '';
  }

  private initializeMessageListener(): void {
    this.socketService.receiveMessage((message: Message) => {
      if (this._selectedGroupId !== null) {
        this.addMessage(new Message(
          message.text, 
          false, 
          message.id,
          message.username 
        ));
      }
    });
  }

  toggleSidebar(): void {
    this._isSidebarActive = !this._isSidebarActive;
  }

  leaveGroup(groupId: string): void {
    this.groupService.leaveGroup(groupId).subscribe({
      next: () => {
        this._groups = this._groups.filter(g => g.groupId !== groupId);
        if (this._selectedGroupId === groupId) {
          this.socketService.leaveRoom(groupId);
          
          if (this._groups.length > 0) {
            this.selectGroup(this._groups[0].groupId);
          } else {
            this._selectedGroupId = null;
          }
        }
        if (this._messages[groupId]) {
          delete this._messages[groupId];
        }
      },
      error: (error) => {
        console.error('Error leaving group:', error);
      }
    });
  }
}
