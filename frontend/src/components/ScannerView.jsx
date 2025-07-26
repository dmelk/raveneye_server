import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ScannerContent from "./ScannerContent";
import { Link } from 'react-router';

export default function ScannerView({ scannerId, config, full = false, onBack }) {
  return (
    <Box
      sx={{
        p: full ? 0 : 2,
        width: full ? '90w' : '95%',
        height: full ? '90vh' : 'auto',
        minHeight: full ? '90vh' : 450,
        borderRadius: full ? 0 : 2,
        boxShadow: full ? 0 : 3,
        backgroundColor: '#2e323d',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {full ? (
          <Typography variant="h6">{config.name}</Typography>
        ) : (
          <Typography
            variant="h6"
            component={Link}
            to={`/scanner/${scannerId}`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {config.name}
          </Typography>
        )}
        <Chip
          label={config.status}
          color={config.status === 'online' ? 'success' : 'error'}
          size={full ? 'medium' : 'small'}
          icon={<CircleIcon sx={{ fontSize: 10, color: '#fff' }} />}
          sx={{
            color: '#fff', // text color
            '& .MuiChip-icon': {
              color: '#fff', // icon color
            }
          }}
        />
      </Box>

      {config.status === 'online' && (
        <ScannerContent
          scannerId={scannerId}
          config={config}
          full={full}
        />
      )}

    </Box>
  );
}
