import {Grid} from "@mui/material";
import Tuner from "./Tuner";

function Scanner({scannerId, config}) {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <h1>{config.name}</h1>
      </Grid>
      <Grid size={6}>
        Status: {config.status}
      </Grid>
      <Grid size={6}>
        Прошивка: {config.sw_version}
      </Grid>
      {
        (config.status === 'online' ? (
          <Grid size={12}>
            <Tuner config={config.tuner} scannerId={scannerId}/>
          </Grid>
        )
          : null)
      }
    </Grid>
  );
}

export default Scanner;