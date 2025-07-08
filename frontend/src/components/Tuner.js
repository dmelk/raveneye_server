import {Button, Grid} from "@mui/material";
import {scannerService} from "../services/scannerService";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SearchIcon from '@mui/icons-material/Search';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import {useState} from "react";
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

function Tuner({scannerId, config}) {

  const [rssiThreshold, setRssiThreshold] = useState(config.rssi_threshold);

  const [frequency, setFrequency] = useState(config.frequency);

  const [isEditing, setIsEditing] = useState(false);

  const handleRssiThresholdChange = () => {
    scannerService.tune(scannerId, rssiThreshold);
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

  return (
    <Grid container spacing={2}>
      <Grid size={4}>
        {
          isEditing ?
            (
              <TextField
                variant="filled"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              />
            )
          :
            (
              <span>
                Частота: {typeof config.frequency === 'undefined' ? 'N/A' : config.frequency}
              </span>
            )
        }
      </Grid>
      <Grid size={3}>
        {
          isEditing ?
            (
              <span>
                <Button variant={'contained'} onClick={() => applyFrequencyChange(frequency)}>
                  <SaveIcon/>
                </Button>
                <Button variant={'contained'} onClick={handleEdit}>
                  <CancelIcon/>
                </Button>
              </span>
            )
          :
          (
            <span>
              <Button variant={'contained'} onClick={handleEdit}>
                <EditIcon/>
              </Button>
              <Button variant={'contained'} onClick={handlePrev}>
                <SkipPreviousIcon/>
              </Button>
              <Button variant={'contained'} onClick={handleNext}>
                <SkipNextIcon/>
              </Button>
            </span>
          )
        }
      </Grid>
      <Grid size={4}>
        Сканування: {typeof config.scanning === 'undefined' || config.scanning === false ? 'Ні' : 'Так'}
      </Grid>
      <Grid size={1}>
        {
          typeof config.scanning === 'undefined' || config.scanning === false ?
            (
            <Button variant={'contained'} onClick={handleScan}>
              <SearchIcon/>
            </Button>
            )
            :
            (
            <Button variant={'contained'} onClick={handleStopScan}>
              <StopIcon/>
            </Button>
            )
        }
      </Grid>
      <Grid size={3}>
        RSSI: {typeof config.rssi === 'undefined' ? 'N/A' : config.rssi}
      </Grid>
      <Grid size={3}>
        Чутливість
      </Grid>
      <Grid size={2}>
        <TextField
          variant="filled"
          value={rssiThreshold}
          onChange={(event) => setRssiThreshold(event.target.value)}
        />
      </Grid>
      <Grid size={1}>
        <Button variant={'contained'} onClick={handleRssiThresholdChange}>
          <SaveIcon/>
        </Button>
      </Grid>
    </Grid>
  );
}

export default Tuner;