import { Grid, Typography, Box } from '@mui/material';
import ScannerView from '../components/ScannerView';

export default function ScannerListPage({ scanners }) {
  const scannerEntries = Object.entries(scanners); // [ [id, config], ... ]

  if (scannerEntries.length === 0) {
    return <Typography p={3}>Немає сканерів</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Сканери</Typography>
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
