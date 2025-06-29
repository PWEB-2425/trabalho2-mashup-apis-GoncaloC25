const searchBtn = document.getElementById('search-btn');
const chatBtn = document.getElementById('send-chat');

const ImagesBott = document.getElementById('images-bottom');
const imagesTop = document.getElementById('images-top');
const imagesGeral = document.getElementById('image-carousel');

const chatGeral = document.getElementById('chatbot');

const baseserverurl = "http://localhost:3001"

searchBtn.addEventListener('click', showImages);
chatBtn.addEventListener('click', chatWithAI);

// Este script é responsável por lidar com a pesquisa de países
// Ativa o evento de envio do formulário
async function showImages () {
    imagesGeral.hidden = false; // Mostra o carrossel de imagens
    chatGeral.hidden = false; // Mostra o chatbot

    // Obtém o valor no campo do país
    const ideia = document.getElementById('search-idea').value;
    if (!ideia) {
        imagesTop.innerText = "Por favor, insira uma ideia.";
        return;
    }

    // Faz uma requisição para a rota /pesquisa/:pais do servidor
   const resposta = await fetch(`${baseserverurl}/pesquisa/` + encodeURIComponent(ideia));

    // Se a resposta for bem-sucedida (status 200)
    if (resposta.ok) {
        const info = await resposta.json(); // Converte a resposta em JSON
        console.log(info);

        // Mostra as informações do país na página
        imagesTop.innerHTML = ""; // Limpa o conteúdo anterior
        ImagesBott.innerHTML = ""; // Limpa o conteúdo anterior

        for (let i = 0; i < info.pictures.length; i++) {
            const img = document.createElement('img'); // Cria um elemento de imagem
            img.src = info.pictures[i]; // Define o src da imagem
            img.alt = `Imagem ${i + 1}`; // Define o texto alternativo
            img.style.width = "200px"; // Define a largura da imagem
            img.style.height = "150px"; // Define a altura da imagem
            img.style.margin = "10px"; // Define a margem da imagem
            
            if (i % 2 == 0){
                imagesTop.appendChild(img); // Adiciona a imagem ao container
            } else {
                ImagesBott.appendChild(img); // Adiciona a imagem ao container
            }
        }   

    } else {
        // Caso haja erro ou país não encontrado, mostra mensagem de erro
        imagesContainer.innerText = "Ideia não encontrada ou erro na pesquisa.";
    }
}

async function chatWithAI() {
    const chatLog = document.getElementById('chat-messages');
    var question = document.getElementById('chat-input').value;

    document.getElementById('chat-input').value = ""; // Limpa o campo de entrada após enviar a pergunta


    if (!question) {
        alert("Por favor, insira uma pergunta.");
        return;
    }

    const usermessage = document.createElement('p'); // Cria um novo parágrafo
    const username = document.createElement('p'); // Obtém o nome de usuário
    usermessage.setAttribute('class', 'user message'); // Define a classe para estilização
    usermessage.textContent = question; // Define o texto da mensagem
    username.textContent = "Eu"; // Define o texto do nome de usuário
    username.setAttribute('class', 'user name'); // Define a classe para estilização
    chatLog.appendChild(username); // Adiciona o nome de usuário ao chat
    chatLog.appendChild(usermessage); // Adiciona a mensagem do usuário ao chat
    chatLog.scrollTop = chatLog.scrollHeight;

    question += `\" sobre: "${document.getElementById('search-idea').value}"`;
    const resposta = await fetch(`${baseserverurl}/ai/` + encodeURIComponent(question));

    if (resposta.ok) {
        const info = await resposta.json(); // Converte a resposta em JSON
        console.log(info);

        const newMessage = document.createElement('p'); // Cria um novo parágrafo
        newMessage.textContent = info.answer; // Define o texto da resposta
        newMessage.setAttribute('class', 'ai message'); // Define a classe para estilização
        const aiName = document.createElement('p'); // Cria um novo parágrafo para o nome da IA
        aiName.textContent = "IdeaAdvisor"; // Define o texto do nome da IA
        aiName.setAttribute('class', 'ai name'); // Define a classe para estilização
        chatLog.appendChild(aiName); // Adiciona o nome da IA ao chat
        chatLog.appendChild(newMessage); // Adiciona a resposta ao chat
        chatLog.scrollTop = chatLog.scrollHeight;
    } else {
        // Caso haja erro, mostra mensagem de erro
        chatLog.innerText = "Erro ao obter resposta da IA.";
    }
}