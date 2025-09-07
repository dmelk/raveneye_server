import { Typography, Box } from '@mui/material';
import {usePageTitle} from "../context/TitleContext";
import {useEffect, useState} from "react";
import {websocketService} from "../services/WebsocketService";
import {sdrService} from "../services/sdrService";

export default function SdrListPage() {
  const [sdrs, setSdrs] = useState({});

  const { setTitle } = usePageTitle();

  const initComponent = async () => {
    const sdrs = await sdrService.listSdr();
    setSdrs(sdrs);

    websocketService.addMessageHandler('sdr_list', (event) => {
      sdrService.addWebsocketHandler(event, (data) => {
        setSdrs(prevSdrs => {
          return sdrService.websocketDatatHandler(prevSdrs, data);
        });
      });
    });

    for (const sdrId of Object.keys(sdrs)) {
      websocketService.subscribe(`sdr.${sdrId}`);
    }

    sdrService.initPingLostInterval(() => {
      setSdrs(prevSdrs => {
        return sdrService.pingLostIntervalHandler(prevSdrs);
      })
    });
  }

  useEffect(() => {
    setTitle('SDR');

    initComponent().then().catch();

    return () => {
      websocketService.removeMessageHandler('sdr_list');
      sdrService.clearPingLostInterval()
      for (const sdrId of Object.keys(sdrs)) {
        websocketService.subscribe(`sdr.${sdrId}`);
      }
    }
  }, []);

  const sdrEntities = Object.entries(sdrs);

  if (sdrEntities.length === 0) {
    return <Typography p={3}>Немає SDR</Typography>;
  }

  return (
    <Box p={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
      </Box>
    </Box>
  );
}
