# Emerson Micro Motion 5700-E Transmitter — Hybrid Angular 18 + AngularJS 1.8 Web UI

An enterprise-grade embedded transmitter web interface replicating **Emerson's Micro Motion 5700-E Coriolis Oil Flow Transmitter**, built with a **Hybrid Angular 18 + AngularJS 1.8.3 (`@angular/upgrade/static`)** architecture, real-time Net Oil API MPMS Ch.11.1 physics simulation, Smart Meter Verification (SMV), and NAMUR NE107 diagnostics.

---

## 1. Hybrid Architecture (Angular 18 + AngularJS 1.8.3)
Real-world industrial device web servers (such as Emerson 5700-E firmware updates) incrementally migrated legacy **AngularJS 1.x** fieldbus register tables to modern **Angular** components using `ngUpgrade`:
- **Modern Angular 18 Standalone Views (`.html`, `.scss`, `.ts`, `.spec.ts`):**
  - `OverviewDashboardComponent`: Real-time Coriolis mass flow, API MPMS Ch.11.1 Net Oil volume flow, API gravity, drive gain, and interactive oil-grade/gas-slug simulation sliders.
  - `ConfigureChannelsComponent`: 4-20mA analog channel LRV/URV scaling, damping, and hardware write-protect enforcement.
  - `DiagnosticsSmvComponent`: In-situ **Smart Meter Verification (SMV)** tube stiffness check, NAMUR NE107 alarm acknowledgement, and CSV historian export.
- **Upgraded AngularJS 1.8.3 Component (`emr-legacy-modbus-matrix`):**
  - Located in `src/app/legacy-angularjs/emerson-legacy-5700.module.ts` and bridged into Angular 18 via `UpgradeComponent`, rendering live IEEE-754 hex & scaled EtherNet/IP / Modbus TCP registers (`40247–40261`) with `ng-repeat` filtering and endian byte-swap controls.

---

## 2. Local Run, Unit Tests & Git Deployment

### Local Development
```bash
npm install --no-audit --no-fund
npm start
```

### Unit Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
