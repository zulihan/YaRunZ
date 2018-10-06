/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RunzService } from './runz.service';

describe('Service: Runz', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RunzService]
    });
  });

  it('should ...', inject([RunzService], (service: RunzService) => {
    expect(service).toBeTruthy();
  }));
});
