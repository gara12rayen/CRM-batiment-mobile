import { useState } from "react";

export function useScanDevis() {
  const [scannedData, setScannedData] = useState<string | null>(null);

  function handleScan(data: string) {
    if (scannedData !== null) return;

    setScannedData(data);
  }

  function resetScan() {
    setScannedData(null);
  }

  return {
    scannedData,
    handleScan,
    resetScan,
  };
}