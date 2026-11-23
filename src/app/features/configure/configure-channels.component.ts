import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelConfig, TransmitterDeviceState } from '../../core/models/transmitter.models';
import { TransmitterEngineService } from '../../core/services/transmitter-engine.service';
import { LegacyModbusMatrixWrapperDirective } from '../../legacy-angularjs/empire-legacy-5700.module';

@Component({
  selector: 'emr-configure-channels',
  standalone: true,
  imports: [CommonModule, FormsModule, LegacyModbusMatrixWrapperDirective],
  templateUrl: './configure-channels.component.html',
  styleUrls: ['./configure-channels.component.scss']
})
export class ConfigureChannelsComponent implements OnInit {
  public state?: TransmitterDeviceState;
  public editableChannels: ChannelConfig[] = [];
  public editTag = '';
  public editProtocol: TransmitterDeviceState['protocol'] = 'EtherNet/IP + Modbus TCP';
  public statusBanner = '';

  constructor(private engine: TransmitterEngineService) {}

  ngOnInit(): void {
    this.engine.state$.subscribe(s => {
      const firstInit = !this.state;
      this.state = s;
      if (firstInit) {
        this.editTag = s.deviceTag;
        this.editProtocol = s.protocol;
        this.editableChannels = structuredClone(s.channels);
      } else {
        // Keep live mA current updated without overwriting user inputs
        this.editableChannels.forEach(ec => {
          const live = s.channels.find(c => c.id === ec.id);
          if (live) ec.loopCurrentMa = live.loopCurrentMa;
        });
      }
    });
  }

  public saveIdentity(): void {
    if (this.engine.updateDeviceIdentity(this.editTag, this.editProtocol)) {
      this.flashStatus(`Updated device tag to "${this.editTag}" (${this.editProtocol})`);
    }
  }

  public saveChannel(ch: ChannelConfig): void {
    if (this.engine.updateChannelConfig(ch)) {
      this.flashStatus(`Saved configuration for ${ch.terminal}`);
    }
  }

  private flashStatus(msg: string): void {
    this.statusBanner = msg;
    setTimeout(() => (this.statusBanner = ''), 3000);
  }
}
