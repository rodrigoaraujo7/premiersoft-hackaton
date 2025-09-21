import { useQuery } from "@tanstack/react-query";
import type { CID } from "@/types/cid";
import { API_BASE_URL } from "@/config/api";

export async function fetchCID(): Promise<{ data: CID[] }> {
  const response = await fetch(`${API_BASE_URL}/cid`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar cid: ${response.status}`);
  }

  return response.json();
}

export function useCID() {
  return useQuery({
    queryKey: ["cid"],
    queryFn: fetchCID,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
