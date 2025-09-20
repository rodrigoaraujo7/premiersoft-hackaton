--- Criação da tabela CID-10
CREATE TABLE if NOT EXISTS CID-10 (
  cid UUID PRIMARY KEY,
  descricaoCid TEXT
);

INSERT INTO CID-1 (descricaoCid) VALUES 
    ('Carcer');