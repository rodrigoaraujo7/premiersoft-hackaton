import { useQuery } from "@tanstack/react-query";
import type { Medico } from "@/types/medicos";

export async function fetchMedicos(): Promise<Medico[]> {
  const response = await fetch("http://localhost:3000/medicos");

  if (!response.ok) {
    throw new Error(`Erro ao buscar médicos: ${response.status}`);
  }

  return response.json();
}

export function useMedicos() {
  return useQuery({
    queryKey: ["medicos"],
    queryFn: fetchMedicos,
    staleTime: 0, // Sempre considera os dados como "stale" (desatualizados)
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true, // Sempre busca dados ao montar o componente
    refetchOnWindowFocus: true, // Busca dados quando a janela ganha foco
  });
}
