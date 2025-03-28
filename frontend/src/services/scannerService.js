class ScannerService {

  constructor() {
    this.apiUrl = '/api/scanners';
  }

  async listScanners() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch scanners');
    }
    return await response.json();
  }

  async scan(scannerId, tunerId) {
    return this.executeAction(scannerId, tunerId, 'scan', {});
  }

  async stop(scannerId, tunerId) {
    return this.executeAction(scannerId, tunerId, 'stop', {});
  }

  async next(scannerId, tunerId) {
    return this.executeAction(scannerId, tunerId, 'next', {});
  }

  async prev(scannerId, tunerId) {
    return this.executeAction(scannerId, tunerId, 'prev', {});
  }

  async skip(scannerId, tunerId) {
    return this.executeAction(scannerId, tunerId, 'skip', {});
  }

  async clearSkip(scannerId, tunerId, value, allValues) {
    return this.executeAction(scannerId, tunerId, 'clear_skip', {
      value: value,
      allValues: allValues
    });
  }

  async tune(scannerId, tunerId, value) {
    return this.executeAction(scannerId, tunerId, 'tune', { value: value });
  }

  async executeAction(scannerId, tunerId, action, payload) {
    const response = await fetch(`${this.apiUrl}/${scannerId}/${action}/${tunerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to execute action ${action} on scanner ${scannerId} with tuner ${tunerId}`);
    }
    return await response.json();
  }
}

export const scannerService = new ScannerService();