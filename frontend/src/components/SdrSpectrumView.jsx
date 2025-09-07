import {useEffect, useRef} from "react";
import {Box, Typography} from "@mui/material";
import {sdrService} from "../services/sdrService";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function drawSpectrum(ctx, bins, minDb, maxDb) {
  const W = ctx.canvas.clientWidth || 600;
  const H = ctx.canvas.clientHeight || 200;

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);

  const L = bins.length;
  const dbSpan = Math.max(1, maxDb - minDb);
  ctx.strokeStyle = '#33e1ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < L; i++) {
    const x = (i / (L - 1)) * (W - 1);
    const y = H - ((bins[i] - minDb) / dbSpan) * (H - 1);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawWaterfallRow(ctx, bins, minDb, maxDb, waterfallRowsRef, rowBufRef, maxRows) {
  const W = ctx.canvas.clientWidth || 600;
  const H = ctx.canvas.clientHeight || 200;

  const span = Math.max(1, maxDb - minDb);
  const row = rowBufRef.current;
  const L = bins.length;

  // Fill row buffer once
  for (let x = 0; x < W; x++) {
    const idx = Math.floor((x / (W - 1)) * (L - 1));
    const v = Math.floor(clamp(((bins[idx] - minDb) / span) * 255, 0, 255));
    const o = x * 4;
    row[o] = v; row[o + 1] = v; row[o + 2] = v; row[o + 3] = 255;
  }

  const rows = waterfallRowsRef.current;
  // copy row into a fresh buffer to store history
  rows.push(new Uint8ClampedArray(row));
  if (rows.length > maxRows) rows.shift();

  // repaint all rows (newest on top)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const img = ctx.createImageData(W, 1);
  const count = Math.min(rows.length, H);
  for (let y = 0; y < count; y++) {
    img.data.set(rows[rows.length - 1 - y]); // newest first
    ctx.putImageData(img, 0, y);
  }
}

export default function SdrSpectrumView({ sdrId, intervalId, start, end, height = 200 }) {
  const spectrumRef = useRef(null);
  const waterfallRef = useRef(null);

  // Config
  const minDbRef = useRef(-100);
  const maxDbRef = useRef(-20);
  const maxWaterfallRows = 150;

  // Derived binning (fixed per props)
  const MAX_BINS = 500;
  const BIN_WIDTH_HZ = Math.max(Math.floor((end - start) / MAX_BINS), 300e3);
  const L = (end <= start) ? 1 : Math.floor((end - start) / BIN_WIDTH_HZ) + 1;

  // Buffers/flags (no React state)
  const binsRef = useRef(new Float32Array(L).fill(minDbRef.current));
  const sweepDoneRef = useRef(false);
  const waterfallRowsRef = useRef([]);          // array of Uint8ClampedArray rows
  const rowBufRef = useRef(null);               // reused row buffer (Uint8ClampedArray W*4)
  const rafRef = useRef(0);

  // Canvas setup (scale for DPR once)
  useEffect(() => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const setupCanvas = (canvas) => {
      if (!canvas) return;
      const cssW = canvas.clientWidth || 600;
      const cssH = height;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
      return ctx;
    };

    const spCtx = setupCanvas(spectrumRef.current);
    const wfCtx = setupCanvas(waterfallRef.current);

    // Allocate row buffer for waterfall (in CSS pixels)
    if (wfCtx) {
      const W = waterfallRef.current.clientWidth || 600;
      rowBufRef.current = new Uint8ClampedArray(W * 4);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [height]);

  // Subscribe to spectrum data (stable deps!)
  useEffect(() => {
    const handler = (frequency, power) => {
      const idx = Math.floor((frequency - start) / BIN_WIDTH_HZ);
      if (idx < 0 || idx >= L) return;

      const minDb = minDbRef.current;
      const maxDb = maxDbRef.current;
      binsRef.current[idx] = clamp(power, minDb, maxDb);

      // mark sweep done at the end; renderer will pick it up
      if (frequency >= end - BIN_WIDTH_HZ) {
        sweepDoneRef.current = true;
      }
    };

    sdrService.addSpectrumDataUpdateHandler(sdrId, intervalId, handler);
    return () => sdrService.removeSpectrumDataUpdateHandler(sdrId, intervalId);
  }, [sdrId, intervalId, start, end, BIN_WIDTH_HZ, L]);

  // Renderer loop
  useEffect(() => {
    const draw = () => {
      const sp = spectrumRef.current;
      const wf = waterfallRef.current;
      if (!sp || !wf) { rafRef.current = requestAnimationFrame(draw); return; }

      const spCtx = sp.getContext("2d");
      const wfCtx = wf.getContext("2d");

      // Only redraw spectrum continuously if you want smoothness,
      // otherwise you can also gate on sweepDoneRef to draw only per sweep.
      drawSpectrum(spCtx, binsRef.current, minDbRef.current, maxDbRef.current);

      if (sweepDoneRef.current) {
        drawWaterfallRow(wfCtx, binsRef.current, minDbRef.current, maxDbRef.current, waterfallRowsRef, rowBufRef, maxWaterfallRows);
        sweepDoneRef.current = false;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Box sx={{ display: 'grid', gridTemplateRows: 'auto auto', gap: 1 }}>
      <Box sx={{ position: 'relative' }}>
        <canvas ref={spectrumRef} style={{ width: '100%', height }} />
        <Typography variant="caption" sx={{ position: 'absolute', right: 8, top: 4, opacity: 0.7 }}>
          Spectrum
        </Typography>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <canvas ref={waterfallRef} style={{ width: '100%', height }} />
        <Typography variant="caption" sx={{ position: 'absolute', right: 8, top: 4, opacity: 0.7 }}>
          Waterfall
        </Typography>
      </Box>
    </Box>
  );
}