import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import {
  ChannelConfig,
  DeviceAlert,
  HistorianPoint,
  ModbusRegisterRow,
  NamurStatus,
  OilGradePreset,
  SmvDiagnosticRecord,
  TransmitterDeviceState
} from '../models/transmitter.models';

@Injectable({ providedIn: 'root' })
export class TransmitterEngineService implements OnDestroy {
  private readonly initialState: TransmitterDeviceState = {
    deviceTag: 'FT-5700-CRUDE-01',
    serialNumber: '14982710-EMR',
    model: 'Micro Motion 5700-E (Ethernet Field Mount)',
    sensorModel: 'CMF300M Elite Coriolis (3-inch / DN80)',
    firmwareVersion: 'v05.04.02 (Web UI v2.18)',
    ipAddress: '192.168.140.57',
    macAddress: '00:0C:E7:57:00:1E',
    protocol: 'EtherNet/IP + Modbus TCP',
    writeProtected: false,
    simulationRunning: true,
    oilPreset: 'WTI_CRUDE_API_39',
    targetFlowSetpointKgHr: 42500,
    waterCutSetpointPct: 4.2,
    entrainedGasInjection: false,
    namurStatus: 'GOOD',
    pv: {
      massFlowKgPerHr: 42512.4,
      volumeFlowBblPerDay: 7784.2,
      standardVolumeBblPerDay: 7692.8,
      netOilFlowBblPerDay: 7369.7,
      waterCutPercent: 4.2,
      densityKgPerM3: 829.6,
      apiGravity: 39.06,
      processTempC: 34.8,
      linePressureBar: 18.4,
      driveGainPercent: 16.4,
      leftPickoffMv: 412.5,
      rightPickoffMv: 410.8,
      boardTempC: 41.2,
      massTotalizerTonnes: 18429.64,
      netOilTotalizerBbl: 129482.5
    },
    channels: [
      {
        id: 'ch-1',
        terminal: 'Ch A (Terminals 1/2)',
        channelType: 'mA Output (4-20mA)',
        assignedVariable: 'Mass Flow Rate',
        lrv: 0,
        urv: 60000,
        dampingSec: 0.8,
        faultAction: 'Downscale (3.6mA)',
        loopCurrentMa: 15.34
      },
      {
        id: 'ch-2',
        terminal: 'Ch B (Terminals 3/4)',
        channelType: 'mA Output (4-20mA)',
        assignedVariable: 'Line Density',
        lrv: 700,
        urv: 1100,
        dampingSec: 1.2,
        faultAction: 'Downscale (3.6mA)',
        loopCurrentMa: 9.18
      },
      {
        id: 'ch-3',
        terminal: 'Ch C (Terminals 5/6)',
        channelType: 'Frequency / Pulse',
        assignedVariable: 'Net Oil Volume Totalizer',
        lrv: 0,
        urv: 10000,
        dampingSec: 0.2,
        faultAction: 'Last Valid Value',
        loopCurrentMa: 0
      },
      {
        id: 'ch-4',
        terminal: 'RJ45 Port 1/2 (DLR)',
        channelType: 'EtherNet/IP Assembly',
        assignedVariable: 'Input Assembly 101 (32-Byte Cyclic)',
        lrv: 0,
        urv: 100,
        dampingSec: 0.1,
        faultAction: 'Last Valid Value',
        loopCurrentMa: 0
      }
    ],
    smvHistory: [
      {
        id: 'smv-104',
        timestamp: '2026-11-23 14:15:00',
        result: 'PASS',
        tubeStiffnessDeviationPct: 0.18,
        zeroStabilityStatus: 'OK',
        driveGainAtTest: 16.2,
        notes: 'Sensor tube structural integrity verified within ±1.0% factory baseline.'
      },
      {
        id: 'smv-103',
        timestamp: '2026-11-16 09:00:00',
        result: 'PASS',
        tubeStiffnessDeviationPct: 0.14,
        zeroStabilityStatus: 'OK',
        driveGainAtTest: 15.9,
        notes: 'Scheduled weekly custody-transfer verification passed.'
      },
      {
        id: 'smv-102',
        timestamp: '2026-11-09 09:00:00',
        result: 'WARNING',
        tubeStiffnessDeviationPct: 0.89,
        zeroStabilityStatus: 'OK',
        driveGainAtTest: 48.5,
        notes: 'Transient two-phase gas bubble slug detected during verification.'
      }
    ],
    alerts: [
      {
        id: 'al-201',
        code: 'A105',
        namurCategory: 'CHECK_FUNCTION',
        title: 'Two-Phase Flow / Entrained Gas Detected',
        description: 'Coriolis drive gain exceeded 45% threshold due to gas breakout in crude line.',
        recommendedAction: 'Check upstream separator backpressure valve and verify degassing boot.',
        timestamp: '16:40:12',
        active: false,
        acknowledged: true
      },
      {
        id: 'al-202',
        code: 'A033',
        namurCategory: 'MAINTENANCE_REQUIRED',
        title: 'Smart Meter Verification Due Soon',
        description: 'Custody transfer audit interval approaching 7-day verification reminder.',
        recommendedAction: 'Execute Smart Meter Verification (SMV) under Service & Diagnostics.',
        timestamp: '12:05:44',
        active: true,
        acknowledged: false
      },
      {
        id: 'al-203',
        code: 'A004',
        namurCategory: 'FAILURE',
        title: 'Sensor Pickoff Signal Saturation / Tube Fault',
        description: 'Left/Right pickoff voltage imbalance exceeds hardware diagnostic limit.',
        recommendedAction: 'Inspect 9-wire core processor cable and run SMV structural test.',
        timestamp: '08:12:19',
        active: false,
        acknowledged: true
      }
    ],
    historian: [],
    modbusRegisters: []
  };

