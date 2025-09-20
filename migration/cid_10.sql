--- Criação da tabela CID-10
CREATE TABLE if NOT EXISTS CID_10 (
  cid UUID PRIMARY KEY,
  descricaoCid TEXT
);
-- Exemplo: inserir dados iniciais
INSERT INTO CID-1 (descricaoCid) VALUES 
    ('Carcer');