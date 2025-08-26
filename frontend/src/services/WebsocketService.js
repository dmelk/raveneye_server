class WebsocketService {
  constructor(messageHandler) {
    this.socket = new WebSocket('/api/ws');
    this.messageHandlers = {};
    const self = this;
    this.socket.onopen = function (event) {
      self.openHandler();
    };
    this.socket.onclose = function (event) {
      self.closeHandler();
    };
    this.socket.onmessage = function (event) {
      for (const id in self.messageHandlers) {
        self.messageHandlers[id](event);
      }
    };
  }

  addMessageHandler(id, messageHandler) {
    this.messageHandlers[id] = messageHandler;
  }

  removeMessageHandler(id) {
    delete this.messageHandlers[id];
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
    this.socket.send(JSON.stringify({ action: 'ping' }));
  }

  subscribe(topic) {
    this.socket.send(JSON.stringify({ action: 'subscribe', topic: topic }));
  }

  unsubscribe(topic) {
    this.socket.send(JSON.stringify({ action: 'unsubscribe', topic: topic }));
  }
}

export const websocketService = new WebsocketService();