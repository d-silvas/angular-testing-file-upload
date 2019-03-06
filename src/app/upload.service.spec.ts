import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UploadService } from './upload.service';
import { HttpClient, HttpEventType, HttpEvent, HttpProgressEvent } from '@angular/common/http';
import { of } from 'rxjs';

const file = new File(
  ['sample'],
  'sample.txt',
  {
    type: 'text/plain',
  }
);


describe('UploadService - Completed HTTP responses', () => {
  let httpTestingController: HttpTestingController;
  let uploadService: UploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });

    httpTestingController  = TestBed.get(HttpTestingController);
    uploadService = TestBed.get(UploadService);
  });

  it('should be created', () => {
    expect(uploadService).toBeTruthy();
  });

  it('#upload should upload one file to a specified url, and return a status of "ok"', (done: DoneFn) => {
    uploadService.upload(file);

    uploadService.getProgress().subscribe(
      (progress: number) => {
        expect(progress).toEqual(100);
      },
      (err) => {},
      () => {
        done();
      }
    );

    const req = httpTestingController.expectOne(uploadService.url);
    expect(req.request.method).toEqual('POST');
    // Return any normal HttpResponse. The service will interpret it as a successful upload
    req.flush({}, { status: 200, statusText: 'OK' });
  });

});

describe('UploadService - Progress HTTP response', () => {
  const mockHttp = {
    request: jasmine.createSpy('request')
  };

  let uploadService: UploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttp }
      ]
    });

    uploadService = TestBed.get(UploadService);
  });

  it('should be created', () => {
    expect(uploadService).toBeTruthy();
  });

  it('#upload should report the progress of the file upload', (done: DoneFn) => {
    mockHttp.request.and.returnValue(
      of({ type: HttpEventType.UploadProgress, loaded: 7, total: 10 } as HttpEvent<HttpProgressEvent>)
    );
    uploadService.upload(file);

    uploadService.getProgress().subscribe(
      (progress: number) => {
        expect(progress).toEqual(70);
        done();
      }
    );
  });
});
