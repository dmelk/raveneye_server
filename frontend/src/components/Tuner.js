import {Button, Grid} from "@mui/material";
import {scannerService} from "../services/scannerService";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SearchIcon from '@mui/icons-material/Search';
import StopIcon from '@mui/icons-material/Stop';
import Slider from '@mui/material/Slider';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import {useState} from "react";

function Tuner({scannerId, tunerId, config}) {

  const [rssiThreshold, setRssiThreshold] = useState(config.rssi_threshold);

  const handleRssiThresholdChange = () => {
    scannerService.tune(scannerId, tunerId, rssiThreshold);
  }

  const handlePrev = () => {
    scannerService.prev(scannerId, tunerId);
  }

  const handleNext = () => {
    scannerService.next(scannerId, tunerId);
  }

  const handleScan = () => {
      scannerService.scan(scannerId, tunerId);
  }

  const handleStopScan = () => {
      scannerService.stop(scannerId, tunerId);
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <h2>{config.name}</h2>
      </Grid>
      <Grid size={6}>
        Частота: {typeof config.frequency === 'undefined' ? 'N/A' : config.frequency}
      </Grid>
      <Grid size={6}>
        Сканування: {typeof config.scanning === 'undefined' || config.scanning === false ? 'Ні' : 'Так'}
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handlePrev}>
          <SkipPreviousIcon/>
        </Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleNext}>
          <SkipNextIcon/>
        </Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleScan}>
          <SearchIcon/>
        </Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleStopScan}>
          <StopIcon/>
        </Button>
      </Grid>
      <Grid size={3}>
        <h3>Чутливість</h3>
      </Grid>
      <Grid size={6}>
        <Slider
          value={rssiThreshold}
          min={500}
          max={1000}
          step={1}
          onChange={(event, newValue) => setRssiThreshold(newValue)}
          valueLabelDisplay="auto"
        />
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