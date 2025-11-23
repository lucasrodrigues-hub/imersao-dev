let cardContainer = document.querySelector(".card-container");
let caixaBusca = document.querySelector("#barra-pesquisa");
let categoryFiltersContainer = document.querySelector(".category-filters");
let themeToggleButton = document.querySelector("#theme-toggle");
let dados = [];
let categoriaAtiva = "Todos"; // Começa mostrando todos os produtos

// 🟦 3. Animação de digitação no placeholder
const frasesPlaceholder = [
    "Busque um Produto Google",
    "Pixel, Nest, Chromecast…",
    "O que você procura hoje?"
];
let i = 0;
let j = 0;
let fraseAtual = [];
let isDeleting = false;

function loop() {
    caixaBusca.placeholder = fraseAtual.join('');
    if (i < frasesPlaceholder.length) {
        if (!isDeleting && j <= frasesPlaceholder[i].length) {
            fraseAtual.push(frasesPlaceholder[i][j]);
            j++;
        }
        if (isDeleting && j > 0) {
            fraseAtual.pop();
            j--;
        }
        if (j == frasesPlaceholder[i].length) {
            isDeleting = true;
        }
        if (isDeleting && j === 0) {
            fraseAtual = [];
            isDeleting = false;
            i = (i + 1) % frasesPlaceholder.length;
        }
    }
    const speed = isDeleting ? 100 : 200;
    setTimeout(loop, speed);
}

async function iniciarBusca() {
    let resposta = await fetch("data.json");
    dados = await resposta.json();
    renderizarFiltros();
    aplicarFiltros();
}

// Função para criar e renderizar os botões de filtro
function renderizarFiltros() {
    const categorias = ["Todos", ...new Set(dados.map(dado => dado.categoria))];

    categorias.forEach(categoria => {
        const botao = document.createElement("button");
        botao.classList.add("filter-chip");
        botao.textContent = categoria;
        if (categoria === "Todos") {
            botao.classList.add("active");
        }
        botao.addEventListener("click", () => {
            // Remove a classe 'active' de todos os botões
            document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            botao.classList.add('active');
            categoriaAtiva = categoria;
            aplicarFiltros();
        });
        categoryFiltersContainer.appendChild(botao);
    });
}

// Função unificada para aplicar busca e filtro de categoria
function aplicarFiltros() {
    const termoBusca = caixaBusca.value.toLowerCase();

    let dadosFiltrados = dados;

    // 1. Filtra por categoria (se não for "Todos")
    if (categoriaAtiva !== "Todos") {
        dadosFiltrados = dadosFiltrados.filter(dado => dado.categoria === categoriaAtiva);
    }

    // 2. Filtra pelo termo de busca
    if (termoBusca) {
        dadosFiltrados = dadosFiltrados.filter(dado =>
            dado.nome.toLowerCase().includes(termoBusca) ||
            dado.descricao.toLowerCase().includes(termoBusca)
        );
    }

    renderizarCards(dadosFiltrados);
}

// Função para renderizar os cards
function renderizarCards(dados) {
    cardContainer.innerHTML = ""; // Limpa os cards existentes
    // Adiciona um delay para a animação de fade-in funcionar ao trocar de categoria
    cardContainer.style.opacity = 0;
    setTimeout(() => {
        cardContainer.style.opacity = 1;
    }, 100);

    // Se não houver dados correspondentes à busca, exibe a mensagem
    if (dados.length === 0) {
        cardContainer.innerHTML = `<p class="mensagem-nao-encontrado">Ops... não foi possível encontrar esse produto.</p>`;
        return;
    }

    // Cria e adiciona os cards dos produtos encontrados
    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.style.animationDelay = `${dados.indexOf(dado) * 0.05}s`; // Efeito cascata na animação
        article.innerHTML = `
            <div class="card-image-container">
                <img src="${dado.imagem}" class="card-img" alt="Imagem do produto ${dado.nome}">
            </div>
            <div class="card-content">
                <h2>${dado.nome}</h2>
                <p>${dado.descricao}</p>
                <a href="${dado.link}" target="_blank" class="card-button">Saiba mais</a>
            </div>
        `;
        cardContainer.appendChild(article);
    }
}

// 🟦 6. Header com sombra ao rolar
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// 🟦 7. Lógica do Tema Escuro
function aplicarTema(tema) {
    if (tema === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

themeToggleButton.addEventListener('click', () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const novoTema = isDarkMode ? 'light' : 'dark';
    aplicarTema(novoTema);
    localStorage.setItem('theme', novoTema); // Salva a preferência do usuário
});

// Inicia os eventos
caixaBusca.addEventListener("input", aplicarFiltros);
document.addEventListener("DOMContentLoaded", () => {
    // Verifica se há um tema salvo ou se a preferência do sistema é escura
    const temaSalvo = localStorage.getItem('theme');
    const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    aplicarTema(temaSalvo || (prefereEscuro ? 'dark' : 'light'));
    iniciarBusca();
});
loop(); // Inicia a animação do placeholder