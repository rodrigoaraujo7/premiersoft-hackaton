import { useQuery } from "@tanstack/react-query";
import type { Paciente } from "@/types/paciente";
import { API_BASE_URL } from "@/config/api";

export async function fetchPacientes(): Promise<{ data: Paciente[] }> {
  const response = await fetch(`${API_BASE_URL}/pacientes`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar pacientes: ${response.status}`);
  }

  return response.json();
}

export function usePacientes() {
  return useQuery({
    queryKey: ["pacientes"],
    queryFn: fetchPacientes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
