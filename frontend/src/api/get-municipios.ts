import { useQuery } from "@tanstack/react-query";
import type { Municipio } from "@/types/municipios";

export async function fetchMunicipios(): Promise<Municipio[]> {
  const response = await fetch("http://localhost:3000/municipios");

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
