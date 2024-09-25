import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | undefined;
  private messagesSubject = new Subject<string>();

  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    // Initialize the WebSocket connection
    this.connect();
  }

  private connect(): void {
    // Replace with your WebSocket URL
    const wsUrl = 'https://localhost:7296'; // Example WebSocket URL
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.socket.onmessage = (event) => {
      this.messagesSubject.next(event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
      // Optionally, reconnect or handle disconnection
      setTimeout(() => this.connect(), 7296);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }
}
