export class User {
  constructor(
    private _username: string = '',
    private _email: string = '',
    private _password: string = '',
    private _confirmPassword: string = '',
    private _updateConfirmed: boolean = false
  ) {}

  //Getters
  get username(): string {
    return this._username; 
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get confirmPassword(): string {
    return this._confirmPassword;
  }

  get updateConfirmed(): boolean {
    return this._updateConfirmed;
  }

  //Setters
  set username(value: string) {
    this._username = value;
  }

  set email(value: string){
    this._email = value
  }

  set password(value: string){
    this._password = value;
  }

  set confirmPassword(value: string){
  this._confirmPassword = value
  }

  set updateConfirmed(value: boolean) {
    this._updateConfirmed = value;
  }

  validatePerfil(): { isValid: boolean; errors: any } {
    const errors: any = {
      username: !this._username,
      email: !this._email || !this.validateEmail(),
      passwordRegex: this._password ? !this.passwordValidator() : false,
      confirmPassword: this._password ? !this.passwordMatch() : false,
      updateConfirmed: !this._updateConfirmed
    };
    
    const isValid = Object.values(errors).every(error => !error);
    return { isValid, errors };
  }

  validate(): { isValid: boolean, errors: any } {
    const errors: any = {
      username: !this._username,
      email: !this._email || !this.validateEmail(),
      password: !this._password,
      passwordRegex: this._password ? !this.passwordValidator() : false,
      confirmPassword: this._password ? !this.passwordMatch() : false,
    };
    
    const isValid = Object.values(errors).every(error => !error);
    return { isValid, errors };
  }

  private validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this._email);
  }

  passwordMatch(): boolean {
    return this._password === this._confirmPassword;
  }

  passwordValidator(): boolean {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return this._password.length >= minLength && symbolRegex.test(this._password);
  }

  clear(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.updateConfirmed = false;
  }
}