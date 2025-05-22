# Web App - Backend Java + Frontend

## Como rodar

1. Entre na pasta do backend:
   ```
   cd web-app/backend
   ```

2. Execute o backend:
   ```
   mvn spring-boot:run
   ```

3. Acesse o frontend pelo navegador:
   ```
   http://localhost:8080/cadastro.html
   ```
   (ou qualquer outra página HTML do projeto)

## Observações

- O backend serve os arquivos do frontend automaticamente.
- Todas as requisições do frontend para a API devem ser relativas, por exemplo: `/api/usuarios`.
- Certifique-se de que o banco de dados PostgreSQL está rodando e configurado conforme o `application.properties`.