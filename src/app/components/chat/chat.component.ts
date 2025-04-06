import { Component, OnInit, HostListener } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserActionsService } from '../../services/user-actions.service';
import { RegistreService } from '../../services/registre.service';
import { SocketService } from '../../models/socket.model';
import { Chat } from '../../models/chat.model';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor,FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  chat: Chat;
  username: string = 'Loading...';
  activeDropdown: string | null = null; 
  showLeaveModal: boolean = false;
  groupToLeave: Group | null = null;
  private messagesContainer!: HTMLElement;
  private isNearBottom = true;
  chatError: string | null = null;
  constructor(
    private userActionsService: UserActionsService,
    private registreService: RegistreService,
    private router: Router,
    private socketService: SocketService,
    private groupService: GroupService
  ) {
    this.chat = new Chat(this.socketService, this.userActionsService, this.groupService);
  }

  ngOnInit(): void {
    this.chat.loadGroups();

    this.userActionsService.getUserData().subscribe({
      next: (response) => {
        this.username = response.data.user;
        setTimeout(() => {
          this.messagesContainer = document.querySelector('.messages') as HTMLElement;
          this.setupScrollListener();
        });
      },
      error: (error) => console.error('Error loading user data:', error)
    });
  }

  private setupScrollListener(): void {
    if (!this.messagesContainer) return;

    this.messagesContainer.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
      const threshold = scrollHeight * 0.3;
      this.isNearBottom = scrollHeight - (scrollTop + clientHeight) < threshold;
    });

    this.chat.messages$.subscribe(() => {
      if (this.isNearBottom) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  logout(): void {
    this.registreService.logout();
    this.router.navigate(['']);
  }

  profile(): void {
    this.router.navigate(['chat-dashboard/user-profile'])
  }
  users(): void {
    this.router.navigate(['chat-dashboard/users'])
  }
  groups(): void {
    this.router.navigate(['chat-dashboard/group-list'])
  }
  groupOptions(groupId: string): void {
    this.activeDropdown = this.activeDropdown === groupId ? null : groupId;
  }

  leaveGroup(event: Event, groupId: string): void {
    event.stopPropagation(); 
    this.groupToLeave = this.chat.groups.find(g => g.groupId === groupId) || null;
    this.showLeaveModal = true;
    this.activeDropdown = null;
  }

  confirmLeaveGroup(): void {
    if (this.groupToLeave) {
      this.chat.leaveGroup(this.groupToLeave.groupId);
    }
    this.showLeaveModal = false;
    this.groupToLeave = null;
  }

  cancelLeaveGroup(): void {
    this.showLeaveModal = false;
    this.groupToLeave = null;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    const menuToggle = document.querySelector('.menu-toggle') as HTMLElement;
    const dropdown = document.querySelector('.dropdown-icon') as HTMLElement;
    if (this.activeDropdown && 
        !dropdown?.contains(event.target as Node)) {
      this.activeDropdown = null;
    }
    if (
      window.innerWidth <= 768 &&
      this.chat.isSidebarActive && 
      sidebar && menuToggle &&
      !sidebar.contains(event.target as Node) &&
      !menuToggle.contains(event.target as Node)
    ) {
      this.chat.toggleSidebar();
    }
  }
  
}