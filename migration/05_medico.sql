--Criar tabela de medicos
CREATE TABLE if NOT EXISTS medicos (
  codigo UUID PRIMARY KEY,
  nome_completo TEXT,
  especialidade_medico TEXT,
  cod_municipio UUID,
  FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge)
);