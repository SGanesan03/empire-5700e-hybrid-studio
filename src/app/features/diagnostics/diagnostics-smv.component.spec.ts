import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagnosticsSmvComponent } from './diagnostics-smv.component';

describe('DiagnosticsSmvComponent', () => {
  let component: DiagnosticsSmvComponent;
  let fixture: ComponentFixture<DiagnosticsSmvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticsSmvComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosticsSmvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create diagnostics and SMV view component', () => {
    expect(component).toBeTruthy();
  });
});
