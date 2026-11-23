import 'angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLegacy5700Module } from './app/legacy-angularjs/empire-legacy-5700.module';

// Register legacy AngularJS 1.8.3 module before Angular 18 bootstrap
registerLegacy5700Module();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    const safe = String(err).replace(/[\r\n]/g, ' ');
    console.error(safe);
  });
