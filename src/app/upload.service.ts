import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse
} from '@angular/common/http';

import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  public url = 'http://localhost:3000/upload';
  public progress = new Subject<number>();

  constructor(private http: HttpClient) {}

  getProgress() {
    return this.progress.asObservable();
  }

  public upload(file: File) {
    const req = new HttpRequest('POST', this.url, file, {
      reportProgress: true
    });

    this.http.request(req).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round((100 * event.loaded) / event.total);
        this.progress.next(percentDone);
      } else if (event instanceof HttpResponse) {
        this.progress.next(100);
        this.progress.complete();
      }
    });
  }
}
