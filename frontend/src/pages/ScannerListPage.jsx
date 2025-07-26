import { Typography, Box } from '@mui/material';
import ScannerView from '../components/ScannerView';
import {usePageTitle} from "../context/TitleContext";
import {useEffect} from "react";

export default function ScannerListPage({ scanners }) {
  const scannerEntries = Object.entries(scanners); // [ [id, config], ... ]

  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Сканери');
  }, []);

  if (scannerEntries.length === 0) {
    return <Typography p={3}>Немає сканерів</Typography>;
  }

  return (
    <Box p={3}>
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
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
