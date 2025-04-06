export class Group {
  constructor(
    private _groupId: string,
    private _groupName: string,
    private _imageUrl: string = 'F9E89E2B-C27D-4CA8-A033-38BFC3877C7B.png',
    private _memberCount: number = 0,
    private _createdAt?: Date,
  ) {}

  // Getters
  get groupId(): string {
    return this._groupId;
  }

  get groupName(): string {
    return this._groupName;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get memberCount(): number  {
    return this._memberCount;
  }

  // Setters
  set groupName(value: string) {
    this._groupName = value;
  }

  set imageUrl(value: string) {
    this._imageUrl = value;
  }

  set memberCount(value: number){
    this._memberCount = value;
  }

  isSelected(selectedGroupId: string | null): boolean {
    return this._groupId === selectedGroupId;
  }
}