/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RunnerService } from './runner.service';

describe('Service: Runner', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RunnerService]
    });
  });

  it('should ...', inject([RunnerService], (service: RunnerService) => {
    expect(service).toBeTruthy();
  }));
});
