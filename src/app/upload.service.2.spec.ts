import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UploadService } from './upload.service';
import { HttpEventType } from '@angular/common/http';
import { skipWhile } from 'rxjs/operators';

const file = new File(['sample'], 'sample.txt', { type: 'text/plain' });

describe('UploadService - Using req.event()', () => {
  let httpTestingController: HttpTestingController;
  let service: UploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

    httpTestingController  = TestBed.get(HttpTestingController);
    service = TestBed.get(UploadService);
  });

  it('#upload should report the progress of the file upload', (done: DoneFn) => {
    // Trigger the file upload and subscribe for results
    service.upload(file).pipe(
      // Discard the first response
      skipWhile((progress: number) => progress === 0)
    ).subscribe(
      (progress: number) => {
        // Define what we expect after receiving the progress response
        expect(progress).toEqual(70);
        done();
      }
    );

    // Match a request to service.url
    const req = httpTestingController.expectOne(service.url);
    expect(req.request.method).toEqual('POST');
    // Respond with a mocked UploadProgress HttpEvent
    req.event({ type: HttpEventType.UploadProgress, loaded: 7, total: 10 });
  });
});