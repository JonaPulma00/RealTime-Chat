import { Routes } from '@angular/router';
import { FormulariComponent } from './components/formulari/formulari.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthGuard } from './guards/auth.guard';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UserResumComponent } from './components/user-resum/user-resum.component';
import { GroupListComponent } from './components/group-list/group-list.component';

export const routes: Routes = [
  { path: '', component: FormulariComponent },
  { path: 'chat-dashboard', component: ChatComponent, canActivate: [AuthGuard] },
  {path: 'chat-dashboard/user-profile', component: PerfilComponent, canActivate:[AuthGuard]},
  {path: 'chat-dashboard/users', component: UserResumComponent, canActivate:[AuthGuard]},
  {path: 'chat-dashboard/group-list', component: GroupListComponent, canActivate:[AuthGuard]},
  { path: '**', redirectTo: '' }
];
