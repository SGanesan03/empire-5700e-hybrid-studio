import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewDashboardComponent } from './overview-dashboard.component';

describe('OverviewDashboardComponent', () => {
  let component: OverviewDashboardComponent;
  let fixture: ComponentFixture<OverviewDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create overview dashboard with live process variables', () => {
    expect(component.state).toBeTruthy();
  });
});
