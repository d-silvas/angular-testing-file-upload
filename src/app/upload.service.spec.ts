import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';
import { HttpClient, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

const file = new File(['sample'], 'sample.txt', { type: 'text/plain' });

describe('UploadService - Naive approach: mocking HttpClient', () => {
  // Build a mock object with a request() spy function
  const mockHttp = {
    request: jasmine.createSpy('request')
  };

  let service: UploadService;

  beforeEach(() => {
    // Inject the mock object into the component in lieu of HttpClient
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttp }
      ]
    });

    service = TestBed.get(UploadService);
  });

  it('#upload should report the progress of the file upload', (done: DoneFn) => {
    // Prepare our mocked service to return an HttpProgressEvent event of type UploadProgress
    mockHttp.request.and.returnValue(
      of({ type: HttpEventType.UploadProgress, loaded: 7, total: 10 } as HttpProgressEvent)
    );

    // Trigger the file upload and subscribe for results
    service.upload(file).pipe(
      // Discard the first response
      skipWhile((progress: number) => progress === 0)
    ).subscribe(
      (progress: number) => {
        // Define what we expect after receiving a progress response
        expect(progress).toEqual(70);
        done();
      }
    );
  });
});