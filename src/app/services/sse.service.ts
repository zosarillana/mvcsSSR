import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService implements OnDestroy {
  private eventSource: EventSource | null = null;  // Allow null type
  private messageSubject = new Subject<MessageEvent>();

  constructor() {
    this.connect();  // Establish the connection on service instantiation
  }

  private connect() {
    // Replace with your API URL for SSE
    this.eventSource = new EventSource('/api/api/sse/subscribe');

    this.eventSource.onmessage = (event) => {
      this.messageSubject.next(event); // Emit the received message
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource?.close(); // Close the connection on error
      this.eventSource = null; // Reset eventSource
      // Optionally, you could implement reconnection logic here
    };
  }

  get messages$() {
    return this.messageSubject.asObservable(); // Expose the message stream as an observable
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close(); // Ensure the connection is closed
    }
  }
}
