import { useQuery } from "@tanstack/react-query";
import type { Estado } from "@/types/estado";

export async function fetchEstados(): Promise<{ data: Estado[] }> {
  const response = await fetch("http://localhost:3000/estados");

  if (!response.ok) {
    throw new Error(`Erro ao buscar estados: ${response.status}`);
  }

  return response.json();
}

export function useEstados() {
  return useQuery({
    queryKey: ["estados"],
    queryFn: fetchEstados,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
