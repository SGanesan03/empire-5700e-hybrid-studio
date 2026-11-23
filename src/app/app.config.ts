import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { UpgradeModule } from '@angular/upgrade/static';
import { routes } from './app.routes';
import { LEGACY_MODULE_NAME } from './legacy-angularjs/empire-legacy-5700.module';

export function bootstrapAngularJsHybrid(upgrade: UpgradeModule) {
  return () => {
    upgrade.bootstrap(document.body, [LEGACY_MODULE_NAME], { strictDi: false });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    importProvidersFrom(UpgradeModule),
    {
      provide: APP_INITIALIZER,
      useFactory: bootstrapAngularJsHybrid,
      deps: [UpgradeModule],
      multi: true
    }
  ]
};
