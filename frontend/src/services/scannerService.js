class ScannerService {

  constructor() {
    this.apiUrl = '/api/scanners/';
    this.pingLostInterval = null;
  }

  async listScanners() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch scanners');
    }
    return await response.json();
  }

  async scan(scannerId) {
    return this.executeAction(scannerId, 'scan', {});
  }

  async stop(scannerId) {
    return this.executeAction(scannerId, 'stop', {});
  }

  async next(scannerId) {
    return this.executeAction(scannerId, 'next', {});
  }

  async prev(scannerId) {
    return this.executeAction(scannerId, 'prev', {});
  }

  async skip(scannerId) {
    return this.executeAction(scannerId, 'skip', {});
  }

  async clearSkip(scannerId, value, allValues) {
    return this.executeAction(scannerId, 'clear_skip', {
      value: value,
      allValues: allValues
    });
  }

  async tune(scannerId, value) {
    return this.executeAction(scannerId, 'tune', { value: value });
  }

  async setFrequency(scannerId, value) {
    return this.executeAction(scannerId, 'set_frequency', { value: value });
  }

  async executeAction(scannerId, action, payload) {
    const response = await fetch(`${this.apiUrl}/${scannerId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to execute action ${action} on scanner ${scannerId}`);
    }
    return await response.json();
  }

  initPingLostInterval(handler) {
    this.pingLostInterval = setInterval(() => handler(), 1000);
  }

  clearPingLostInterval() {
    if (this.pingLostInterval) {
      clearInterval(this.pingLostInterval);
      this.pingLostInterval = null;
    }
  }

  pingLostIntervalHandler(prevScanners) {
    const updatedScanners = { ...prevScanners };
    for (const scannerId in updatedScanners) {
      updatedScanners[scannerId].ping_lost++;
      if (updatedScanners[scannerId].ping_lost > 5) {
        updatedScanners[scannerId].status = 'offline';
      }
    }
    return updatedScanners;
  }

  addWebsocketHandler(event, handler) {
    const data = JSON.parse(event.data);
    handler(data);
  }

  websocketDatatHandler(prevScanners, data) {
    if (!data.scanner_id || !prevScanners[data.scanner_id]) {
      return prevScanners;
    }
    const updatedScanners = { ...prevScanners };
    updatedScanners[data.scanner_id].ping_lost = 0;

    updatedScanners[data.scanner_id].status = 'online';
    updatedScanners[data.scanner_id].sw_version = data.sw_version;
    updatedScanners[data.scanner_id].tuner = data.tuner;
    return updatedScanners;
  }

}

export const scannerService = new ScannerService();