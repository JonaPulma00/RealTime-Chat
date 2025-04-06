import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResumComponent } from './user-resum.component';

describe('UserResumComponent', () => {
  let component: UserResumComponent;
  let fixture: ComponentFixture<UserResumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserResumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserResumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
