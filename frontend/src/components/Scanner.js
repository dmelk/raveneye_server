import {Grid} from "@mui/material";
import Tuner from "./Tuner";

function Scanner({scannerId, config}) {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <h1>{config.name}</h1>
      </Grid>
      <Grid size={12}>
        Status: {config.status}
      </Grid>
      {
        (config.status === 'online' ? config.tuners.map((tuner, index) => (
          <Grid size={6} key={index}>
            <Tuner tunerId={index} config={tuner} scannerId={scannerId}/>
          </Grid>
        ))
          : null)
      }
    </Grid>
  );
}

export default Scanner;