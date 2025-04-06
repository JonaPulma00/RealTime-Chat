export class Message {
  constructor(
    private _text: string,
    private _sentByUser: boolean,
    private _messageId: string,
    private _username: string
  ) {}

  // Getters
  get text(): string {
    return this._text;
  }

  get sentByUser(): boolean {
    return this._sentByUser;
  }

  get id(): string {
    return this._messageId;
  }
  get username(): string {
    return this._username;
  }
  // Setters
  set text(value: string) {
    this._text = value;
  }

  set sentByUser(value: boolean) {
    this._sentByUser = value;
  }

  set id(value: string) {
    this._messageId = value;
  }
}