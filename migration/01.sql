-- init-scripts/01-init.sql
-- Este script será executado automaticamente na primeira inicialização

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Exemplo: criar uma tabela de usuários
CREATE TABLE IF NOT EXISTS users2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo: inserir dados iniciais
INSERT INTO users2 (email, name) VALUES 
    ('admin@example.com', 'Administrator'),
    ('user@example.com', 'User Example')
ON CONFLICT (email) DO NOTHING;