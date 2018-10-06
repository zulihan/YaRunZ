/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Geo.serviceService } from './geo.service';

describe('Service: Geo.service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Geo.serviceService]
    });
  });

  it('should ...', inject([Geo.serviceService], (service: Geo.serviceService) => {
    expect(service).toBeTruthy();
  }));
});
