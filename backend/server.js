// Importa módulos necessários
const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

// Cria uma instância do Express
const app = express();

// Permite receber dados de formulários via POST
app.use(express.urlencoded({ extended: true }));
// Configura sessões para autenticação
app.use(session({ secret: process.env.SECRET || "12345" }));
// Permite receber dados em JSON
app.use(express.json());
// Permite requisições de outros domínios (CORS)
app.use(cors())


// Rota pública de exemplo
app.get('/about', (req, res) => {
    res.send('Sobre nós');
});

// proteger a pagina estatica '/pesquisa.html'
// tem que ser feito antes de configurar o servidor estatico

app.use('/pesquisa.html', estaAutenticado,(req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/frontend/login.html');
    }
});

// Configura servidor para servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));


// Rota de login: autentica username e cria sessão
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Procura username na base de dados
    userdb = await collection.findOne({ username: username, password: password });
    if (userdb) {
        // username autenticado com sucesso
        console.log(`Utilizador ${username} autenticado com sucesso.`);
        req.session.username = username;
        return res.redirect('/segredo');    
    } else {  
        // Falha na autenticação
        console.log(`Falha na autenticação para o usuário ${username}.`);
        return res.redirect('/frontend/login.html');
    }
});

// Middleware para proteger rotas: verifica se username está autenticado
function estaAutenticado(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.status(401).redirect('/frontend/login.html');
    }
}

// Rota protegida: só acessível se autenticado
app.get('/segredo', estaAutenticado, (req, res) => {
    // Adiciona link para a página de pesquisa
    res.send(`
        <h1>Bem-vindo ao segredo, ${req.session.username}!</h1>
        <p><a href="/pesquisa.html">Ir para pesquisa de país</a></p>
        <p><a href="/logout">Logout</a></p>
    `);
});

// Rota de logout: destroi a sessão autenticada
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// Rota autenticada para buscar imagens de um termo de pesquisa usando API externa
app.get('/pesquisa/:ideia', async (req, res) => {
    ideia = req.params.ideia;
    console.log(`Procurando imagens sobre: ${ideia}`);
    let URL = `https://pixabay.com/api/?key=${process.env.API_KEY_PIX}&q=` + ideia;
    
    resposta = await fetch(URL);

    if (!resposta.ok) {
        console.error(`Erro ao obter imagens sobre: ${ideia}`);
        return res.status(404).send('Ideia não encontrada ou erro na pesquisa.');
    }

    resultado = await resposta.json();
    //console.log(resultado)

    // Monta objeto com informações relevantes do país
    // o primeiro da lista

    const info = {
      pictures: resultado.hits.slice(0, 25).map(item => item.webformatURL)
    };

    //console.log(`Imagens encontradas: ${info.pictures.hits.length}`);
    
    // Envia resposta JSON com as informações do país
    return res.json(info)
});

app.get('/ai/:question', async (req, res) => {
    var question = req.params.question;
    question = decodeURIComponent(question);
    
    const prompt = "O utilizador perguntou: \"" + question + ". Responda de forma clara e objetiva e super bem resumida.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log(response.text);

    const respostaIA = `${response.text}`;
    
    return res.json({ answer: respostaIA });
});

// Variáveis globais para banco de dados
let db; // instância da ligacao à BD MongoDB
let collection; // Coleção de users

// Função para conectar ao MongoDB e iniciar o servidor
async function start() {
    console.log('Iniciando aplicação...');
    try { 
        // Cria um novo cliente MongoDB usando a string de conexão do .env ou padrão local
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect(); // Estabelece conexão com base de dados
        console.log('Ligado ao MongoDB');
        db = client.db(process.env.DB_NAME); // Seleciona a base de dados DB_NAME do .env
        collection = db.collection('users'); // Seleciona a coleção 'users'
        // Inicia o servidor Express na porta definida no .env ou 3001
        return app.listen(process.env.PORT || 3001, () => {
            const port = process.env.PORT || 3001;
            console.log("Servidor pronto na porta " + port);
        });
    }
    catch (error) {
        // Mostra erro caso não consiga ligar BD e/ou servidor
        console.error('Erro ao iniciar', error);
    }
}

// Inicia a aplicação
start();