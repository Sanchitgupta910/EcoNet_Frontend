import { useQuery, useQueryClient } from 'react-query';
import { getBinStatus } from '../services/binApi.js';
import { useWasteSocket } from './useWasteSocket.js';

/**
 * Fetches initial bin status for a branch and applies real-time updates.
 *
 * @param {string} branchId
 * @returns {{ bins: Array, isLoading: boolean, isError: boolean, error: Error }}
 */
export function useBins(branchId) {
  const queryClient = useQueryClient();

  // 1) Base query to fetch bin status
  const {
    data: bins = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    ['binStatus', branchId],
    () =>
      getBinStatus(branchId)
        .then((res) => res.data.data.map((b) => ({
          _id: b._id,
          binName: b.binName,
          latestWeight: b.currentWeight,
          binCapacity: b.binCapacity,
        }))),
    {
      enabled: !!branchId,
      staleTime: 60_000,         // 1 minute
      cacheTime: 5 * 60_000,     // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // 2) Subscribe to Redis→Socket events and patch the cache on each update
  useWasteSocket(branchId, (payload) => {
    queryClient.setQueryData(['binStatus', branchId], (old = []) =>
      old.map((bin) =>
        bin._id === payload.associateBin
          ? { ...bin, latestWeight: payload.currentWeight }
          : bin
      )
    );
  });

  return { bins, isLoading, isError, error };
}
