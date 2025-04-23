import './App.css';
import {useEffect, useState} from 'react';
import { scannerService } from './services/scannerService';
import {Grid} from "@mui/material";
import Scanner from "./components/Scanner";
import {WebsocketService} from "./services/WebsocketService";

function App() {
  const [scanners, setScanners] = useState({});

  const websocketHandler = (event) => {
    const data = JSON.parse(event.data);
    setScanners(prevScanners => {
      const updatedScanners = { ...prevScanners };
      updatedScanners[data.scanner_id].ping_lost = 0;

      if (data.action === 'ping') {
        updatedScanners[data.scanner_id].status = 'online';
        for (let i = 0; i < data.tuner_configs.length; i++) {
          updatedScanners[data.scanner_id].tuners[i].scanning = data.tuner_configs[i].scanning;
          updatedScanners[data.scanner_id].tuners[i].frequency = data.tuner_configs[i].tuner.frequency;
          updatedScanners[data.scanner_id].tuners[i].frequency_idx = data.tuner_configs[i].tuner.frequency_idx;
          updatedScanners[data.scanner_id].tuners[i].rssi_threshold = data.tuner_configs[i].tuner.rssi_threshold;
        }
      } else if (data.action === 'frequency_change') {
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].frequency = data.frequency;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].frequency_idx = data.value;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].scanning = data.scanning;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].rssi_threshold = data.config.rssi_threshold;
      } else if (data.action === 'signal_found') {
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].frequency = data.frequency;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].frequency_idx = data.value;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].scanning = data.scanning;
        updatedScanners[data.scanner_id].tuners[data.tuner_idx].rssi_threshold = data.config.rssi_threshold;
      }

      return updatedScanners;
    })
  }

  useEffect(async () => {
    const scanners = await scannerService.listScanners();
    setScanners(scanners);

    const websocketService = new WebsocketService(
      (event) => websocketHandler(event)
    );

    return () => {
      websocketService.close();
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setScanners(prevScanners => {
        const updatedScanners = { ...prevScanners };
        for (const scannerId in updatedScanners) {
          updatedScanners[scannerId].ping_lost++;
          if (updatedScanners[scannerId].ping_lost > 5) {
            updatedScanners[scannerId].status = 'offline';
          }
        }
        return updatedScanners;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Grid container spacing={2}>
          {
            Object.keys(scanners).map((scannerId, index) => {
              return (
                <Grid size={12} key={index}>
                  <Scanner scannerId={scannerId} config={scanners[scannerId]}/>
                </Grid>
              )
            })
          }
        </Grid>
      </header>
    </div>
  );
}

export default App;
