import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  public url = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) {}

  public upload(file: File): Observable<number> {
    // Create a request including the file
    const req = new HttpRequest('POST', this.url, file, {
      reportProgress: true
    });

    // Use a subject to keep track of the status
    const progress = new BehaviorSubject<number>(0);

    // Send the request to the server and subscribe for updates
    this.http.request(req).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          // Report progress
          progress.next(Math.round(100 * event.loaded / event.total));
        } else if (event instanceof HttpResponse) {
          // Report progress and complete the Observable
          progress.next(100);
          progress.complete();
        }
      }
    );

    return progress.asObservable();
  }
}