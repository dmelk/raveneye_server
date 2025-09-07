class SdrService {

  constructor() {
    this.apiUrl = '/api/sdr/';
    this.pingLostInterval = null;
    this.spectrumDataUpdateHandlers = {};
    this.sdrPingLosts = {};
  }

  async listSdr() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch scanners');
    }
    const sdrs = {}, data = await response.json();
    for (const sdrId in data) {
      sdrs[sdrId] = {
        name: data[sdrId].name,
        status: data[sdrId].status,
        sw_version: data[sdrId].sw_version,
        lna: data[sdrId].sdr.lna,
        vga: data[sdrId].sdr.vga,
        amp: data[sdrId].sdr.amp,
        intervals: [],
        running: data[sdrId].sdr.running,
        sdr_type: data[sdrId].sdr.sdr_type,
        ping_lost: 0
      };
      for (const interval of data[sdrId].sdr.intervals) {
        sdrs[sdrId].intervals.push(
          [interval[0] / 1e6, interval[1] / 1e6]
        );
      }
    }
    this.sdrPingLosts = {};
    return sdrs;
  }

  async start(sdrId) {
    return this.executeAction(sdrId, 'start', {});
  }

  async stop(sdrId) {
    return this.executeAction(sdrId, 'stop', {});
  }

  async addInterval(sdrId, start, end) {
    return this.executeAction(sdrId, 'add_interval', {
      start: start * 1e6,
      end: end* 1e6
    });
  }

  async changeInterval(sdrId, intervalId, start, end) {
    return this.executeAction(sdrId, 'change_interval', {
      interval_id: intervalId,
      start: start * 1e6,
      end: end * 1e6
    });
  }

  async removeInterval(sdrId, intervalId) {
    return this.executeAction(sdrId, 'remove_interval', {
      interval_id: intervalId
    });
  }

  async clearIntervals(sdrId) {
    return this.executeAction(sdrId, 'clear_intervals', {});
  }

  async configure(sdrId, lna, vga, amp) {
    return this.executeAction(sdrId, 'configure', {
      lna: lna,
      vga: vga,
      amp: amp
    });
  }

  async executeAction(sdrId, action, payload) {
    const response = await fetch(`${this.apiUrl}/${sdrId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to execute action ${action} on scanner ${sdrId}`);
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

  pingLostIntervalHandler(prevSdrs) {
    const updatedSdrs = { ...prevSdrs };
    let hasChanges = false;
    for (const sdrId in updatedSdrs) {
      this.sdrPingLosts[sdrId] = (this.sdrPingLosts[sdrId] || 0) + 1;
      if (this.sdrPingLosts[sdrId] > 5) {
        if (updatedSdrs[sdrId].status !== 'offline') {
          hasChanges = true;
        }
        updatedSdrs[sdrId].status = 'offline';
      }
    }
    return hasChanges ? updatedSdrs : prevSdrs;
  }

  addWebsocketHandler(event, handler) {
    const data = JSON.parse(event.data);
    handler(data);
  }

  websocketDatatHandler(prevSdrs, data) {
    if (!data.sdr_id || !prevSdrs[data.sdr_id]) {
      return prevSdrs;
    }
    const updatedSdrs = { ...prevSdrs };
    this.sdrPingLosts[data.sdr_id] = 0;

    let hasChanges = false;

    // do not trigger re-render if status is already online
    if (updatedSdrs[data.sdr_id].status !== 'online') {
      updatedSdrs[data.sdr_id].status = 'online';
      hasChanges = true;
    }
    if (data.action === 'config_changed') {
      updatedSdrs[data.sdr_id].lna = data.lna;
      updatedSdrs[data.sdr_id].vga = data.vga;
      updatedSdrs[data.sdr_id].amp = data.amp;
      updatedSdrs[data.sdr_id].intervals = [];
      for (const interval of data.intervals) {
        updatedSdrs[data.sdr_id].intervals.push(
          [interval[0] / 1e6, interval[1] / 1e6]
        );
      }
      updatedSdrs[data.sdr_id].running = data.running;
      hasChanges = true;
    } else if (data.action === 'spectrum_data') {
      // notify spectrum data update handlers to avoid re-rendering the whole component on each data point
      if (this.spectrumDataUpdateHandlers[data.sdr_id] && this.spectrumDataUpdateHandlers[data.sdr_id][data.interval_id]) {
        this.spectrumDataUpdateHandlers[data.sdr_id][data.interval_id](data.frequency, data.power);
      }
    }

    return hasChanges ? updatedSdrs : prevSdrs;
  }
  
  addSpectrumDataUpdateHandler(sdrId, intervalId, handler) {
    if (!this.spectrumDataUpdateHandlers[sdrId]) {
      this.spectrumDataUpdateHandlers[sdrId] = {};
    }
    this.spectrumDataUpdateHandlers[sdrId][intervalId] = handler;
  }

  removeSpectrumDataUpdateHandler(sdrId, intervalId) {
    if (this.spectrumDataUpdateHandlers[sdrId]) {
      delete this.spectrumDataUpdateHandlers[sdrId][intervalId];
    }
  }

}

export const sdrService = new SdrService();