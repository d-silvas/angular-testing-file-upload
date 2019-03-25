import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse
} from '@angular/common/http';

import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  public url = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) {}

  public upload(file: File): Observable<number> {
    // Create a http post request and pass the form. Tell it to report the upload progress
    const req = new HttpRequest('POST', this.url, file, {
      reportProgress: true
    });

    // Use a subject to keep track of the status
    const progress = new BehaviorSubject<number>(0);

    // Send the http request and subscribe for progress updates
    this.http.request(req).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          progress.next(Math.round(100 * event.loaded / event.total));
        } else if (event instanceof HttpResponse) {
          progress.next(100);
          progress.complete();
        }
      },
      error => {
        progress.next(100);
        progress.complete();
      }
    );

    return progress.asObservable();
  }
}
