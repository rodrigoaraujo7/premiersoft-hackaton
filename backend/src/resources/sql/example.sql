-- Create table for 'casa' (house)
CREATE TABLE IF NOT EXISTS example (
    id SERIAL PRIMARY KEY,
    endereco TEXT NOT NULL,
    tamanho NUMERIC(10,2), -- tamanho em metros quadrados
    quartos INTEGER,
    banheiros INTEGER,
    preco NUMERIC(15,2),
    data_construcao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO example (endereco, tamanho, quartos, banheiros, preco, data_construcao) VALUES
('Rua das Flores, 123', 120.50, 3, 2, 250000.00, '2015-05-15'),
('Avenida Brasil, 456', 85.30, 2, 1, 180000.00, '2020-08-20'),
('Praça Central, 789', 150.75, 4, 3, 350000.00, '2018-12-10'),
('Rua Verde, 101', 95.20, 2, 2, 220000.00, '2019-03-25'),
('Alameda Azul, 202', 110.40, 3, 2, 280000.00, '2017-11-30');