import { useQuery } from "@tanstack/react-query";
import type { Hospital } from "@/types/hospital";

export async function fetchHospitais(): Promise<Hospital[]> {
  const response = await fetch("http://localhost:3000/hospitais");

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
