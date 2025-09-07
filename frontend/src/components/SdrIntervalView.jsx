import {useMemo, useState} from "react";
import {
  Card, CardContent, CardHeader, Typography,
  Box, TextField, Stack, IconButton, Tooltip
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SdrSpectrumView from "./SdrSpectrumView";

const fmtHz = (hz) =>
  hz >= 1e9 ? `${(hz/1e9).toFixed(3)} GHz`
    : hz >= 1e6 ? `${(hz/1e6).toFixed(3)} MHz`
      : hz >= 1e3 ? `${(hz/1e3).toFixed(3)} kHz`
        : `${Math.round(hz)} Hz`;

export default function SdrIntervalView({ sdrId, intervalId, interval, onRemove, onSave }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(interval[0]);
  const [stop, setStop] = useState(interval[1]);

  const title = useMemo(() => {
    return `${fmtHz(start)} – ${fmtHz(stop)}`;
  }, [start, stop]);

  const handleCancel = () => {
    setEditing(false);
    setStart(interval[0]);
    setStop(interval[1]);
  };

  const handleSave = () => {
    onSave(Number(start), Number(stop));
    setEditing(false);
  };

  return (
    <Card variant="outlined" sx={{ backgroundColor: '#262a35', borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="subtitle1">{title}</Typography>}
        action={
          <Stack direction="row" spacing={0.5}>
            {editing ? (
              <>
                <Tooltip title="Зберегти">
                  <IconButton size="small" onClick={handleSave} color="success">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Скасувати">
                  <IconButton size="small" onClick={handleCancel}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Видалити інтервал">
                <IconButton size="small" onClick={() => onRemove?.()}>
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, display: 'grid', gap: 1 }}>
        {/* Edit row */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            label="Start (Hz)"
            type="number"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            onFocus={() => setEditing(true)}
          />
          <TextField
            size="small"
            label="Stop (Hz)"
            type="number"
            value={stop}
            onChange={(e) => setStop(e.target.value)}
            onFocus={() => setEditing(true)}
          />
        </Stack>

        {/* Live view */}
        <Box sx={{ mt: 1 }}>
          <SdrSpectrumView sdrId={sdrId} intervalId={intervalId} start={interval[0]} end={interval[1]} />
        </Box>
      </CardContent>
    </Card>
  );
}
