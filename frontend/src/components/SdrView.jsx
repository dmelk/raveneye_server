import { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardHeader, CardContent, CardActions,
  Grid, FormControlLabel, Switch, Slider, Button,
  Typography, ToggleButtonGroup, ToggleButton, Divider, Chip, Stack,
  Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { sdrService } from "../services/sdrService";
import SdrIntervalView from "./SdrIntervalView";

const VGA_MIN = 0, VGA_MAX = 60;     // dB

function renderHeader(sdrId, sdr) {
  return (
    <CardHeader
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{sdr.name}</Typography>
          { sdr.status === 'online' &&
            <Chip
              size="small"
              label={sdr.running ? 'running' : 'stopped'}
              color={sdr.running ? 'success' : 'default'}
            />
          }
          <Chip
            size="small"
            label={sdr.status}
            color={sdr.status === 'online' ? 'success' : 'error'}
            sx={{ ml: 1 }}
          />
        </Box>
      }
      subheader={
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          ID: {sdrId}{sdr.sdr_type ? ` • ${sdr.sdr_type}` : ''}{sdr.sw_version ? ` • v${sdr.sw_version}` : ''}
        </Typography>
      }
    />
  );
}

export default function SdrView({ sdrId, sdr }) {
  const LNA_OPTIONS = {
    'hackrf': [0, 8, 16, 24, 32, 40],
  };
  const snapToLna = (v) => LNA_OPTIONS[sdr.sdr_type].reduce((a, b) =>
    Math.abs(b - v) < Math.abs(a - v) ? b : a, LNA_OPTIONS[sdr.sdr_type][0]);

  const [lna, setLna] = useState(snapToLna(sdr.lna));
  const [vga, setVga] = useState(sdr.vga);
  const [amp, setAmp] = useState(sdr.amp);
  const [running, setRunning] = useState(sdr.running);

  // Intervals-per-row (persist per-SDR in localStorage)
  const localKey = `sdr.${sdrId}.intervalsPerRow`;
  const [perRow, setPerRow] = useState(() => {
    const saved = Number(localStorage.getItem(localKey));
    return [1,2,3,4].includes(saved) ? saved : 1;
  });
  useEffect(() => { localStorage.setItem(localKey, String(perRow)); }, [localKey, perRow]);

  const applyConfig = async (nextLna, nextVga, nextAmp) => {
    try {
      await sdrService.configure(sdrId, nextLna, nextVga, nextAmp);
    } catch (e) {
      console.error('updateSdrConfig failed', e);
    }
  };

  const handleStartStop = async () => {
    const next = !running;
    try {
      if (next) await sdrService.start(sdrId);
      else await sdrService.stop(sdrId);
      setRunning(next);
    } catch (e) {
      console.error('start/stop failed', e);
    }
  };

  const gridTemplate = useMemo(() => `repeat(${perRow}, minmax(0, 1fr))`, [perRow]);

  // --- Interval CRUD ---------------------------------------------------------
  const handleAddInterval = async () => {
    try {
      await sdrService.addInterval(sdrId, 1000e6, 1100e6);
    } catch (e) {
      console.error('addInterval failed', e);
    }
  };

  const handleClearIntervals = async () => {
    try {
      await sdrService.clearIntervals(sdrId);
    } catch (e) {
      console.error('clearIntervals failed', e);
    }
  };

  const handleRemoveInterval = async (intervalId) => {
    try {
      await sdrService.removeInterval(sdrId, intervalId);
    } catch (e) {
      console.error('removeInterval failed', e);
    }
  };

  const handleUpdateInterval = async (intervalId, start, end) => {
    try {
      await sdrService.changeInterval(sdrId, intervalId, start, end);
    } catch (e) {
      console.error('updateInterval failed', e);
    }
  };

  if (sdr.status !== 'online') {
    return (
      <Card sx={{ backgroundColor: '#1f2330', borderRadius: 2 }}>
        {renderHeader(sdrId, sdr)}
      </Card>
    );
  }

  const intervals = sdr.intervals;

  return (
    <Card sx={{ backgroundColor: '#1f2330', borderRadius: 2 }}>
      {renderHeader(sdrId, sdr)}

      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography gutterBottom variant="subtitle2">LNA (dB)</Typography>
            <FormControl fullWidth size="small">
              <InputLabel id={`lna-label-${sdrId}`}>LNA</InputLabel>
              <Select
                labelId={`lna-label-${sdrId}`}
                label="LNA"
                value={lna}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setLna(next);
                  applyConfig(next, vga, amp);
                }}
              >
                {LNA_OPTIONS[sdr.sdr_type].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography gutterBottom variant="subtitle2">VGA (dB): {vga}</Typography>
            <Slider
              value={vga}
              min={VGA_MIN}
              max={VGA_MAX}
              step={1}
              onChange={(_, v) => setVga(v)}
              onChangeCommitted={(_, v) => applyConfig(lna, v, amp)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={amp}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setAmp(next);
                    applyConfig(lna, vga, next);
                  }}
                />
              }
              label="Amplify (AMP)"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant={running ? "outlined" : "contained"}
              color={running ? "warning" : "success"}
              startIcon={running ? <StopIcon/> : <PlayArrowIcon/>}
              onClick={handleStartStop}
              fullWidth
              sx={{ height: 40 }}
            >
              {running ? 'Стоп' : 'Старт'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button size="small" variant="contained" startIcon={<AddIcon/>} onClick={handleAddInterval}>
            Додати інтервал
          </Button>
          <Button size="small" variant="outlined" color="error" startIcon={<DeleteSweepIcon/>} onClick={handleClearIntervals}>
            Очистити всі
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="subtitle2">Відображати в рядку:</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={perRow}
            onChange={(_, val) => val && setPerRow(val)}
          >
            <ToggleButton value={1}>1</ToggleButton>
            <ToggleButton value={2}>2</ToggleButton>
            <ToggleButton value={3}>3</ToggleButton>
            <ToggleButton value={4}>4</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {intervals?.length || 0} intervals
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gap: 2,
          }}
        >
          {(intervals || []).map((itv, idx) => {
            return (
              <SdrIntervalView
                key={idx}
                sdrId={sdrId}
                intervalId={idx}
                interval={itv}
                onRemove={() => handleRemoveInterval(idx)}
                onSave={(start, end) => handleUpdateInterval(idx, start, end)}
              />
            );
          })}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.65 }}>
          Tip: Columns setting is saved per SDR.
        </Typography>
      </CardActions>
    </Card>
  );
}
