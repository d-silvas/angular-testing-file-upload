import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpProgressEvent, HttpClient, HttpEventType } from '@angular/common/http';

import { UploadService } from './upload.service';
import { of } from 'rxjs';
import { skipWhile } from 'rxjs/operators';
import { MultifileUploadService, FileUploadStatus } from './multifile-upload.service';

const files = [
  new File(['first'], 'first.txt', {
    type: 'text/plain',
  }),
  new File(['second'], 'second.txt', {
    type: 'text/plain',
  }),
];

describe('MultifileUploadService - Completed HTTP responses', () => {
  let http: HttpTestingController;
  let service: MultifileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });

    http = TestBed.get(HttpTestingController);
    service = TestBed.get(MultifileUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#upload should upload multiple files to a specified url, and return a status of "ok"', () => {
    const filesUploadStatus = service.upload(files);

    files.forEach(file => {
      expect(filesUploadStatus.hasOwnProperty(file.name)).toBe(true);
      // Note: we will always receive first a "progress 0" response so we need to skip it
      filesUploadStatus[file.name].pipe(
        skipWhile(
          (fileStatus: FileUploadStatus) => fileStatus.progress === 0
        )
      ).subscribe(
        (fileStatus: FileUploadStatus) => {
          expect(fileStatus.status).toEqual('ok');
          expect(fileStatus.progress).toEqual(100);
        }
      );
    });

    const requests = http.match(service.url);
    expect(requests.length).toEqual(files.length, 'should fire one request for each file');
    // Return any normal HttpResponse. The service will interpret it as a successful upload
    requests[0].flush({}, { status: 200, statusText: 'OK' });
    requests[1].flush({}, { status: 200, statusText: 'OK' });
  });

  it('#upload should return a status of "failed" and progres of "100" for any file that failed upload', () => {
    const filesUploadStatus = service.upload(files);

    files.forEach(file => {
      expect(filesUploadStatus.hasOwnProperty(file.name)).toBe(true);
      filesUploadStatus[file.name].pipe(
        skipWhile(
          (fileStatus: FileUploadStatus) => fileStatus.progress === 0
        )
      ).subscribe(
        (fileStatus: FileUploadStatus) => {
          expect(fileStatus.status).toEqual('failed');
          expect(fileStatus.progress).toEqual(100);
        }
      );
    });

    const requests = http.match(service.url);
    expect(requests.length).toEqual(files.length, 'should fire one request for each file');
    requests[0].flush({}, { status: 404, statusText: 'Not Found' });
    requests[1].flush({}, { status: 500, statusText: 'Internal Server Error' });
  });

});

describe('MultifileUploadService - Progress HTTP response', () => {
  const mockHttp = {
    request: jasmine.createSpy('request')
  };

  let service: MultifileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttp }
      ]
    });

    service = TestBed.get(UploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#upload should report the progress of the file upload', (done: DoneFn) => {
    mockHttp.request.and.returnValue(
      of({ type: HttpEventType.UploadProgress, loaded: 7, total: 10 } as HttpEvent<HttpProgressEvent>)
    );

    const filesUploadStatus = service.upload([ files[0] ]);

    expect(filesUploadStatus.hasOwnProperty(files[0].name)).toBe(true);
    filesUploadStatus[files[0].name].subscribe(
      (fileStatus: FileUploadStatus) => {
        expect(fileStatus.status).toEqual('ok');
        expect(fileStatus.progress).toEqual(70);
        done();
      }
    );
  });
});
