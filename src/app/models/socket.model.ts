import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Message } from './message.model';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3500');
  }

  connect() {
    return this.socket;
  }

  sendMessage(message: string, groupId: string, username: string) {
    this.socket.emit('send-message', { 
      message, 
      groupId,
      username
    });
  }

  joinRoom(groupId: string) {
    this.socket.emit('join-room', groupId);
  }

  leaveRoom(groupId: string) {
    this.socket.emit('leave-room', groupId);
  }

  receiveMessage(callback: (message: Message) => void) {
    this.socket.on('receive-message', (message: Message) => {
      callback(message);
    }); 
  }
}