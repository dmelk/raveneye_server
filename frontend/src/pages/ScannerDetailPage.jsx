import { useParams } from 'react-router';
import ScannerView from "../components/ScannerView";
import {usePageTitle} from "../context/TitleContext";
import {useEffect, useState} from "react";
import {websocketService} from "../services/WebsocketService";
import {scannerService} from "../services/scannerService";

export default function ScannerDetailPage() {
  const { id } = useParams();
  const { setTitle } = usePageTitle();

  const [scanners, setScanners] = useState({});

  const initComponent = async () => {
    const scanners = await scannerService.listScanners();
    setScanners(scanners);

    websocketService.subscribe('scanner');

    websocketService.addMessageHandler('scanner_details', (event) => {
      scannerService.addWebsocketHandler(event, (data) => {
        setScanners(prevScanners => {
          return scannerService.websocketDatatHandler(prevScanners, data);
        });
      });
    });

    scannerService.initPingLostInterval(() => {
      setScanners(prevScanners => {
        return scannerService.pingLostIntervalHandler(prevScanners);
      })
    });
  }

  useEffect(() => {
    initComponent();

    return () => {
      websocketService.removeMessageHandler('scanner_details');
      scannerService.clearPingLostInterval();
      websocketService.unsubscribe('scanner');
    }
  }, []);

  const scanner = scanners[id] || null;

  useEffect(() => {
    setTitle(scanner ? scanner.name : id);
  }, [scanner]);

  if (!scanner) {
    return <div>Loading scanner...</div>;
  }


  return <ScannerView scannerId={id} config={scanner} full={true} />;
}
