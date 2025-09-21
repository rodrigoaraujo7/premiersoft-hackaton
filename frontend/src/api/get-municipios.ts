import { useQuery } from "@tanstack/react-query";
import type { Municipio } from "@/types/municipios";
import { API_BASE_URL } from "@/config/api";

export async function fetchMunicipios(): Promise<{ data: Municipio[] }> {
  const response = await fetch(`${API_BASE_URL}/municipios`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar municipios: ${response.status}`);
  }

  return response.json();
}

export function useMunicipios() {
  return useQuery({
    queryKey: ["municipios"],
    queryFn: fetchMunicipios,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
