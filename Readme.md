# Measure app

### Objetivo

Aplicação que faz a leitura e registro de consumo de água e gás.

### Tecnologias

- [Express](https://expressjs.com/pt-br/)
- [Typeorm](https://typeorm.io/)
- [Docker](https://www.docker.com/)
- [Jest](https://jestjs.io/pt-BR/)

### Pré requitos para rodar o projeto

- Docker

### Rodando o projeto

Clone este repositório

        git clone git@github.com:larissaperinoto/measure-app.git

Crie um arquivo .env na raiz do projeto com o seguinte conteúdo

        GEMINI_API_KEY=<chave da API>

Caso não possua uma chave de API para a Gemini API, [clique aqui](https://ai.google.dev/gemini-api/docs/api-key) para criar a sua chave.

Suba os containers com o comando abaixo

        docker-compose up
