--Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  codigo UUID PRIMARY KEY,
  cpf TEXT,
  nome_completo TEXT,
  genero TEXT,
  cod_municipio TEXT,
  bairro TEXT,
  convenio TEXT,
  cid TEXT
);