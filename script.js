// Espera o HTML inteiro ser carregado antes de rodar qualquer
// script - é a prática padrão em JavaScript, e garante que todo
// elemento que o código busca (document.getElementById etc.) já
// existe na página nesse momento.
document.addEventListener('DOMContentLoaded', function () {
    /* =========================================================
       EFEITO DE DIGITAÇÃO NO TÍTULO DO HERO
       ========================================================= */

    // As frases que vão se alternar, digitadas uma de cada vez
    const palavras = ["rapidez.", "segurança.", "economia.", "eficiência."];

    // Variáveis de controle do efeito:
    let indicePalavra = 0;   // qual frase do array estamos exibindo agora
    let indiceLetra = 0;     // quantas letras dessa frase já foram digitadas
    let apagando = false;    // true = apagando letras, false = digitando letras

    const elementoPalavra = document.getElementById('palavraAnimada');

    function digitar() {
        // Pega a frase atual do array, usando o índice
        const palavraAtual = palavras[indicePalavra];

        if (!apagando) {
            // MODO DIGITANDO: mostra um pedaço maior da palavra a cada chamada
            // substring(0, N) pega os N primeiros caracteres do texto
            elementoPalavra.textContent = palavraAtual.substring(0, indiceLetra + 1);
            indiceLetra++;

            // Se já digitou a palavra inteira, espera um pouco parado
            // antes de começar a apagar
            if (indiceLetra === palavraAtual.length) {
                apagando = true;
                setTimeout(digitar, 1500); // pausa de 1.5s com a palavra completa
                return; // sai da função aqui, sem continuar para o código abaixo
            }

        } else {
            // MODO APAGANDO: mostra um pedaço cada vez menor da palavra
            elementoPalavra.textContent = palavraAtual.substring(0, indiceLetra - 1);
            indiceLetra--;

            // Se já apagou tudo, passa para a próxima palavra do array
            if (indiceLetra === 0) {
                apagando = false;
                // % (módulo) faz o índice voltar a 0 depois da última palavra,
                // criando um loop infinito pelo array
                indicePalavra = (indicePalavra + 1) % palavras.length;
            }
        }

        // Velocidade: digitar é um pouco mais devagar que apagar (fica mais natural)
        const velocidade = apagando ? 40 : 80;
        setTimeout(digitar, velocidade);
    }

    // Inicia o efeito assim que a página carrega
    digitar();


    /* =========================================================
       MENU MOBILE (abrir/fechar ao clicar no botão hamburguer)
       ========================================================= */

    // document.getElementById busca, em toda a página, o elemento
    // que tem o "id" indicado. Guardamos cada um em uma variável
    // para não precisar buscar de novo toda vez que formos usá-lo.
    const botaoMenu = document.getElementById('menuToggle');
    const listaMenu = document.getElementById('navLinks');

    // addEventListener "escuta" um evento (aqui, 'click') no elemento
    // e executa a função passada sempre que o evento acontecer.
    botaoMenu.addEventListener('click', () => {
        // classList.toggle adiciona a classe "aberto" se ela não existir,
        // ou remove se ela já existir. É um "liga/desliga" automático.
        // A classe "aberto" é a mesma que criamos no CSS (.nav-links.aberto)
        // para mostrar o menu no celular.
        listaMenu.classList.toggle('aberto');
        // Informa leitores de tela (e o CSS do "X") se o menu está aberto
        const aberto = listaMenu.classList.contains('aberto');
        botaoMenu.setAttribute('aria-expanded', aberto);
        botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    // Quando o visitante clica em um link do menu (ex: "Serviços"),
    // fechamos o menu automaticamente - útil no celular, para não
    // deixar o menu aberto cobrindo a seção para onde ele acabou de ir.
    const linksMenu = document.querySelectorAll('.nav-links a');
    // querySelectorAll retorna VÁRIOS elementos que combinam com o
    // seletor CSS indicado (nesse caso, todo <a> dentro de .nav-links).
    // Por isso usamos um "for" para repetir a mesma ação em cada um deles.
    linksMenu.forEach((link) => {
        link.addEventListener('click', () => {
            listaMenu.classList.remove('aberto');
            botaoMenu.setAttribute('aria-expanded', 'false');
        });
    });


    /* =========================================================
       ANO ATUAL NO RODAPÉ
       Em vez de escrever "2026" fixo no HTML (que ficaria
       desatualizado ano que vem), pegamos o ano atual pelo
       JavaScript e inserimos automaticamente.
       ========================================================= */

    const elementoAno = document.getElementById('ano');

    // "new Date()" cria um objeto com a data e hora atuais.
    // ".getFullYear()" extrai só o ano (ex: 2026) desse objeto.
    const anoAtual = new Date().getFullYear();

    // "textContent" define o texto que aparece dentro do elemento.
    elementoAno.textContent = anoAtual;


    /* =========================================================
       CARROSSEL EM MOSAICO (seção "Nosso Trabalho")
       Temos 6 fotos e 6 "quadros" no mosaico (1 grande, 2 médios
       e 3 pequenos). Em vez de trocar de página, as setas GIRAM
       qual foto aparece em cada quadro - assim o mosaico inteiro
       se movimenta junto, como um carrossel.
       ========================================================= */

    // Ícones (SVG) reaproveitados do restante do site, para manter
    // a mesma identidade visual nas legendas das fotos
    const iconeMoto = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"></circle><circle cx="19" cy="17" r="3"></circle><path d="M5 17h4l3-6h4l3 4"></path><path d="M9 11 7 7h3"></path><path d="M14 11h3"></path></svg>';
    const iconeMateriais = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"></path><path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"></path></svg>';
    const iconeGeladeira = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="6" x2="9" y2="8"></line><line x1="9" y1="14" x2="9" y2="16"></line></svg>';
    const iconePoltrona = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path><path d="M3 16v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"></path><path d="M5 18v2"></path><path d="M19 18v2"></path><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"></path></svg>';
    const iconeEtiqueta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r="1" fill="currentColor"></circle></svg>';
    const iconeCaixote = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>';

    // As 6 fotos reais do trabalho, cada uma com sua legenda e ícone
    const fotosTrabalho = [
        { src: 'imagens/imagem1.jpeg', alt: 'Motocicleta transportada na caçamba da picape', legenda: 'Motocicletas', icone: iconeMoto },
        { src: 'imagens/imagem2.jpeg', alt: 'Materiais de construção transportados na picape', legenda: 'Materiais', icone: iconeMateriais },
        { src: 'imagens/imagem3.jpeg', alt: 'Geladeira e fogão sendo transportados', legenda: 'Eletrodomésticos', icone: iconeGeladeira },
        { src: 'imagens/imagem4.jpeg', alt: 'Móveis antigos transportados na picape', legenda: 'Móveis', icone: iconePoltrona },
        { src: 'imagens/imagem5.jpeg', alt: 'Caixas de encomendas transportadas', legenda: 'Encomendas', icone: iconeEtiqueta },
        { src: 'imagens/imagem6.jpeg', alt: 'Cargas especiais transportadas com cuidado', legenda: 'Cargas', icone: iconeCaixote },
    ];

    // Define qual foto (índice em fotosTrabalho) começa em cada quadro
    // do mosaico (0 = quadro grande, 1 = médio de cima, 2 = médio de
    // baixo, 3/4/5 = os três pequenos da fileira debaixo)
    const ordemDosQuadros = [0, 4, 2, 3, 1, 5];

    // Deslocamento atual do carrossel: soma-se a cada índice da ordem
    // acima para descobrir qual foto mostrar em cada quadro
    let deslocamentoCarrossel = 0;

    const quadrosFoto = document.querySelectorAll('.foto-slot');

    function atualizarMosaico() {
        quadrosFoto.forEach((quadro, i) => {
            // % (módulo) faz o índice circular pelo array de fotos,
            // voltando ao início depois da última
            const indiceFoto = (ordemDosQuadros[i] + deslocamentoCarrossel) % fotosTrabalho.length;
            const foto = fotosTrabalho[indiceFoto];

            const imagem = quadro.querySelector('img');
            const textoLegenda = quadro.querySelector('.foto-texto');
            const iconeLegenda = quadro.querySelector('.foto-icone');

            // Efeito rápido de fade: some, troca a foto, e aparece de novo
            imagem.classList.add('trocando');
            setTimeout(() => {
                imagem.src = foto.src;
                imagem.alt = foto.alt;
                textoLegenda.textContent = foto.legenda;
                iconeLegenda.innerHTML = foto.icone;
                imagem.classList.remove('trocando');
            }, 150);
        });
    }

    const botaoFotoAnterior = document.getElementById('fotoAnterior');
    const botaoFotoProxima = document.getElementById('fotoProxima');

    botaoFotoProxima.addEventListener('click', () => {
        deslocamentoCarrossel = (deslocamentoCarrossel + 1) % fotosTrabalho.length;
        atualizarMosaico();
    });

    botaoFotoAnterior.addEventListener('click', () => {
        // Somar (length - 1) e tirar o módulo é a forma de "andar para
        // trás" no índice sem correr o risco de ele ficar negativo
        deslocamentoCarrossel = (deslocamentoCarrossel + fotosTrabalho.length - 1) % fotosTrabalho.length;
        atualizarMosaico();
    });

    // Mostra o mosaico já preenchido assim que a página carrega
    atualizarMosaico();


    /* =========================================================
       LIGHTBOX (abrir foto em tela cheia ao clicar)
       Reaproveita o mesmo array "fotosTrabalho" do carrossel, então
       o visitante pode passear por todas as 6 fotos sem fechar a
       visualização, usando as setas do próprio lightbox.
       ========================================================= */

    const lightbox = document.getElementById('lightbox');
    const lightboxImagem = document.getElementById('lightboxImagem');
    const lightboxLegenda = document.getElementById('lightboxLegenda');
    const botaoLightboxFechar = document.getElementById('lightboxFechar');
    const botaoLightboxAnterior = document.getElementById('lightboxAnterior');
    const botaoLightboxProxima = document.getElementById('lightboxProxima');

    // Guarda em qual foto (índice de fotosTrabalho) o lightbox está
    let indiceLightboxAtual = 0;

    function mostrarFotoNoLightbox(indice) {
        const foto = fotosTrabalho[indice];
        lightboxImagem.classList.remove('zoom'); // sempre abre sem zoom
        lightboxImagem.src = foto.src;
        lightboxImagem.alt = foto.alt;
        lightboxLegenda.textContent = foto.legenda;
        indiceLightboxAtual = indice;
    }

    function abrirLightbox(indice) {
        mostrarFotoNoLightbox(indice);
        lightbox.classList.add('aberto');
        // Impede a página de rolar por trás do lightbox aberto
        document.body.style.overflow = 'hidden';
    }

    function fecharLightbox() {
        lightbox.classList.remove('aberto');
        lightboxImagem.classList.remove('zoom');
        document.body.style.overflow = '';
    }

    // Clicar em qualquer foto do mosaico abre o lightbox já naquela
    // foto (descobrimos qual é comparando o "src" atual do quadro
    // com o array de fotos)
    quadrosFoto.forEach((quadro) => {
        const imagemDoQuadro = quadro.querySelector('img');
        imagemDoQuadro.addEventListener('click', () => {
            const indice = fotosTrabalho.findIndex((foto) => imagemDoQuadro.src.includes(foto.src));
            abrirLightbox(indice === -1 ? 0 : indice);
        });
    });

    botaoLightboxFechar.addEventListener('click', fecharLightbox);

    // Clicar no fundo escuro (fora da foto/legenda) também fecha
    lightbox.addEventListener('click', (evento) => {
        if (evento.target === lightbox) {
            fecharLightbox();
        }
    });

    botaoLightboxProxima.addEventListener('click', () => {
        mostrarFotoNoLightbox((indiceLightboxAtual + 1) % fotosTrabalho.length);
    });

    botaoLightboxAnterior.addEventListener('click', () => {
        mostrarFotoNoLightbox((indiceLightboxAtual + fotosTrabalho.length - 1) % fotosTrabalho.length);
    });

    // Atalhos de teclado: Esc fecha, setas do teclado navegam
    document.addEventListener('keydown', (evento) => {
        if (!lightbox.classList.contains('aberto')) return;

        if (evento.key === 'Escape') fecharLightbox();
        if (evento.key === 'ArrowRight') botaoLightboxProxima.click();
        if (evento.key === 'ArrowLeft') botaoLightboxAnterior.click();
    });

    // Clicar na própria foto alterna o zoom (like uma lupa)
    lightboxImagem.addEventListener('click', () => {
        lightboxImagem.classList.toggle('zoom');
    });

    // Enquanto estiver com zoom, mover o mouse sobre a foto desloca
    // o enquadramento para acompanhar o cursor - como uma lupa
    lightboxImagem.addEventListener('mousemove', (evento) => {
        if (!lightboxImagem.classList.contains('zoom')) return;

        const area = lightboxImagem.getBoundingClientRect();
        // Calcula a posição do cursor dentro da imagem, em porcentagem
        const percentualX = ((evento.clientX - area.left) / area.width) * 100;
        const percentualY = ((evento.clientY - area.top) / area.height) * 100;
        lightboxImagem.style.transformOrigin = `${percentualX}% ${percentualY}%`;
    });


    /* =========================================================
       CARROSSEL DE AVALIAÇÕES (setas voltar/avançar)
       ========================================================= */

    const avaliacoesCarrossel = document.getElementById('avaliacoesCarrossel');
    const avaliacoesBotaoAnterior = document.getElementById('avaliacoesAnterior');
    const avaliacoesBotaoProxima = document.getElementById('avaliacoesProxima');

    // Clicar na seta rola o carrossel na horizontal pela largura de
    // um cartão + o espaçamento (gap) entre eles, em vez de pular
    // direto pra um valor fixo - assim funciona mesmo se o tamanho
    // do cartão mudar (por exemplo, no celular, que é menor).
    function avaliacoesRolar(direcao) {
        const cartao = avaliacoesCarrossel.querySelector('.avaliacoes-item');
        const estiloCarrossel = getComputedStyle(avaliacoesCarrossel);
        const espacamento = parseFloat(estiloCarrossel.gap) || 0;
        const distancia = cartao.offsetWidth + espacamento;

        avaliacoesCarrossel.scrollBy({
            left: distancia * direcao, // direcao: -1 (esquerda) ou 1 (direita)
            behavior: 'smooth'
        });
    }

    avaliacoesBotaoAnterior.addEventListener('click', () => avaliacoesRolar(-1));
    avaliacoesBotaoProxima.addEventListener('click', () => avaliacoesRolar(1));


    /* =========================================================
       SWIPE (ARRASTAR O DEDO) NO CELULAR
       O mosaico de fotos e o lightbox só reagiam a clique nas
       setas. Aqui adicionamos suporte a arrastar o dedo para os
       lados (comum em qualquer app de celular) - sem mudar nada
       do que já funcionava com clique.

       A ideia é sempre a mesma nos dois casos:
       1. "touchstart" (dedo encostou na tela): guarda a posição X
       2. "touchend" (dedo levantou): compara com a posição inicial
       3. Se a diferença for grande o suficiente para os lados,
          entende como um swipe e aciona a mesma ação do clique
          na seta (chamando .click() nela, para não duplicar código)
       ========================================================= */

    // distância mínima (em pixels) para considerar que foi um
    // swipe de verdade, e não só um toque ou um scroll vertical
    const DISTANCIA_MINIMA_SWIPE = 40;

    function ativarSwipe(elemento, aoDeslizarEsquerda, aoDeslizarDireita) {
        let posicaoInicialX = 0;

        elemento.addEventListener('touchstart', (evento) => {
            posicaoInicialX = evento.changedTouches[0].clientX;
        });

        elemento.addEventListener('touchend', (evento) => {
            const posicaoFinalX = evento.changedTouches[0].clientX;
            const distancia = posicaoFinalX - posicaoInicialX;

            if (distancia <= -DISTANCIA_MINIMA_SWIPE) {
                aoDeslizarEsquerda(); // arrastou para a esquerda → "próxima"
            } else if (distancia >= DISTANCIA_MINIMA_SWIPE) {
                aoDeslizarDireita(); // arrastou para a direita → "anterior"
            }
        });
    }

    // Mosaico de fotos: arrastar o dedo sobre a área das fotos
    // aciona a mesma seta que já existia
    const areaMosaico = document.querySelector('.fotos-carrossel');
    if (areaMosaico) {
        ativarSwipe(areaMosaico, () => botaoFotoProxima.click(), () => botaoFotoAnterior.click());
    }

    // Lightbox: arrastar o dedo sobre a foto em tela cheia navega
    // para a próxima/anterior, do mesmo jeito que as setas dele
    ativarSwipe(lightboxImagem, () => botaoLightboxProxima.click(), () => botaoLightboxAnterior.click());



    /* =========================================================
       EFEITOS NOVOS DO REDESIGN
       ========================================================= */

    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Cabeçalho, barra de progresso e link ativo ---------- */
    const cabecalho = document.getElementById('cabecalho');
    const barraProgresso = document.getElementById('barraProgresso');
    // Só os links internos (começam com #); o do WhatsApp fica de fora
    const linksInternos = [...linksMenu].filter((link) => link.getAttribute('href').startsWith('#'));
    const secoesMenu = linksInternos
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter((secao) => secao && secao.id);

    function aoRolar() {
        const y = window.scrollY;
        cabecalho.classList.toggle('rolado', y > 20);

        // Barra no topo: quanto da página já foi lido (0 a 1)
        const total = document.documentElement.scrollHeight - window.innerHeight;
        barraProgresso.style.transform = `scaleX(${total > 0 ? y / total : 0})`;

        // Destaca no menu a seção que está na tela
        let atual = secoesMenu[0];
        secoesMenu.forEach((secao) => {
            if (secao.offsetTop - 120 <= y) atual = secao;
        });
        linksInternos.forEach((link) => {
            link.classList.toggle('ativo', link.getAttribute('href') === '#' + atual.id);
        });
    }
    // passive: true avisa o navegador que não vamos bloquear a rolagem (mais fluido)
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();

    /* ---------- Cards que inclinam em 3D seguindo o mouse ---------- */
    if (temMouse && !menosMovimento) {
        document.querySelectorAll('[data-inclinar]').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;   // 0 a 1
                const y = (e.clientY - r.top) / r.height;   // 0 a 1
                card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
                card.style.setProperty('--mx', `${x * 100}%`);
                card.style.setProperty('--my', `${y * 100}%`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ---------- Contador animado dos números ---------- */
    function animarContador(elemento) {
        const alvo = Number(elemento.dataset.contar);
        const semPonto = elemento.hasAttribute('data-sem-ponto');
        const inicio = semPonto ? alvo - 13 : 0; // "Desde 2013" conta a partir de 2000
        const duracao = 1600;
        const comeco = performance.now();

        function passo(agora) {
            const t = Math.min((agora - comeco) / duracao, 1);
            const suave = 1 - Math.pow(1 - t, 3);
            const valor = Math.round(inicio + (alvo - inicio) * suave);
            elemento.textContent = semPonto ? valor : valor.toLocaleString('pt-BR');
            if (t < 1) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
    }

    /* ---------- Caminhãozinho percorrendo a rota da seção Região ---------- */
    const rota = document.querySelector('.rota');
    const caminhoRota = document.getElementById('rotaCaminho');
    const caminhaoRota = document.querySelector('.rota-caminhao');

    const chipsCidades = document.querySelectorAll('#regiaoCidades li');
    const pinosCidades = [];

    // Converte um ponto da curva (viewBox 1000x120 esticado) para % da caixa
    function pontoDaRota(progresso) {
        const ponto = caminhoRota.getPointAtLength(progresso * caminhoRota.getTotalLength());
        return { x: (ponto.x / 1000) * 100, y: (ponto.y / 120) * 100 };
    }

    // Cria um pino na curva para cada cidade da lista, espaçados igualmente
    if (caminhoRota) {
        chipsCidades.forEach((chip, i) => {
            const fracao = 0.07 + (i / (chipsCidades.length - 1)) * 0.86;
            const pos = pontoDaRota(fracao);
            const pino = document.createElement('span');
            pino.className = 'rota-pino';
            pino.style.left = pos.x + '%';
            pino.style.top = pos.y + '%';
            pino.innerHTML = '<b>' + chip.textContent + '</b>';
            rota.insertBefore(pino, caminhaoRota);
            pinosCidades.push({ pino, chip, fracao });
        });
    }

    // Posiciona o caminhão num ponto da curva (progresso de 0 a 1)
    // e acende as cidades pelas quais ele já passou
    function posicionarCaminhao(progresso) {
        if (!caminhoRota) return;
        const pos = pontoDaRota(progresso);
        caminhaoRota.style.left = pos.x + '%';
        caminhaoRota.style.top = pos.y + '%';
        pinosCidades.forEach(({ pino, chip, fracao }) => {
            const passou = progresso >= fracao - 0.01;
            pino.classList.toggle('ativo', passou);
            chip.classList.toggle('ativo', passou);
        });
    }
    posicionarCaminhao(0);

    /* ---------- Caminhão da linha do tempo ---------- */
    const passosLinhaTempo = document.querySelectorAll('#linhaTempo li');
    const caminhaoLinhaTempo = document.getElementById('linhaTempoCaminhao');
    const linhaVertical = window.matchMedia('(max-width: 1024px)').matches;

    function moverCaminhaoLinhaTempo(progresso) {
        if (!caminhaoLinhaTempo) return;
        caminhaoLinhaTempo.style[linhaVertical ? 'top' : 'left'] = progresso * 100 + '%';
        // Cada passo acende quando o caminhão chega nele
        passosLinhaTempo.forEach((passo, i) => {
            passo.classList.toggle('ativo', progresso >= i / (passosLinhaTempo.length - 1) - 0.02);
        });
    }
    moverCaminhaoLinhaTempo(0);

    /* ---------- Animações de entrada com GSAP + ScrollTrigger ---------- */
    const elementosRevelar = document.querySelectorAll('[data-revelar]');
    const contadores = document.querySelectorAll('[data-contar]');

    if (menosMovimento) {
        posicionarCaminhao(1);
        moverCaminhaoLinhaTempo(1);
        return; // sem animações: tudo aparece direto
    }

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        // Textos do hero entram em sequência logo ao abrir a página
        gsap.from('.hero [data-revelar]', {
            y: 24, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay: 0.1,
        });

        // Demais elementos aparecem ao entrar na tela.
        // ScrollTrigger.batch agrupa os que entram juntos e faz efeito cascata.
        const foraDoHero = [...elementosRevelar].filter((el) => !el.closest('.hero'));
        gsap.set(foraDoHero, { y: 24, opacity: 0 });
        ScrollTrigger.batch(foraDoHero, {
            start: 'top 88%',
            once: true,
            onEnter: (lote) => gsap.to(lote, {
                y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06, overwrite: true,
                clearProps: 'transform' // libera o transform para o efeito de inclinar dos cards
            })
        });

        // Linha do tempo: o trilho se preenche e o caminhão anda junto com a rolagem
        const estadoLinha = { p: 0 };
        gsap.to(estadoLinha, {
            p: 1,
            ease: 'none',
            onUpdate: () => {
                gsap.set('#linhaTempoProgresso', { [linhaVertical ? 'scaleY' : 'scaleX']: estadoLinha.p });
                moverCaminhaoLinhaTempo(estadoLinha.p);
            },
            scrollTrigger: { trigger: '#linhaTempo', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
        });

        // Fotos do mosaico se revelam de baixo para cima, como uma cortina (clip-path)
        gsap.fromTo('.foto-slot',
            { clipPath: 'inset(100% 0% 0% 0% round 18px)' },
            {
                clipPath: 'inset(0% 0% 0% 0% round 18px)',
                duration: 1, ease: 'expo.out', stagger: { each: 0.07, from: 'start' },
                scrollTrigger: { trigger: '.fotos-mosaico', start: 'top 80%', once: true },
                clearProps: 'clipPath'
            });

        // Contadores disparam uma vez quando a faixa de números aparece
        ScrollTrigger.create({
            trigger: '#numeros', start: 'top 80%', once: true,
            onEnter: () => contadores.forEach(animarContador)
        });

        // Caminhão da rota anda junto com a rolagem da seção
        if (rota) {
            const estado = { p: 0 };
            gsap.to(estado, {
                p: 1, ease: 'none',
                onUpdate: () => posicionarCaminhao(estado.p),
                scrollTrigger: { trigger: rota, start: 'top 90%', end: 'bottom 30%', scrub: 0.8 }
            });
        }

        // Fundo do hero se move mais devagar que o conteúdo (parallax)
        gsap.to('.hero-fundo', {
            yPercent: 25, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });

    } else {
        // Plano B se o GSAP não carregar: IntersectionObserver simples
        document.body.classList.add('js-sem-gsap');
        const observador = new IntersectionObserver((itens) => {
            itens.forEach((item) => {
                if (!item.isIntersecting) return;
                item.target.classList.add('visivel');
                observador.unobserve(item.target);
            });
        }, { threshold: 0.15 });
        elementosRevelar.forEach((el) => observador.observe(el));
        contadores.forEach(animarContador);
        posicionarCaminhao(1);
        moverCaminhaoLinhaTempo(1);
    }

});


/* =========================================================
   ORÇAMENTO RÁPIDO
   Junta as respostas do formulário numa mensagem e abre o
   WhatsApp com ela já escrita. Nada é enviado para servidor.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formOrcamento');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const dados = new FormData(form);
        const valor = (campo) => (dados.get(campo) || '').trim();

        // Monta só as linhas que a pessoa preencheu
        const linhas = ['Olá! Vim pelo site e quero um orçamento de frete.', '', `*Tipo:* ${valor('tipo')}`];
        if (valor('origem')) linhas.push(`*Saindo de:* ${valor('origem')}`);
        if (valor('destino')) linhas.push(`*Indo para:* ${valor('destino')}`);
        if (valor('detalhes')) linhas.push(`*Detalhes:* ${valor('detalhes')}`);

        const url = 'https://wa.me/5561998009600?text=' + encodeURIComponent(linhas.join('\n'));
        window.open(url, '_blank', 'noopener');
    });
});
