import { useState, useEffect, useCallback } from 'react';
import { getBinStatus, getLatestBinWeight } from '../services/binApi';
import { useWasteSocket } from './useWasteSocket';

export function useBinStatus(branchId) {
  const [bins, setBins] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await getBinStatus(branchId);
      let data = res.data.data;
      // fetch latest weight per bin in parallel
      data = await Promise.all(
        data.map(async (b) => {
          try {
            const w = await getLatestBinWeight(b._id);
            return { ...b, currentWeight: w.data.data.currentWeight };
          } catch {
            return b;
          }
        }),
      );
      setBins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // real‑time updates: find matching bin and update its weight
  useWasteSocket(branchId, (payload) => {
    setBins((prev) =>
      prev.map((b) =>
        b._id === payload.associateBin ? { ...b, currentWeight: payload.currentWeight } : b,
      ),
    );
  });

  return { bins, isLoading, refresh };
}
