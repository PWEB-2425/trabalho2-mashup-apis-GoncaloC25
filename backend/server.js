// Importa módulos necessários
const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const bcrypt = require('bcrypt');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

const baseserverurl = process.env.BASE_SERVER_URL;



// Cria uma instância do Express
const app = express();

// Permite receber dados de formulários via POST
app.use(express.urlencoded({ extended: true }));
// Permite receber dados em JSON
app.use(express.json());
// Permite requisições de outros domínios (CORS)
app.use(cors({
  origin: baseserverurl,
  credentials: true
}));

// Session configuration - make sure it's secure in production
app.use(session({
  name: 'sid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    sameSite: 'lax',
    httpOnly: true, // prevents client-side JS from reading the cookie
    maxAge: 1 * 60 * 60 * 1000 // 1 hour
  }
}));

// Rota de login: autentica username e cria sessão
app.post('/login', async (req, res) => {
    const collection = db.collection('users');
    const username = req.body.username;
    const password = req.body.password;
    
    // Procura username na base de dados
    const userdb = await collection.findOne({ username: username });

    if(!userdb){
        return res.status(401).json({
            message: "Utilizador inexistente"
        })
    }

    bcrypt.compare(password, userdb.password, async function (err, isMatch) {
        if (isMatch) {
            // username autenticado com sucesso
            console.log(`Utilizador ${username} autenticado com sucesso.`);
            req.session.username = username;
                
            return res.json({
                success: true
            });

        } else {  
            // Falha na autenticação
            console.log(`Falha na autenticação para o usuário ${username}.`);
            return res.status(401).json({
                message: 'Palavra-passe incorreta'
            })
        }
    });
});

app.use('/register', async (req, res) => {
    const collection = db.collection('users');

    const username = req.body.username;
    const password = req.body.password;

    bcrypt.genSalt(8 /*8 rondas de salting*/ , (err, salt) => {
        if (err) {
            return res.status(500).json({
                message: 'Erro ao fazer salt'
            })
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    message: "Erro ao gerar palavra-passe encriptada"
                })
            }

            collection.insertOne({
                username: username,
                password: hash
            })

            return res.json({
                message: 'Utilizador criado com sucesso! É ncessário fazer iniciar-sessão'
            })
        });
    });
});

// Middleware para proteger rotas: verifica se username está autenticado
function estaAutenticado(req, res, next) {
    if (req.session.username) {
        console.log("Utilizador autenticado");
        next();
    } else {
        console.log("Utilizador não autenticado");
        res.status(401).json({
            message: 'Utilizador não autenticado. Por favor, inicie sessão'
        })
    }
}

// Rota de logout: destroi a sessão autenticada
app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log("Sessão destruida")
    return res.json({
        success: true
    });
});

app.get('/profile', estaAutenticado, (req, res) => {
    const username = req.session.username
    console.log(`Utilizador autenticado: ${username}`)
    res.json({
        name: username
    })
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
    
    const prompt = "O utilizador perguntou: \"" + question + ". Responda de forma clara e objetiva e super bem resumida. Remove toda a estelização markdown";

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
        console.log("A ouvir do site: " + baseserverurl);
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