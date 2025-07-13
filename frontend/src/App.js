import './App.css';
import {useEffect, useState} from 'react';
import { scannerService } from './services/scannerService';
import {WebsocketService} from "./services/WebsocketService";
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router';

import ScannerListPage from './pages/ScannerListPage';
import ScannerDetailPage from './pages/ScannerDetailPage';

function App() {
  const [scanners, setScanners] = useState({});

  const websocketHandler = (event) => {
    const data = JSON.parse(event.data);
    setScanners(prevScanners => {
      const updatedScanners = { ...prevScanners };
      updatedScanners[data.scanner_id].ping_lost = 0;

      updatedScanners[data.scanner_id].status = 'online';
      updatedScanners[data.scanner_id].sw_version = data.sw_version;
      updatedScanners[data.scanner_id].tuner = data.tuner;
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

  const router = createBrowserRouter([
    {
      path: '/',
      element: <ScannerListPage scanners={scanners} />
    },
    {
      path: '/scanner/:id',
      element: <ScannerDetailPage scanners={scanners} />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
