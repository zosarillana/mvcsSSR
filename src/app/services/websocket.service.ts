// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class WebSocketService {
//   private socket: WebSocket | undefined;
//   private messagesSubject = new Subject<string>();
  
//   // Expose observable for messages
//   public messages$ = this.messagesSubject.asObservable();

//   constructor() {
//     this.connect();
//   }

//   private connect(): void {
//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const host = window.location.host; // Use the current host
//     // Update this if your production WebSocket URL differs
//     const wsUrl = `${protocol}//${host}/ws`; // Adjust the path if necessary

//     console.log(`[WebSocket Debug] Attempting to connect to WebSocket at: ${wsUrl}`);
//     this.socket = new WebSocket(wsUrl);

//     this.socket.onmessage = (event) => {
//       console.log('[WebSocket Debug] Message received:', event.data);
//       this.messagesSubject.next(event.data);
//     };

//     this.socket.onclose = (event) => {
//       this.handleSocketClose(event);
//     };

//     this.socket.onerror = (error) => {
//       console.error('[WebSocket Debug] Encountered an error:', error);
//     };
//   }

//   private handleSocketClose(event: CloseEvent): void {
//     console.log(`[WebSocket Debug] Connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided.'}`);

//     if (event.wasClean) {
//       console.log('[WebSocket Debug] Connection closed cleanly.');
//     } else {
//       console.error('[WebSocket Debug] Unclean close. Possible issue with connection or server. Retrying...');
//     }

//     setTimeout(() => {
//       console.log('[WebSocket Debug] Reconnecting in 5 seconds...');
//       this.connect(); // Attempt to reconnect
//     }, 5000);
//   }

//   public sendMessage(message: string): void {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       console.log('[WebSocket Debug] Sending message:', message);
//       this.socket.send(message);
//     } else {
//       console.warn('[WebSocket Debug] Cannot send message, WebSocket is not open.');
//     }
//   }
// }
