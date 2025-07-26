import { useEffect, useState } from "react";
import {
  Box, Select, MenuItem, Pagination,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from "@mui/material";
import {logService} from "../services/logService";
import {usePageTitle} from "../context/TitleContext";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import {format} from "date-fns";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  const [totalPages, setTotalPages] = useState(0);

  const [modules, setModules] = useState([]);

  const perPage = 20;

  const [filters, setFilters] = useState({
    module_id: "",
    from_timestamp: "",
    to_timestamp: "",
    order_direction: "desc",
    skip: 0,
    limit: perPage,
  });

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
  }, []);

  useEffect(() => {
    logService.listModules()
      .then(data => setModules(data));
  }, []);

  useEffect(() => {
    logService.logs(filters)
      .then(data => {
        setTotalPages(Math.ceil(data.total / perPage));
        setLogs(data.logs);
      });
  }, [filters]);

  const handleFilterChange = (key, val) => {
    setPage(1); // reset page
    setFilters(prev => ({ ...prev, [key]: val, skip: 0 }));
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    setFilters(prev => ({ ...prev, skip: (value - 1) * prev.limit }));
  };

  return (
    <Box p={2}>
      <Box display="flex" gap={2} mb={2}>
        <Select
          value={filters.module_id}
          onChange={(e) => handleFilterChange("module_id", e.target.value)}
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
            value={filters.from_timestamp ? new Date(filters.from_timestamp) : null}
            format="dd.MM.yyyy HH:mm"
            onChange={(newValue) => {
              handleFilterChange("from_timestamp", newValue?.toISOString() || "");
            }}
          />

          <DateTimePicker
            label="До"
            ampm={false}
            value={filters.to_timestamp ? new Date(filters.to_timestamp) : null}
            format="dd.MM.yyyy HH:mm"
            onChange={(newValue) => {
              handleFilterChange("to_timestamp", newValue?.toISOString() || "");
            }}
          />
        </LocalizationProvider>

        <Select
          value={filters.order_direction}
          onChange={(e) => handleFilterChange("order_direction", e.target.value)}
        >
          <MenuItem value="desc">Новіші</MenuItem>
          <MenuItem value="asc">Старіші</MenuItem>
        </Select>
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
                  <TableCell>{log.timestamp ? format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss') : ''}</TableCell>
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
