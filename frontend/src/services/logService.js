import {scannerService} from "./scannerService";

class LogService {

  constructor() {
    this.apiUrl = '/api/logs/';
  }

  async listModules() {
    return scannerService.listScanners();
  }

  async logs(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== "" && val !== null) params.append(key, val);
    });

    const response = await fetch(`${this.apiUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch scanners');
    }
    return await response.json();
  }

}

export const logService = new LogService();