export class WebsocketService {
  constructor(messageHandler) {
    this.socket = new WebSocket('/api/ws');
    const self = this;
    this.socket.onopen = function (event) {
      self.openHandler();
    };
    this.socket.onclose = function (event) {
      self.closeHandler();
    };
    this.socket.onmessage = function (event) {
      messageHandler(event);
    };
  }

  close() {
    this.closeHandler();
  }

  openHandler() {
    this.pingInterval = setInterval(() => {
      this.ping();
    }, 1000); // 1 second
  }

  closeHandler() {
    clearInterval(this.pingInterval);
    this.socket.close();
  }

  ping() {
    this.socket.send(JSON.stringify({ type: 'ping' }));
  }
}