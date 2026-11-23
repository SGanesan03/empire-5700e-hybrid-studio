import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OilGradePreset, TransmitterDeviceState } from '../../core/models/transmitter.models';
import { TransmitterEngineService } from '../../core/services/transmitter-engine.service';

@Component({
  selector: 'emr-overview-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview-dashboard.component.html',
  styleUrls: ['./overview-dashboard.component.scss']
})
export class OverviewDashboardComponent implements OnInit {
  public state?: TransmitterDeviceState;
  public massFlowPoints = '';
  public netOilPoints = '';

  constructor(private engine: TransmitterEngineService) {}

  ngOnInit(): void {
    this.engine.state$.subscribe(s => {
      this.state = s;
      this.buildChartPolylines(s);
    });
  }

  public onPresetChange(preset: OilGradePreset): void {
    if (!this.state) return;
    this.engine.updateSimulationControls(
      preset,
      this.state.targetFlowSetpointKgHr,
      this.state.waterCutSetpointPct,
      preset === 'TWO_PHASE_SLUG_FLOW' ? true : this.state.entrainedGasInjection
    );
  }

  public onFlowChange(flow: number): void {
    if (!this.state) return;
    this.engine.updateSimulationControls(
      this.state.oilPreset,
      Number(flow),
      this.state.waterCutSetpointPct,
      this.state.entrainedGasInjection
    );
  }

  public onWaterCutChange(wc: number): void {
    if (!this.state) return;
    this.engine.updateSimulationControls(
      this.state.oilPreset,
      this.state.targetFlowSetpointKgHr,
      Number(wc),
      this.state.entrainedGasInjection
    );
  }

  public toggleGasSlug(): void {
    if (!this.state) return;
    this.engine.updateSimulationControls(
      this.state.oilPreset,
      this.state.targetFlowSetpointKgHr,
      this.state.waterCutSetpointPct,
      !this.state.entrainedGasInjection
    );
  }

  public resetTotalizers(): void {
    if (!this.engine.resetTotalizers()) {
      alert('Hardware Write-Protect is ON. Unlock Write-Protect in top bar to reset totalizers.');
    }
  }

  private buildChartPolylines(s: TransmitterDeviceState): void {
    const pts = s.historian;
    if (!pts.length) return;
    const stepX = pts.length > 1 ? 800 / (pts.length - 1) : 800;

    this.massFlowPoints = pts
      .map((p, idx) => {
        const x = +(idx * stepX).toFixed(1);
        const y = +(165 - Math.min(1, p.massFlowKgHr / 100000) * 145).toFixed(1);
        return `${x},${y}`;
      })
      .join(' ');

    this.netOilPoints = pts
      .map((p, idx) => {
        const x = +(idx * stepX).toFixed(1);
        const y = +(165 - Math.min(1, p.netOilBblDay / 18000) * 145).toFixed(1);
        return `${x},${y}`;
      })
      .join(' ');
  }
}
