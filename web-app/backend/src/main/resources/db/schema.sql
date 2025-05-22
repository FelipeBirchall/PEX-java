CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100),
  matricula VARCHAR(20) UNIQUE,
  tipo VARCHAR(10) DEFAULT 'aluno'
);

CREATE TABLE projetos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100),
  descricao TEXT,
  area VARCHAR(50),
  vagas INTEGER
);

-- Usuários de teste
INSERT INTO usuarios (nome, email, senha, matricula, tipo)
VALUES 
('Admin Teste', 'admin@email.com', '12345678', 'admin001', 'admin'),
('Aluno Teste', 'aluno@email.com', '12345678', '123456', 'aluno');