  private readonly stateSubject = new BehaviorSubject<TransmitterDeviceState>(this.buildSeededState());
  public readonly state$ = this.stateSubject.asObservable();

  private simSub?: Subscription;
  private tickCounter = 0;

  constructor() {
    this.startLiveTelemetryLoop();
  }

  ngOnDestroy(): void {
    this.simSub?.unsubscribe();
  }

  private buildSeededState(): TransmitterDeviceState {
    const s = structuredClone(this.initialState);
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const ts = new Date(now - i * 4000).toLocaleTimeString('en-GB', { hour12: false });
      const jitter = Math.sin(i * 0.6) * 260;
      const mf = +(42500 + jitter).toFixed(1);
      const netOil = +((mf / 829.6) * 0.15095 * (1 - 0.042)).toFixed(1);
      s.historian.push({
        timestamp: ts,
        massFlowKgHr: mf,
        netOilBblDay: netOil,
        densityKgM3: +(829.6 + Math.cos(i * 0.4) * 0.4).toFixed(2),
        tempC: +(34.8 + Math.sin(i * 0.3) * 0.15).toFixed(2),
        driveGainPct: +(16.4 + Math.abs(Math.sin(i * 0.5)) * 1.4).toFixed(1)
      });
    }
    s.modbusRegisters = this.computeModbusMap(s);
    return s;
  }

  private startLiveTelemetryLoop(): void {
    this.simSub = interval(1200).subscribe(() => {
      const current = this.stateSubject.getValue();
      if (!current.simulationRunning) return;

      this.tickCounter++;
      const next = structuredClone(current);
      const presetSpec = this.getOilPresetSpecs(next.oilPreset);

      // Realistic sensor noise + physics calculations
      const flowNoise = (Math.random() - 0.5) * 180;
      const massFlow = Math.max(0, +(next.targetFlowSetpointKgHr + flowNoise).toFixed(1));
      const tempC = +(presetSpec.baseTempC + Math.sin(this.tickCounter * 0.25) * 0.25).toFixed(2);

      // Gas slug injection physics: drops apparent density & spikes drive gain + pickoff jitter
      const gasActive = next.entrainedGasInjection || next.oilPreset === 'TWO_PHASE_SLUG_FLOW';
      const gasDensityDrop = gasActive ? 58 + Math.random() * 26 : 0;
      const density = +(presetSpec.baseDensity - gasDensityDrop + (Math.random() - 0.5) * 0.35).toFixed(2);
      const apiGravity = +((141.5 / (density / 1000)) - 131.5).toFixed(2);

      // Volume conversion: 1 m3 = 6.28981 bbl; kg/hr -> m3/hr -> bbl/day
      const m3PerHr = density > 0 ? massFlow / density : 0;
      const grossBblDay = +(m3PerHr * 6.28981 * 24).toFixed(1);

      // API MPMS Ch.11.1 Thermal Volume Correction Factor (CTL to 15°C)
      const ctl = Math.max(0.92, 1 - 0.00082 * (tempC - 15));
      const stdBblDay = +(grossBblDay * ctl).toFixed(1);
      const waterCut = next.waterCutSetpointPct;
      const netOilBblDay = +(stdBblDay * (1 - waterCut / 100)).toFixed(1);

      const driveGain = gasActive
        ? +(68.0 + Math.random() * 21.5).toFixed(1)
        : +(15.8 + (massFlow / 100000) * 8 + Math.random() * 1.1).toFixed(1);

      const leftMv = gasActive ? +(285 + Math.random() * 45).toFixed(1) : +(412 + (Math.random() - 0.5) * 2).toFixed(1);
      const rightMv = gasActive ? +(279 + Math.random() * 48).toFixed(1) : +(410.5 + (Math.random() - 0.5) * 2).toFixed(1);

      // Increment totalizers
      const deltaHours = 1.2 / 3600;
      next.pv = {
        massFlowKgPerHr: massFlow,
        volumeFlowBblPerDay: grossBblDay,
        standardVolumeBblPerDay: stdBblDay,
        netOilFlowBblPerDay: netOilBblDay,
        waterCutPercent: waterCut,
        densityKgPerM3: density,
        apiGravity,
        processTempC: tempC,
        linePressureBar: +(18.2 + Math.sin(this.tickCounter * 0.2) * 0.35).toFixed(2),
        driveGainPercent: driveGain,
        leftPickoffMv: leftMv,
        rightPickoffMv: rightMv,
        boardTempC: +(41.0 + Math.sin(this.tickCounter * 0.1) * 0.4).toFixed(1),
        massTotalizerTonnes: +(next.pv.massTotalizerTonnes + (massFlow / 1000) * deltaHours).toFixed(4),
        netOilTotalizerBbl: +(next.pv.netOilTotalizerBbl + (netOilBblDay / 24) * deltaHours).toFixed(3)
      };

      // Update 4-20mA analog channels
      next.channels.forEach(ch => {
        if (ch.channelType === 'mA Output (4-20mA)') {
          const val = ch.assignedVariable === 'Mass Flow Rate' ? massFlow : density;
          const span = Math.max(1, ch.urv - ch.lrv);
          const pct = Math.min(1.05, Math.max(0, (val - ch.lrv) / span));
          ch.loopCurrentMa = +(4 + pct * 16).toFixed(2);
        }
      });

      // Evaluate NAMUR NE107 Health Status & Alarms
      const twoPhaseAlert = next.alerts.find(a => a.code === 'A105');
      if (twoPhaseAlert) {
        twoPhaseAlert.active = driveGain > 45;
        if (driveGain > 45) {
          twoPhaseAlert.timestamp = this.nowStr();
        }
      }
      next.namurStatus = this.computeNamurStatus(next.alerts);

      // Append Historian sample
      next.historian.push({
        timestamp: this.nowStr(),
        massFlowKgHr: massFlow,
        netOilBblDay: netOilBblDay,
        densityKgM3: density,
        tempC: tempC,
        driveGainPct: driveGain
      });
      if (next.historian.length > 40) {
        next.historian.shift();
      }

      next.modbusRegisters = this.computeModbusMap(next);
      this.stateSubject.next(next);
    });
  }

  private getOilPresetSpecs(preset: OilGradePreset): { baseDensity: number; baseTempC: number } {
    switch (preset) {
      case 'BRENT_CRUDE_API_38':
        return { baseDensity: 834.5, baseTempC: 31.5 };
      case 'HEAVY_BITUMEN_API_14':
        return { baseDensity: 972.0, baseTempC: 68.0 };
      case 'DIESEL_ULSD_API_36':
        return { baseDensity: 844.0, baseTempC: 27.0 };
      case 'TWO_PHASE_SLUG_FLOW':
        return { baseDensity: 825.0, baseTempC: 36.2 };
      case 'WTI_CRUDE_API_39':
      default:
        return { baseDensity: 829.6, baseTempC: 34.8 };
    }
  }

  private computeNamurStatus(alerts: DeviceAlert[]): NamurStatus {
    if (alerts.some(a => a.active && a.namurCategory === 'FAILURE')) return 'FAILURE';
    if (alerts.some(a => a.active && a.namurCategory === 'CHECK_FUNCTION')) return 'CHECK_FUNCTION';
    if (alerts.some(a => a.active && a.namurCategory === 'MAINTENANCE_REQUIRED')) return 'MAINTENANCE_REQUIRED';
    return 'GOOD';
  }

  private computeModbusMap(s: TransmitterDeviceState): ModbusRegisterRow[] {
    const floatToHex = (val: number): string => {
      const buf = new ArrayBuffer(4);
      new DataView(buf).setFloat32(0, val, false);
      return '0x' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
    };

    return [
      { register: 40247, addressHex: '0x00F6', parameterName: 'Mass Flow Rate', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.massFlowKgPerHr), scaledValue: s.pv.massFlowKgPerHr.toFixed(1), unit: 'kg/h' },
      { register: 40249, addressHex: '0x00F8', parameterName: 'Line Density', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.densityKgPerM3), scaledValue: s.pv.densityKgPerM3.toFixed(2), unit: 'kg/m³' },
      { register: 40251, addressHex: '0x00FA', parameterName: 'Process Temperature', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.processTempC), scaledValue: s.pv.processTempC.toFixed(2), unit: '°C' },
      { register: 40253, addressHex: '0x00FC', parameterName: 'Gross Volume Flow', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.volumeFlowBblPerDay), scaledValue: s.pv.volumeFlowBblPerDay.toFixed(1), unit: 'bbl/d' },
      { register: 40255, addressHex: '0x00FE', parameterName: 'Net Oil Flow (API 11.1)', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.netOilFlowBblPerDay), scaledValue: s.pv.netOilFlowBblPerDay.toFixed(1), unit: 'bbl/d' },
      { register: 40257, addressHex: '0x0100', parameterName: 'API Gravity @ 60°F', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.apiGravity), scaledValue: s.pv.apiGravity.toFixed(2), unit: '°API' },
      { register: 40259, addressHex: '0x0102', parameterName: 'Tube Drive Gain', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.driveGainPercent), scaledValue: s.pv.driveGainPercent.toFixed(1), unit: '%' },
      { register: 40261, addressHex: '0x0104', parameterName: 'Net Oil Totalizer', dataType: 'FLOAT32', rawHex: floatToHex(s.pv.netOilTotalizerBbl), scaledValue: s.pv.netOilTotalizerBbl.toFixed(2), unit: 'bbl' }
    ];
  }

  // Interactive Controls & Mutations
  public toggleSimulation(running: boolean): void {
    const next = structuredClone(this.stateSubject.getValue());
    next.simulationRunning = running;
    this.stateSubject.next(next);
  }

  public toggleWriteProtect(): void {
    const next = structuredClone(this.stateSubject.getValue());
    next.writeProtected = !next.writeProtected;
    this.stateSubject.next(next);
  }

  public updateSimulationControls(preset: OilGradePreset, flowKgHr: number, waterCutPct: number, gasSlug: boolean): void {
    const next = structuredClone(this.stateSubject.getValue());
    next.oilPreset = preset;
    next.targetFlowSetpointKgHr = Math.max(0, Math.min(120000, flowKgHr));
    next.waterCutSetpointPct = Math.max(0, Math.min(95, waterCutPct));
    next.entrainedGasInjection = gasSlug;
    this.stateSubject.next(next);
  }

  public updateChannelConfig(updatedChannel: ChannelConfig): boolean {
    const current = this.stateSubject.getValue();
    if (current.writeProtected) return false;
    const next = structuredClone(current);
    const idx = next.channels.findIndex(c => c.id === updatedChannel.id);
    if (idx >= 0) {
      next.channels[idx] = { ...updatedChannel };
      this.stateSubject.next(next);
      return true;
    }
    return false;
  }

  public updateDeviceIdentity(deviceTag: string, protocol: TransmitterDeviceState['protocol']): boolean {
    const current = this.stateSubject.getValue();
    if (current.writeProtected) return false;
    const next = structuredClone(current);
    next.deviceTag = deviceTag.trim() || next.deviceTag;
    next.protocol = protocol;
    this.stateSubject.next(next);
    return true;
  }

  public runSmartMeterVerification(): SmvDiagnosticRecord {
    const next = structuredClone(this.stateSubject.getValue());
    const highDrive = next.pv.driveGainPercent > 45;
    const stiffnessDev = highDrive ? +(0.95 + Math.random() * 0.4).toFixed(2) : +(0.12 + Math.random() * 0.14).toFixed(2);
    const result: SmvDiagnosticRecord['result'] = stiffnessDev > 1.0 ? 'FAIL' : highDrive ? 'WARNING' : 'PASS';

    const record: SmvDiagnosticRecord = {
      id: 'smv-' + Math.floor(105 + Math.random() * 890),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result,
      tubeStiffnessDeviationPct: stiffnessDev,
      zeroStabilityStatus: stiffnessDev > 1.0 ? 'DRIFT_DETECTED' : 'OK',
      driveGainAtTest: next.pv.driveGainPercent,
      notes:
        result === 'PASS'
          ? 'Smart Meter Verification passed. Tube stiffness & zero calibration match factory signature.'
          : 'Elevated drive gain detected during SMV sweep. Stabilize multiphase gas before re-test.'
    };

    next.smvHistory.unshift(record);
    // Clear due-soon alert on successful SMV
    if (result === 'PASS') {
      const dueAlert = next.alerts.find(a => a.code === 'A033');
      if (dueAlert) {
        dueAlert.active = false;
        dueAlert.acknowledged = true;
      }
      next.namurStatus = this.computeNamurStatus(next.alerts);
    }
    this.stateSubject.next(next);
    return record;
  }

  public resetTotalizers(): boolean {
    const current = this.stateSubject.getValue();
    if (current.writeProtected) return false;
    const next = structuredClone(current);
    next.pv.massTotalizerTonnes = 0;
    next.pv.netOilTotalizerBbl = 0;
    this.stateSubject.next(next);
    return true;
  }

  public acknowledgeAlert(alertId: string): void {
    const next = structuredClone(this.stateSubject.getValue());
    const al = next.alerts.find(a => a.id === alertId);
    if (al) {
      al.acknowledged = true;
      if (al.code === 'A033') al.active = false;
      next.namurStatus = this.computeNamurStatus(next.alerts);
      this.stateSubject.next(next);
    }
  }

  public exportHistorianCsv(): void {
    const current = this.stateSubject.getValue();
    const header = 'Timestamp,MassFlow_kg_hr,NetOil_bbl_d,Density_kg_m3,Temp_C,DriveGain_pct\n';
    const rows = current.historian
      .map(h => `${h.timestamp},${h.massFlowKgHr},${h.netOilBblDay},${h.densityKgM3},${h.tempC},${h.driveGainPct}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.deviceTag}_historian.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private nowStr(): string {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  }
}
