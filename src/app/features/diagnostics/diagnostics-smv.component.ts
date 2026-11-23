import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransmitterDeviceState } from '../../core/models/transmitter.models';
import { TransmitterEngineService } from '../../core/services/transmitter-engine.service';

@Component({
  selector: 'emr-diagnostics-smv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostics-smv.component.html',
  styleUrls: ['./diagnostics-smv.component.scss']
})
export class DiagnosticsSmvComponent implements OnInit {
  public state?: TransmitterDeviceState;
  public runningSmv = false;

  constructor(private engine: TransmitterEngineService) {}

  ngOnInit(): void {
    this.engine.state$.subscribe(s => (this.state = s));
  }

  public triggerSmv(): void {
    this.runningSmv = true;
    setTimeout(() => {
      this.engine.runSmartMeterVerification();
      this.runningSmv = false;
    }, 900);
  }

  public ackAlert(id: string): void {
    this.engine.acknowledgeAlert(id);
  }

  public exportCsv(): void {
    this.engine.exportHistorianCsv();
  }
}
