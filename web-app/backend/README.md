# Java Backend Project

## Tecnologias utilizadas

- **Backend**: Java com Spring Boot
- **Banco de Dados**: PostgreSQL
- **Gerenciador de Dependências**: Maven

## Funcionalidades

### Aluno
- Cadastro e login
- Visualização de projetos disponíveis
- Acesso restrito com base no tipo de usuário

### Administrador
- Login com permissão especial
- Cadastro de novos projetos
- Gerenciamento de projetos

## Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/BabiDoo/TI2-GRUPO25.git
```

### 2. Instale as dependências do backend

```bash
cd java-backend
mvn install
```

### 3. Configure o banco de dados PostgreSQL

- Crie um banco chamado `projetos_extensao`
- Execute o seguinte SQL no pgAdmin ou terminal:

```sql
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
```

### 4. Configure o `application.properties`

Edite o arquivo `src/main/resources/application.properties` com as configurações do banco de dados:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/projetos_extensao
spring.datasource.username=postgres
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=update
```

### 5. Inicie o servidor

```bash
mvn spring-boot:run
```

### 6. Acesse a API

A API estará disponível em `http://localhost:8080`.