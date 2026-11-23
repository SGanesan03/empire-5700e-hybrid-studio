import { TestBed } from '@angular/core/testing';
import { TransmitterEngineService } from './transmitter-engine.service';

describe('TransmitterEngineService', () => {
  let service: TransmitterEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransmitterEngineService]
    });
    service = TestBed.inject(TransmitterEngineService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize with Micro Motion 5700-E state and run SMV verification', () => {
    const record = service.runSmartMeterVerification();
    expect(record).toBeTruthy();
    expect(['PASS', 'WARNING', 'FAIL']).toContain(record.result);
  });

  it('should block totalizer reset when hardware write-protect is enabled', () => {
    service.toggleWriteProtect();
    const allowed = service.resetTotalizers();
    expect(allowed).toBeFalse();
  });
});
