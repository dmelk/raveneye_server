class ScannerService {

  constructor() {
    this.apiUrl = '/api/scanners/';
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
}

export const scannerService = new ScannerService();