import { Typography, Box, Switch, FormControlLabel } from '@mui/material';
import ScannerView from '../components/ScannerView';
import {usePageTitle} from "../context/TitleContext";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {websocketService} from "../services/WebsocketService";
import {scannerService} from "../services/scannerService";

export default function ScannerListPage() {
  const [ searchParams, setSearchParams ] = useSearchParams();

  const initialShowVideo = searchParams.get('showVideo') !== 'false'; // default to true
  const [ showVideo, setShowVideo ] = useState(initialShowVideo);

  const [scanners, setScanners] = useState({});

  const { setTitle } = usePageTitle();

  const initComponent = async () => {
    const scanners = await scannerService.listScanners();
    setScanners(scanners);

    websocketService.addMessageHandler('scanner_list', (event) => {
      scannerService.addWebsocketHandler(event, (data) => {
        setScanners(prevScanners => {
          return scannerService.websocketDatatHandler(prevScanners, data);
        });
      });
    });

    websocketService.subscribe('scanner');

    scannerService.initPingLostInterval(() => {
      setScanners(prevScanners => {
        return scannerService.pingLostIntervalHandler(prevScanners);
      })
    });
  }

  useEffect(() => {
    setTitle('Сканери');

    initComponent();

    return () => {
      websocketService.removeMessageHandler('scanner_list');
      scannerService.clearPingLostInterval()
      websocketService.unsubscribe('scanner');
    }
  }, []);

  useEffect(() => {
    searchParams.set('showVideo', showVideo.toString());
    setSearchParams(searchParams, { replace: true });
  }, [showVideo]);

  const scannerEntries = Object.entries(scanners);

  if (scannerEntries.length === 0) {
    return <Typography p={3}>Немає сканерів</Typography>;
  }

  return (
    <Box p={3}>
      <FormControlLabel
        control={
          <Switch
            checked={showVideo}
            onChange={(e) => setShowVideo(e.target.checked)}
          />
        }
        label="Показати відео"
        sx={{ mb: 2 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        {scannerEntries.map(([id, config]) => (
          <Box key={id}>
            <ScannerView
              scannerId={id}
              config={config}
              full={false}
              showVideo={showVideo}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
