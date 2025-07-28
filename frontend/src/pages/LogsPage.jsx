import { useEffect, useState } from "react";
import {
  Box, Select, MenuItem, Pagination,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button
} from "@mui/material";
import { logService } from "../services/logService";
import { usePageTitle } from "../context/TitleContext";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import { format } from "date-fns";
import { useSearchParams } from 'react-router';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  const [totalPages, setTotalPages] = useState(0);

  const [modules, setModules] = useState([]);

  const perPage = 20;

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    module_id: "",
    from_timestamp: "",
    to_timestamp: "",
    order_direction: "desc",
    skip: 0,
    limit: perPage,
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const [page, setPage] = useState(1);
  
  const { setTitle } = usePageTitle();

  const actionMap = {
    "signal_found": "Сигнал знайдено",
    "signal_lost": "Сигнал втрачено",
    "next": "Наступна частота",
    "prev": "Попередня частота",
    "manual_change": "Ручна зміна частоти",
  }

  useEffect(() => {
    setTitle('Логи');

    logService.listModules()
      .then(data => setModules(data));
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const parsed = {
      module_id: searchParams.get("module_id") || "",
      from_timestamp: searchParams.get("from_timestamp") || "",
      to_timestamp: searchParams.get("to_timestamp") || "",
      order_direction: searchParams.get("order_direction") || "desc",
      skip: (page - 1) * perPage,
      limit: perPage
    };
    setFilters(parsed);
    setTempFilters(parsed);
    setPage(page);
  }, [searchParams]);

  useEffect(() => {
    logService.logs(filters)
      .then(data => {
        setTotalPages(Math.ceil(data.total / perPage));
        setLogs(data.logs);
      });
  }, [filters]);

  const handlePageChange = (_, value) => {
    applyFilters(value);
  };

  const renderTimeStamp = (timestamp) => {
    if (!timestamp) return "";
    const trimmed = timestamp.replace(/(\.\d{3})\d{3}/, '$1');
    const date = new Date(trimmed) + 'Z'; // Ensure it's in UTC
    return format(date, 'dd.MM.yyyy HH:mm:ss');
  }

  const applyFilters = (newPage) => {
    const params = { ...tempFilters };
    Object.entries(params).forEach(([key, val]) => {
      if (key === 'skip' || key === 'limit') return; // Skip pagination params
      if (val) searchParams.set(key, val);
      else searchParams.delete(key);
    });
    searchParams.set("page", newPage || 1);
    setSearchParams(searchParams);
  };

  const updateTempFilter = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box p={2}>
      <Box display="flex" gap={2} mb={2}>
        <Select
          variant="outlined"
          value={tempFilters.module_id}
          onChange={(e) => updateTempFilter("module_id", e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Усі сканери</MenuItem>
          {Object.entries(modules).map(([module_id, module]) => (
            <MenuItem key={module_id} value={module_id}>
              {module.name || module_id}
            </MenuItem>
          ))}
        </Select>

        <LocalizationProvider dateAdapter={AdapterDateFns} locale={uk}>
          <DateTimePicker
            label="Від"
            ampm={false}
            value={tempFilters.from_timestamp ? new Date(tempFilters.from_timestamp) : null}
            format="dd.MM.yyyy HH:mm"
            onChange={(newValue) => {
              updateTempFilter("from_timestamp", newValue?.toISOString() || "");
            }}
          />

          <DateTimePicker
            label="До"
            ampm={false}
            value={tempFilters.to_timestamp ? new Date(tempFilters.to_timestamp) : null}
            format="dd.MM.yyyy HH:mm"
            onChange={(newValue) => {
              updateTempFilter("to_timestamp", newValue?.toISOString() || "");
            }}
          />
        </LocalizationProvider>

        <Select
          variant="outlined"
          value={tempFilters.order_direction}
          onChange={(e) => updateTempFilter("order_direction", e.target.value)}
        >
          <MenuItem value="desc">Новіші</MenuItem>
          <MenuItem value="asc">Старіші</MenuItem>
        </Select>

        <Button variant="outlined" onClick={() => applyFilters()}>Застосувати</Button>
      </Box>

      <Box mb={2}>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Модуль</TableCell>
                <TableCell>Дія</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Частота</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow key={`log-${idx}`}>
                  <TableCell>
                    {modules[log.module_id]?.name || log.module_id}
                  </TableCell>
                  <TableCell>{actionMap[log.action] || log.action}</TableCell>
                  <TableCell>{renderTimeStamp(log.timestamp)}</TableCell>
                  <TableCell>
                    {log.frequency ? `${log.frequency} MHz` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Pagination
        count={totalPages} // Optionally calculate based on total results
        page={page}
        onChange={handlePageChange}
      />
    </Box>
  );
}
