import { Typography, Box, Switch, FormControlLabel } from '@mui/material';
import ScannerView from '../components/ScannerView';
import {usePageTitle} from "../context/TitleContext";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {websocketService} from "../services/WebsocketService";

export default function ScannerListPage({ scanners }) {
  const scannerEntries = Object.entries(scanners); // [ [id, config], ... ]

  const [ searchParams, setSearchParams ] = useSearchParams();

  const initialShowVideo = searchParams.get('showVideo') !== 'false'; // default to true
  const [ showVideo, setShowVideo ] = useState(initialShowVideo);

  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Сканери');
    websocketService.subscribe('scanner');

    return () => {
      websocketService.unsubscribe('scanner');
    }
  }, []);

  useEffect(() => {
    searchParams.set('showVideo', showVideo.toString());
    setSearchParams(searchParams, { replace: true });
  }, [showVideo]);

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
