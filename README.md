# IdeaVision - Pesquisa de ideias (Trabalho 2)

Projeto desenvolvido por Gonçalo Duque Correia, n. 29435

## Descrição

Esta aplicação permite:

- A pesquisa de “ideias” por termos de pesquisa
- Apresentação de imagens tendo em conta o termo pesquisado, utilizando a API externa [pixabay.com](https://pixabay.com/pt/)
- Apos a apresentação das imagens relacionadas, o utilizador poderá fazer perguntas sobre a “ideia” a uma IA, utilizando a API do Google Gemini

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior recomendado)
- [MongoDB](https://www.mongodb.com/) (local ou Atlas)
- npm (geralmente já vem com o Node.js)
- Conta [Google](https://myaccount.google.com)
- Conta [Pixabay](https://pixabay.com/accounts/login/)

## Instalação

1. **Clone o repositório:**

   ```sh
   git clone <url-do-repo>
   cd backend
   ```

2. **Instale as dependências:**

   ```sh
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   - Crie um ficheiro `.env` no diretório /backend/ do projeto com o seguinte conteúdo:
   ```
   SECRET=sua_chave_secreta
   MONGO_URI=string_conexao_mongodb
   PORT=3001
   API_KEY_PIX=chave_api_pixabay
   API_KEY_GEMINI=chave_api_gemini
   ```

   * Ajuste os valores conforme necessário.
   - Poderá obter a string de conexão do MongoDB na sua dashboard do Atlas
   - Poderá obter uma chave de API do Pixabay em [pixabay.com/api/docs](https://pixabay.com/api/docs/) 
   - Poderá obter uma chave de API do Google Gemini em [aistudio.google.com](https://aistudio.google.com)

4. **Certifique-se que o MongoDB está a correr.**

   - Configure a string de conexão para Atlas no `.env`
   - ou se estiver a correr localmente `mongod`

## Como correr o projeto

diretamente invocando o node.js

```sh
node server.js

Ou via npm

```sh
npm start

```

A aplicação ficará disponível em [http://localhost:3001](http://localhost:3001) (ou na porta definida no `.env`).

## Estrutura de pastas
```
Trabalho2/
├── frontend/
│   ├── login.html
│   ├── script.js
│   ├── estilo.css
│   └── index.html
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
└── README.md
```

## Fluxo de utilização

1. Insira uma ideia na caixa de texto no topo da página 
2. A seguir, faça quantas perguntas sejam necessárias ao chatbot.

## Notas para desenvolvimento

- O código está comentado para facilitar a compreensão.
- Pode adicionar novas funcionalidades, como registo de utilizadores, hashing de passwords, etc.
- Para qualquer dúvida, consulte os comentários no código fonte.

---