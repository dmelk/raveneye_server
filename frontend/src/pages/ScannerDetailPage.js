import { useParams } from 'react-router';
import ScannerView from "../components/ScannerView";

export default function ScannerDetailPage({scanners}) {
  const { id } = useParams();

  const scanner = scanners[id];

  if (!scanner) {
    return <div>Loading scanner...</div>;
  }


  return <ScannerView scannerId={id} config={scanner} full={true} />;
}
