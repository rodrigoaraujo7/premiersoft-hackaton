-- init-scripts/01-init.sql
-- Este script será executado automaticamente na primeira inicialização

-- Exemplo: criar uma tabela de usuários
CREATE TABLE IF NOT EXISTS admins (
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Exemplo: inserir dados iniciais
INSERT INTO admins (email) VALUES 
    ('admin@example.com');