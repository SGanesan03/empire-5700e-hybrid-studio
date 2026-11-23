import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TransmitterDeviceState } from './core/models/transmitter.models';
import { TransmitterEngineService } from './core/services/transmitter-engine.service';

@Component({
  selector: 'emp-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public state?: TransmitterDeviceState;

  constructor(public engine: TransmitterEngineService) {}

  ngOnInit(): void {
    this.engine.state$.subscribe(s => (this.state = s));
  }
}
