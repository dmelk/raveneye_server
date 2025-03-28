import {Button, Grid} from "@mui/material";
import {scannerService} from "../services/scannerService";
import {useEffect, useState} from "react";

function Tuner({scannerId, tunerId, config}) {

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
        Current frequency: {typeof config.frequency === 'undefined' ? 'N/A' : config.frequency}
      </Grid>
      <Grid size={6}>
        Scanning: {typeof config.scanning === 'undefined' || config.scanning === false ? 'No' : 'Yes'}
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handlePrev}>Prev</Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleNext}>Next</Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleScan}>Scan</Button>
      </Grid>
      <Grid size={3}>
        <Button variant={'contained'} onClick={handleStopScan}>Stop</Button>
      </Grid>
    </Grid>
  );
}

export default Tuner;