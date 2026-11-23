export type NamurStatus = 'GOOD' | 'MAINTENANCE_REQUIRED' | 'CHECK_FUNCTION' | 'FAILURE';

export type OilGradePreset =
  | 'WTI_CRUDE_API_39'
  | 'BRENT_CRUDE_API_38'
  | 'HEAVY_BITUMEN_API_14'
  | 'DIESEL_ULSD_API_36'
  | 'TWO_PHASE_SLUG_FLOW';

export interface ProcessVariables {
  massFlowKgPerHr: number;
  volumeFlowBblPerDay: number;
  standardVolumeBblPerDay: number; // Net Oil API MPMS Ch.11.1 temperature-corrected
  netOilFlowBblPerDay: number;
  waterCutPercent: number;
  densityKgPerM3: number;
  apiGravity: number;
  processTempC: number;
  linePressureBar: number;
  driveGainPercent: number;
  leftPickoffMv: number;
  rightPickoffMv: number;
  boardTempC: number;
  massTotalizerTonnes: number;
  netOilTotalizerBbl: number;
}

export interface ChannelConfig {
  id: string;
  terminal: string;
  channelType: 'mA Output (4-20mA)' | 'Frequency / Pulse' | 'Discrete Output' | 'EtherNet/IP Assembly';
  assignedVariable: string;
  lrv: number;
  urv: number;
  dampingSec: number;
  faultAction: 'Downscale (3.6mA)' | 'Upscale (21.5mA)' | 'Last Valid Value';
  loopCurrentMa: number;
}

export interface SmvDiagnosticRecord {
  id: string;
  timestamp: string;
  result: 'PASS' | 'WARNING' | 'FAIL';
  tubeStiffnessDeviationPct: number;
  zeroStabilityStatus: 'OK' | 'DRIFT_DETECTED';
  driveGainAtTest: number;
  notes: string;
}

export interface DeviceAlert {
  id: string;
  code: string;
  namurCategory: NamurStatus;
  title: string;
  description: string;
  recommendedAction: string;
  timestamp: string;
  active: boolean;
  acknowledged: boolean;
}

export interface HistorianPoint {
  timestamp: string;
  massFlowKgHr: number;
  netOilBblDay: number;
  densityKgM3: number;
  tempC: number;
  driveGainPct: number;
}

export interface ModbusRegisterRow {
  register: number;
  addressHex: string;
  parameterName: string;
  dataType: 'FLOAT32' | 'UINT32' | 'INT16';
  rawHex: string;
  scaledValue: string;
  unit: string;
}

export interface TransmitterDeviceState {
  deviceTag: string;
  serialNumber: string;
  model: string;
  sensorModel: string;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  protocol: 'EtherNet/IP + Modbus TCP' | 'PROFINET IO';
  writeProtected: boolean;
  simulationRunning: boolean;
  oilPreset: OilGradePreset;
  targetFlowSetpointKgHr: number;
  waterCutSetpointPct: number;
  entrainedGasInjection: boolean;
  namurStatus: NamurStatus;
  pv: ProcessVariables;
  channels: ChannelConfig[];
  smvHistory: SmvDiagnosticRecord[];
  alerts: DeviceAlert[];
  historian: HistorianPoint[];
  modbusRegisters: ModbusRegisterRow[];
}
