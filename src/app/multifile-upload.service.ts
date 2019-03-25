import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export class FileUploadStatus {
  constructor(
    public status: string,
    public progress: number
  ) {}
}

@Injectable({ providedIn: 'root' })
export class MultifileUploadService {
  public url = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) { }

  public upload(files: File[]): { [key: string]: Observable<FileUploadStatus> } {
    const fileStatuses: { [key: string]: Observable<FileUploadStatus> } = {};

    for (const file of files) {
      // Create new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // Create a http post request and pass the form. Tell it to report the upload progress
      const req = new HttpRequest('POST', this.url, formData, {
        reportProgress: true
      });

      // New subjects for every file
      const fileUploadStatus = new BehaviorSubject<FileUploadStatus>({ status: 'ok', progress: 0 });

      // send the http request and subscribe for progress updates
      this.http.request(req).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            fileUploadStatus.next({
              status: 'ok',
              progress: Math.round(100 * event.loaded / event.total)
            });
          } else if (event instanceof HttpResponse) {
            fileUploadStatus.next({
              status: 'ok',
              progress: 100
            });
            fileUploadStatus.complete();
          }
        },
        error => {
          fileUploadStatus.next({
            status: 'failed',
            progress: 100
          });
          fileUploadStatus.complete();
        }
      );

      // Save every progress-observable in a map of all observables
      fileStatuses[file.name] = fileUploadStatus.asObservable();
    }

    return fileStatuses;
  }

}
