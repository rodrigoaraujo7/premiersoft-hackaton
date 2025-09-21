--Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  codigo UUID PRIMARY KEY,
  cpf TEXT,
  nome_completo TEXT,
  genero TEXT,
  cod_municipio UUID,
  bairro TEXT,
  convenio TEXT,
  cid UUID,
  FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge),
  FOREIGN KEY (cid) REFERENCES CID_10(cid_id)
);


--Indice na coluna cpf da tabela para agilizar pesquisas.
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);