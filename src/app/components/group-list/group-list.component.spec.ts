import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupListComponent } from './group-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupService } from '../../services/group.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Group } from '../../models/group.model';

describe('GroupListComponent', () => {
  let component: GroupListComponent;
  let fixture: ComponentFixture<GroupListComponent>;
  let groupService: GroupService;
  let groupInstance: Group;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        GroupListComponent
      ],
      providers: [GroupService]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupListComponent);
    component = fixture.componentInstance;
    groupService = TestBed.inject(GroupService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', () => {
    spyOn(component, 'loadAllGroups');
    component.ngOnInit();
    expect(component.loadAllGroups).toHaveBeenCalled();
  });

  it('should display groups in template', () => {
    component.allGroups = [
      new Group('1', 'Test Group', 'image.jpg', 10)
    ];
    component.filteredGroups = component.allGroups;
    fixture.detectChanges();
    
    const items = fixture.nativeElement.querySelectorAll('.room-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('.room-name').textContent).toContain('Test Group');
  });
});
