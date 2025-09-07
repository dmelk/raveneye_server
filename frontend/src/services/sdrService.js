class SdrService {

  constructor() {
    this.apiUrl = '/api/sdr/';
    this.pingLostInterval = null;
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
        intervals: data[sdrId].sdr.intervals,
        running: data[sdrId].sdr.running,
        spectrumData: {},
        ping_lost: 0
      }
    }
    return await sdrs;
  }

  async start(sdrId) {
    return this.executeAction(sdrId, 'start', {});
  }

  async stop(sdrId) {
    return this.executeAction(sdrId, 'stop', {});
  }

  async add_interval(sdrId, start, end) {
    return this.executeAction(sdrId, 'add_interval', {
      start: start,
      end: end
    });
  }

  async change_interval(sdrId, intervalId, start, end) {
    return this.executeAction(sdrId, 'change_interval', {
      interval_id: intervalId,
      start: start,
      end: end
    });
  }

  async remove_interval(sdrId, intervalId) {
    return this.executeAction(sdrId, 'remove_interval', {
      interval_id: intervalId
    });
  }

  async clear_intervals(sdrId) {
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
    for (const sdrId in updatedSdrs) {
      updatedSdrs[sdrId].ping_lost++;
      if (updatedSdrs[sdrId].ping_lost > 5) {
        updatedSdrs[sdrId].status = 'offline';
      }
    }
    return updatedSdrs;
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
    updatedSdrs[data.sdr_id].ping_lost = 0;
    updatedSdrs[data.sdr_id].sw_version = data.sw_version;

    updatedSdrs[data.sdr_id].status = 'online';
    if (data.action === 'config_changed') {
      updatedSdrs[data.sdr_id].lna = data.lna;
      updatedSdrs[data.sdr_id].vga = data.vga;
      updatedSdrs[data.sdr_id].amp = data.amp;
      updatedSdrs[data.sdr_id].intervals = data.intervals;
      updatedSdrs[data.sdr_id].running = data.running;
    } else if (data.action === 'spectrum_data') {
      if (!updatedSdrs[data.sdr_id].spectrumData[data.interval_id]) {
        updatedSdrs[data.sdr_id].spectrumData[data.interval_id] = {};
      }
      updatedSdrs[data.sdr_id].spectrumData[data.interval_id][data.frequency] = data.power;
    }
    return updatedSdrs;
  }

}

export const sdrService = new SdrService();