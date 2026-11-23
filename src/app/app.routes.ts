import { Routes } from '@angular/router';
import { OverviewDashboardComponent } from './features/overview/overview-dashboard.component';
import { ConfigureChannelsComponent } from './features/configure/configure-channels.component';
import { DiagnosticsSmvComponent } from './features/diagnostics/diagnostics-smv.component';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewDashboardComponent },
  { path: 'configure', component: ConfigureChannelsComponent },
  { path: 'diagnostics', component: DiagnosticsSmvComponent },
  { path: '**', redirectTo: 'overview' }
];
