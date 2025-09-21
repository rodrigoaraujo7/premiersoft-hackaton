import { useQuery } from "@tanstack/react-query";
import type { Hospital } from "@/types/hospital";
import { API_BASE_URL } from "@/config/api";

export async function fetchHospitais(): Promise<{ data: Hospital[] }> {
  const response = await fetch(`${API_BASE_URL}/hospitais`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar hospitais: ${response.status}`);
  }

  return response.json();
}

export function useHospitais() {
  return useQuery({
    queryKey: ["hospitais"],
    queryFn: fetchHospitais,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
