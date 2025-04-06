import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../../services/registre.service';
import { User} from '../../models/user.model';
import { UserCredentials } from '../../models/userCredentials.model';
@Component({
  selector: 'etiqueta-formulari',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  providers: [],
  templateUrl: './formulari.component.html',
  styleUrls: ['./formulari.component.css']
})
export class FormulariComponent implements AfterViewInit, OnInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  registerUser: User = new User();
  loginCredentials: UserCredentials = new UserCredentials();

  validationErrors = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    passwordRegex: false
  };

  registrationSuccess: boolean = false;

  loginValidationErrors = {
    email: false,
    password: false
  };

  loginError: string | null = null;
  registerError: string | null = null;

  constructor(
    private router: Router,
    private registreService: RegistreService
  ) {}

  ngOnInit(): void {
    this.registreService.deleteTokens();
  }

  ngAfterViewInit() {
    this.setupButtonListeners();
  }

  private setupButtonListeners(): void {
    if (this.signUpBtn && this.container) {
      this.signUpBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.add('sign-up-mode');
      });
    }

    if (this.signInBtn && this.container) {
      this.signInBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.remove('sign-up-mode');
      });
    }
  }

  onSubmit(): void {
    this.registerError = null;
    
    const {isValid, errors} = this.registerUser.validate();
    this.validationErrors = errors;

    if(isValid){
      this.registreService.register(
        this.registerUser.username,
        this.registerUser.email,
        this.registerUser.password
      ).subscribe({
        next: (response) => {
          console.log('Registre correcte', response);
          this.registerUser.clear();
          this.registrationSuccess = true;

          setTimeout(()=>{
            this.registrationSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error en el registre', error);
          this.registerError = error.error?.error || 'Error en el registro';
        }
      });
    }
  }


  handleSignIn(): void {
    this.loginError = null;
    this.loginValidationErrors = {
      email: false,
      password: false
    };

    if (!this.loginCredentials.email) this.loginValidationErrors.email = true;
    if (!this.loginCredentials.password) this.loginValidationErrors.password = true;

    const { isValid } = this.loginCredentials.validate();
    if (isValid) {
      this.registreService.validateUser(
        this.loginCredentials.email,   
        this.loginCredentials.password  
      ).subscribe({
        next: (response) => {
          if (response && response.token && response.refreshToken) {
            this.registreService.saveTokens(response.token, response.refreshToken);
            this.router.navigate(['/chat-dashboard']);
          } else {
            this.loginError = 'Credenciales incorrectas';
          }
        },
        error: (error) => {
          console.error('Error al verificar l\'usuari', error);
          this.loginError = error.error?.error || 'Error al iniciar sesión';
        }
      });
    } else {
      console.error('Email i contra requerits');
    }
  }
}