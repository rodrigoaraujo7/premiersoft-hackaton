--Criando tabela municipios
CREATE TABLE if NOT EXISTS municipios (
  codigo_ibge TEXT PRIMARY KEY,
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





