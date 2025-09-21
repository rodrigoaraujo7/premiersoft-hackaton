--Criando tabela municipios
CREATE TABLE if NOT EXISTS municipios (
  codigo_ibge UUID PRIMARY KEY,
  nome_municipio TEXT,
  latitude TEXT,
  longitude TEXT,
  capital TEXT,
  codigo_uf SMALLINT,
  siafi_id SMALLINT,
  ddd SMALLINT,
  fuso_horario TEXT,
  populacao TEXT
);
-- Adicionando ligação com as tabelas
FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge),
FOREIGN KEY (cid) REFERENCES CID_10(cid_id)
