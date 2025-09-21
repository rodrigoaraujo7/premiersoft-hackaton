COPY municipios (
  codigo_ibge,
  nome_municipio,
  latitude,
  longitude,
  capital,
  codigo_uf,
  siafi_id,
  ddd,
  fuso_horario,
  populacao
)
FROM '/var/lib/postgresql/data/import/municipio.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');
