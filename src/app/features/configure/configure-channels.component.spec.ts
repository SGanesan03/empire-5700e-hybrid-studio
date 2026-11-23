import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigureChannelsComponent } from './configure-channels.component';
import { registerLegacy5700Module } from '../../legacy-angularjs/empire-legacy-5700.module';

describe('ConfigureChannelsComponent', () => {
  let component: ConfigureChannelsComponent;
  let fixture: ComponentFixture<ConfigureChannelsComponent>;

  beforeEach(async () => {
    registerLegacy5700Module();
    await TestBed.configureTestingModule({
      imports: [ConfigureChannelsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigureChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize channel list from transmitter state', () => {
    expect(component.editableChannels.length).toBeGreaterThan(0);
  });
});
