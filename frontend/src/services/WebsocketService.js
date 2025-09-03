class WebsocketService {
  constructor(messageHandler) {
    this.socket = new WebSocket('/api/ws');
    this.messageHandlers = {};
    this.ready = false;
    this.subscribeIntervals = {};
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
    this.ready = true;
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
    if (!this.ready) {
      const self = this;
      this.subscribeIntervals[topic] = setInterval(() => {
        if (self.ready) {
          clearInterval(self.subscribeIntervals[topic]);
          delete self.subscribeIntervals[topic];
          self.socket.send(JSON.stringify({ action: 'subscribe', topic: topic }));
        }
      }, 100);
      return;
    }
    this.socket.send(JSON.stringify({ action: 'subscribe', topic: topic }));
  }

  unsubscribe(topic) {
    if (this.subscribeIntervals[topic]) {
      clearInterval(this.subscribeIntervals[topic]);
      delete this.subscribeIntervals[topic];
    }
    if (!this.ready) {
      return;
    }
    this.socket.send(JSON.stringify({ action: 'unsubscribe', topic: topic }));
  }
}

export const websocketService = new WebsocketService();