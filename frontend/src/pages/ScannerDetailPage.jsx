import { useParams } from 'react-router';
import ScannerView from "../components/ScannerView";
import {usePageTitle} from "../context/TitleContext";
import {useEffect} from "react";
import {websocketService} from "../services/WebsocketService";

export default function ScannerDetailPage({scanners}) {
  const { id } = useParams();
  const { setTitle } = usePageTitle();

  const scanner = scanners[id];
  
  useEffect(() => {
    websocketService.subscribe('scanner');

    return () => {
      websocketService.unsubscribe('scanner');
    }
  }, []);

  useEffect(() => {
    setTitle(scanner ? scanner.name : id);
  }, [scanner]);

  if (!scanner) {
    return <div>Loading scanner...</div>;
  }


  return <ScannerView scannerId={id} config={scanner} full={true} />;
}
