import { Typography, Box } from '@mui/material';
import {usePageTitle} from "../context/TitleContext";
import {useEffect, useState} from "react";
import {websocketService} from "../services/WebsocketService";
import {sdrService} from "../services/sdrService";
import SdrView from "../components/SdrView";

export default function SdrListPage() {
  const [sdrs, setSdrs] = useState({});
  const { setTitle } = usePageTitle();

  const initComponent = async () => {
    const sdrs = await sdrService.listSdr();
    setSdrs(sdrs);

    websocketService.addMessageHandler('sdr_list', (event) => {
      sdrService.addWebsocketHandler(event, (data) => {
        setSdrs(prev => sdrService.websocketDatatHandler(prev, data));
      });
    });

    // subscribe to each SDR channel
    for (const sdrId of Object.keys(sdrs)) {
      websocketService.subscribe(`sdr.${sdrId}`);
    }

    sdrService.initPingLostInterval(() => {
      setSdrs(prev => sdrService.pingLostIntervalHandler(prev));
    });
  };

  useEffect(() => {
    setTitle('SDR');
    initComponent().catch(() => {});

    return () => {
      // cleanup
      websocketService.removeMessageHandler('sdr_list');
      sdrService.clearPingLostInterval();
      // IMPORTANT: unsubscribe (was subscribe before)
      for (const sdrId of Object.keys(sdrs)) {
        websocketService.unsubscribe?.(`sdr.${sdrId}`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sdrEntries = Object.entries(sdrs);
  if (sdrEntries.length === 0) {
    return <Typography p={3}>Немає SDR</Typography>;
  }

  return (
    <Box p={3} sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
      {sdrEntries.map(([sdrId, cfg]) => (
        <SdrView
          key={sdrId}
          sdrId={sdrId}
          sdr={cfg}
        />
      ))}
    </Box>
  );
}
