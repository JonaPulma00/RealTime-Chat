import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../models/socket.model';
import { UserActionsService } from '../../services/user-actions.service';
import { Chat } from '../../models/chat.model';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent implements OnInit {
  chat: Chat;
  allGroups: Group[] = [];
  filteredGroups: Group[] = [];
  searchTerm: string = '';

  constructor(private router: Router, private socketService: SocketService, private groupService: GroupService, private userActionsService: UserActionsService){
    this.chat = new Chat(this.socketService, this.userActionsService, this.groupService)
  }

  ngOnInit() {
    this.loadAllGroups();
  }
  loadAllGroups() {
    this.groupService.getAllGroups().subscribe({
      next: ({ data }) => {
        this.allGroups = (data || []).map(({ GroupId, GroupName, ImageUrl, MemberCount }: any) => 
          new Group(GroupId, GroupName, ImageUrl, MemberCount)
        );
        this.filteredGroups = this.allGroups;
      },
      error: (error) => console.error('Error loading groups:', error)
    });
}

  searchGroups() {
    if (!this.searchTerm) {
      this.filteredGroups = this.allGroups;
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredGroups = this.allGroups.filter(group =>
      group.groupName.toLowerCase().startsWith(searchTermLower)
    );
  }

  joinGroup(groupId: string) {
    this.groupService.joinGroup(groupId).subscribe({
      next: () => {
        this.chat.loadGroups();
        this.loadAllGroups();
      },
      error: (error) => console.error('Error joining group:', error)
    });
  }

  stepBack(){
    this.router.navigate(['chat-dashboard'])
  }
}
