// utils/websocket.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = {};
  }

  async connect(clientId) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://10.0.2.2:3006/?clientId=${clientId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      this.ws.onmessage = event => {
        const data = JSON.parse(event.data);
        // console.log('WebSocket message received:', data);
        if (this.listeners[data.type]) {
          this.listeners[data.type](data);
        }
      };
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {type, payload};
      this.ws.send(JSON.stringify(message));
      // console.log('WebSocket message sent:', message);
    } else {
      console.error('WebSocket is not open');
    }
  }

  addListener(type, callback) {
    this.listeners[type] = callback;
  }

  removeListener(type) {
    delete this.listeners[type];
  }
}

const WebSocketInstance = new WebSocketManager();
export default WebSocketInstance;
