import * as angular from 'angular';
import { Directive, ElementRef, Injector, Input, OnChanges } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { ModbusRegisterRow } from '../core/models/transmitter.models';

export const LEGACY_MODULE_NAME = 'empire5700LegacyRegistersApp';

export function registerLegacy5700Module(): void {
  const existingModules = (angular as any).module;
  try {
    existingModules(LEGACY_MODULE_NAME);
    return;
  } catch {
    // Module not yet registered; register now
  }

  angular
    .module(LEGACY_MODULE_NAME, [])
    .controller('LegacyModbusController', [
      '$scope',
      function ($scope: any) {
        $scope.filterQuery = '';
        $scope.endianMode = 'BIG_ENDIAN_ABCD';
        $scope.angularJsVersion = angular.version.full;

        $scope.toggleEndian = function () {
          $scope.endianMode =
            $scope.endianMode === 'BIG_ENDIAN_ABCD' ? 'WORD_SWAPPED_CDAB' : 'BIG_ENDIAN_ABCD';
        };

        $scope.matchesFilter = function (row: ModbusRegisterRow) {
          if (!$scope.filterQuery) return true;
          const q = $scope.filterQuery.toLowerCase();
          return (
            row.parameterName.toLowerCase().includes(q) ||
            String(row.register).includes(q) ||
            row.addressHex.toLowerCase().includes(q)
          );
        };
      }
    ])
    .component('empLegacyModbusMatrix', {
      bindings: {
        registers: '<',
        ipAddress: '<',
        protocol: '<'
      },
      controller: 'LegacyModbusController',
      template: `
        <div class="ajs-box">
          <div class="ajs-banner">
            <div>
              <span class="ajs-pill">AngularJS v{{$ctrl.angularJsVersion}} Legacy Firmware Module</span>
              <strong>EtherNet/IP &amp; Modbus TCP Cyclic Register Map ({{$ctrl.ipAddress}})</strong>
            </div>
            <div class="ajs-controls">
              <input type="text" ng-model="filterQuery" placeholder="Filter register / name..." />
              <button type="button" class="ajs-btn" ng-click="toggleEndian()">
                Byte Order: {{endianMode}}
              </button>
            </div>
          </div>

          <div class="ajs-table-wrap">
            <table class="ajs-table">
              <thead>
                <tr>
                  <th>Modbus Reg</th>
                  <th>Hex Addr</th>
                  <th>5700-E Parameter</th>
                  <th>Data Type</th>
                  <th>Raw IEEE-754 Hex</th>
                  <th>Live Scaled Value</th>
                  <th>Eng Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr ng-repeat="row in $ctrl.registers | filter:matchesFilter track by row.register">
                  <td class="mono reg">{{row.register}}</td>
                  <td class="mono muted">{{row.addressHex}}</td>
                  <td class="param">{{row.parameterName}}</td>
                  <td class="mono type">{{row.dataType}}</td>
                  <td class="mono hex">{{row.rawHex}}</td>
                  <td class="mono val">{{row.scaledValue}}</td>
                  <td class="muted">{{row.unit}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    });
}

@Directive({
  selector: 'emp-legacy-modbus-matrix',
  standalone: true
})
export class LegacyModbusMatrixWrapperDirective extends UpgradeComponent implements OnChanges {
  @Input() registers: ModbusRegisterRow[] = [];
  @Input() ipAddress = '';
  @Input() protocol = '';

  constructor(elementRef: ElementRef, injector: Injector) {
    super('empLegacyModbusMatrix', elementRef, injector);
  }
}
