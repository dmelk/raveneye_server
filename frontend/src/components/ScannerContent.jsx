import {
  Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import SearchIcon from '@mui/icons-material/Search';
import {useState} from "react";
import {scannerService} from "../services/scannerService";
import Popover from '@mui/material/Popover';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TextField from "@mui/material/TextField";

export default function ScannerContent({
                                         scannerId, config, full = false, showVideo = true
                                       }) {

  const [rssiThreshold, setRssiThreshold] = useState(config.tuner ? config.tuner.rssi_threshold : 0);

  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);

  const openThresholdDialog = () => setThresholdDialogOpen(true);

  const closeThresholdDialog = () => setThresholdDialogOpen(false);

  const [frequency, setFrequency] = useState(config.frequency);

  const [isEditing, setIsEditing] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleInfoClick = (event) => setAnchorEl(event.currentTarget);

  const handleInfoClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  const handleRssiThresholdChange = () => {
    scannerService.tune(scannerId, rssiThreshold);
    closeThresholdDialog();
  }

  const applyFrequencyChange = async (frequency) => {
    await scannerService.stop(scannerId);
    await scannerService.setFrequency(scannerId, frequency);
    setIsEditing(false);
  }

  const handlePrev = () => {
    scannerService.prev(scannerId);
  }

  const handleNext = () => {
    scannerService.next(scannerId);
  }

  const handleScan = () => {
    scannerService.scan(scannerId);
  }

  const handleStopScan = () => {
    scannerService.stop(scannerId);
  }

  const handleEdit = () => {
    setIsEditing(!isEditing);
  }

  return (<>
    {/* Frequency range with control icons */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
      <Typography variant={full ? 'subtitle1' : 'body2'}>
        <Box component="span" display="inline-flex" alignItems="center" gap={0.5}>
          <SignalCellularAltIcon fontSize="small"/>
          {config.tuner ? config.tuner.rssi : 'N/A'}
        </Box>
      </Typography>
      <Box>
        <IconButton size="small" onClick={openThresholdDialog} sx={{ color: '#fff' }}>
          <SettingsIcon fontSize="small"/>
        </IconButton>
        <IconButton size="small" onClick={handleInfoClick} sx={{ color: '#fff' }}>
          <InfoOutlinedIcon fontSize="small"/>
        </IconButton>
      </Box>
    </Box>

    {/* Stream video */}
    {
      showVideo ? (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <iframe
            src={`/stream/${scannerId}`}
            allow="autoplay; fullscreen; camera; microphone"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 8,
              backgroundColor: '#000'
            }}
          />
        </Box>
      ) : (null)
    }

    {/* Frequency readout */}
    <Box mt={2} mb={1}>
      {isEditing ? (<Box display="flex" alignItems="center" gap={1}>
          <input
            type="number"
            value={frequency}
            autoFocus
            onChange={(e) => setFrequency(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFrequencyChange(frequency);
              } else if (e.key === 'Escape') {
                handleEdit();
              }
            }}
            style={{
              backgroundColor: '#2e323d',
              color: '#ffffff',
              fontSize: full ? '2rem' : '1.5rem',
              width: full ? '150px' : '100px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          />
          <IconButton onClick={() => applyFrequencyChange(frequency)} sx={{ color: '#fff' }}>
            <SaveIcon/>
          </IconButton>
          <IconButton onClick={handleEdit} sx={{ color: '#fff' }}>
            <CancelIcon/>
          </IconButton>
        </Box>) : (<Typography
          variant={full ? 'h2' : 'h4'}
          onDoubleClick={handleEdit}
          sx={{cursor: 'pointer'}}
        >
          {typeof config.tuner.frequency === 'undefined' ? 'N/A' : config.tuner.frequency}
        </Typography>)}
      <Typography>
        Сканування:{' '}
        <Box component="span" sx={{color: config.tuner.scanning ? 'green' : 'inherit'}}>
          {typeof config.tuner.scanning === 'undefined' || config.tuner.scanning === false ? 'Ні' : 'Так'}
        </Box>
      </Typography>
    </Box>

    {/* Controls */}
    <Box mt={2} display="flex" justifyContent="space-between">
      <IconButton onClick={handlePrev} sx={{ color: '#fff' }}>
        <SkipPreviousIcon/>
      </IconButton>
      <IconButton onClick={handleNext} sx={{ color: '#fff' }}>
        <SkipNextIcon/>
      </IconButton>
      {typeof config.tuner.scanning === 'undefined' || config.tuner.scanning === false ?
        (
          <IconButton onClick={handleScan}  sx={{ color: '#fff' }}>
            <SearchIcon/>
          </IconButton>
        ) : (
          <IconButton onClick={handleStopScan} sx={{ color: '#fff' }} varint="contained">
            <StopIcon/>
          </IconButton>
        )}
    </Box>

    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleInfoClose}
      anchorOrigin={{
        vertical: 'bottom', horizontal: 'left',
      }}
    >
      <Box p={2}>
        <Typography variant="body2">Версія ПЗ: {config.sw_version}</Typography>
      </Box>
    </Popover>

    <Dialog
      open={thresholdDialogOpen}
      onClose={closeThresholdDialog}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#2e323d',
            color: '#fff',
          }
        }
      }}
    >
      <DialogTitle>Налаштування порогу RSSI</DialogTitle>
      <DialogContent>
        <TextField
          label="Поріг RSSI"
          type="number"
          fullWidth
          value={rssiThreshold}
          onChange={(e) => setRssiThreshold(e.target.value)}
          margin="dense"
          sx={{
            input: {
              color: '#fff',
              backgroundColor: '#1f2229',
            },
            label: {
              color: '#aaa',
            },
            '& label.Mui-focused': {
              color: '#90caf9',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#555',
              },
              '&:hover fieldset': {
                borderColor: '#888',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#90caf9',
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeThresholdDialog}
          sx={{ color: '#90caf9' }}
        >
          Скасувати
        </Button>
        <Button
          onClick={handleRssiThresholdChange}
          variant="contained"
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  </>);
}
