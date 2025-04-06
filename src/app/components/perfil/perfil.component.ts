import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { UserActionsService } from '../../services/user-actions.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  user: User = new User();
  originalUserData: any = {};
  validationErrors: any = {};
  confirmChangesRequested: boolean = false;
  saveSuccess = false;
  saveError = false;
  feedbackMessage = '';

  constructor(private userService: UserActionsService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUserData().subscribe({
      next: (response) => {
        if (response.success) {
          this.user.username = response.data.user;
          this.originalUserData = { ...response.data };
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.feedbackMessage = 'Error al cargar los datos del usuario';
      }
    });
  }
  
  stepback(): void{
    this.router.navigate(['chat-dashboard'])
  }
  validateForm(): void {
    const validation = this.user.validatePerfil();
    this.validationErrors = validation.errors;
  }

  attemptSave(): void {
    if (this.confirmChangesRequested) {
      this.saveChanges();
    } else {
      this.feedbackMessage = 'Vuelve a hacer click para confirmar los cambios';
      this.confirmChangesRequested = true;
    }
  
    setTimeout(() => {
      this.feedbackMessage = '';
      this.confirmChangesRequested = false;
    }, 5000);
  }

  saveChanges(): void {
    this.validateForm();
    
    const updateData = this.getUpdatedData();
    
    if (Object.keys(updateData).length === 0) {
      this.showFeedback('No se han detectado cambios', false);
      return;
    }
  
    this.userService.updateUser(updateData).subscribe({
      next: () => {
        this.showFeedback('Cambios hechos correctamente', true);
        this.originalUserData = { ...this.user };
        this.user = new User(
          this.originalUserData.user,
          '',
          ''
        );
      },
      error: (err) => {
        console.error('Update error:', err);
        this.showFeedback('Error al guardar datos', false);
      }
    });
  }
  
  private getUpdatedData(): any {
    const updateData: any = {};
    if (this.user.username !== this.originalUserData.user) updateData.username = this.user.username;
    if (this.user.password) updateData.password = this.user.password;
    return updateData;
  }
  

  cancelChanges(): void {
    this.user = new User(
      this.originalUserData.user,
      '',
      ''
    );
    this.validationErrors = {};
    this.feedbackMessage = '';
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    this.feedbackMessage = message;
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 4000);
  }
  
}
