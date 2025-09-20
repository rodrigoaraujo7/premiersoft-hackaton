CREATE TABLE if NOT EXISTS pacientes (
  codigo UUID PRIMARY KEY,
  cpf TEXT,
  nome_completo TEXT,
  genero TEXT,
  cod_municipio TEXT,
  bairro TEXT,
  convenio TEXT,
  cid TEXT
);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);

