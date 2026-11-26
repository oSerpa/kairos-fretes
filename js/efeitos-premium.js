/* =========================================================
   EFEITOS PREMIUM
   1. (removido) A rolagem suave com Lenis deixava a página pesada;
      agora a rolagem é a nativa do navegador, que é mais fluida.
   2. Títulos revelados palavra por palavra
   3. Cursor personalizado que segue o mouse com atraso suave
   4. Botões "magnéticos" que puxam levemente na direção do mouse
   5. Fotos que inclinam em 3D sob o mouse

   Os itens 1, 3, 4 e 5 só ligam em computador com mouse.
   No celular o site continua leve, só com os títulos animados.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const temGsap = window.gsap && window.ScrollTrigger;

    if (menosMovimento) return; // respeita quem pediu menos movimento

    // Interpolação linear: anda uma fração "t" do caminho entre a e b.
    // Usada a cada quadro, cria o efeito de "mola" (segue com atraso suave).
    const lerp = (a, b, t) => a + (b - a) * t;

    /* ---------- 2. TÍTULOS PALAVRA POR PALAVRA ---------- */
    // Quebra cada título em palavras; cada palavra fica dentro de uma
    // "janela" (overflow: hidden) e sobe de baixo para cima ao aparecer.
    function quebrarEmPalavras(titulo) {
        const pedacos = [];
        titulo.childNodes.forEach((no) => {
            const destaque = no.nodeType === 1 && no.classList.contains('destaque');
            const texto = no.textContent;
            texto.split(/(\s+)/).forEach((parte) => {
                if (!parte) return;
                if (/^\s+$/.test(parte)) { pedacos.push(' '); return; }
                pedacos.push(`<span class="palavra"><span class="palavra-interna${destaque ? ' destaque' : ''}">${parte}</span></span>`);
            });
        });
        titulo.setAttribute('aria-label', titulo.textContent.replace(/\s+/g, ' ').trim());
        titulo.innerHTML = pedacos.join('');
    }

    if (temGsap) {
        document.querySelectorAll('section:not(.hero):not(.contato) h2').forEach((titulo) => {
            quebrarEmPalavras(titulo);
            gsap.from(titulo.querySelectorAll('.palavra-interna'), {
                yPercent: 110,
                rotate: 4,
                duration: 0.9,
                ease: 'expo.out',
                stagger: 0.05,
                scrollTrigger: { trigger: titulo, start: 'top 88%', once: true }
            });
        });
    }

    if (!temMouse) return; // daqui pra baixo, só no computador

    /* ---------- 3. CURSOR PERSONALIZADO ---------- */
    const ponto = document.createElement('div');
    const anel = document.createElement('div');
    ponto.className = 'cursor-ponto';
    anel.className = 'cursor-anel';
    anel.innerHTML = '<span class="cursor-texto"></span>';
    document.body.append(ponto, anel);
    document.body.classList.add('com-cursor');
    const textoCursor = anel.querySelector('.cursor-texto');

    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let anelX = mouseX, anelY = mouseY;

    window.addEventListener('pointermove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // o ponto acompanha na hora; o anel vem atrás no loop abaixo
        ponto.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        document.body.classList.add('cursor-visivel');
    });
    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-visivel'));

    // O loop só roda enquanto o anel ainda está chegando no mouse;
    // parado, ele dorme e não gasta processamento.
    let anelAndando = false;
    function moverAnel() {
        anelX = lerp(anelX, mouseX, 0.18);
        anelY = lerp(anelY, mouseY, 0.18);
        anel.style.transform = `translate(${anelX}px, ${anelY}px)`;
        if (Math.abs(mouseX - anelX) + Math.abs(mouseY - anelY) > 0.3) requestAnimationFrame(moverAnel);
        else anelAndando = false;
    }
    window.addEventListener('pointermove', () => {
        if (!anelAndando) { anelAndando = true; requestAnimationFrame(moverAnel); }
    });

    // O anel cresce sobre links/botões e mostra "Ver" sobre as fotos
    document.addEventListener('pointerover', (e) => {
        const foto = e.target.closest('.foto-slot');
        const clicavel = e.target.closest('a, button');
        anel.classList.toggle('sobre-clicavel', !!clicavel && !foto);
        anel.classList.toggle('sobre-foto', !!foto);
        textoCursor.textContent = foto ? 'Ver' : '';
    });

    /* ---------- 4. BOTÕES MAGNÉTICOS ---------- */
    document.querySelectorAll('.btn-cta:not(.orcamento-enviar), .nav-cta, .whatsapp-flutuante, .carrossel-seta, .avaliacoes-seta').forEach((botao) => {
        const forca = 0.3; // quanto o botão "puxa" (30% da distância)
        // quickTo reaproveita a mesma animação em vez de criar uma nova a cada movimento
        const irX = gsap.quickTo(botao, 'x', { duration: 0.4, ease: 'power3.out' });
        const irY = gsap.quickTo(botao, 'y', { duration: 0.4, ease: 'power3.out' });
        botao.addEventListener('pointermove', (e) => {
            const r = botao.getBoundingClientRect();
            irX((e.clientX - (r.left + r.width / 2)) * forca);
            irY((e.clientY - (r.top + r.height / 2)) * forca);
        });
        botao.addEventListener('pointerleave', () => {
            // volta ao lugar com um leve "elástico"
            gsap.to(botao, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        });
    });

    /* ---------- 5. FOTOS COM INCLINAÇÃO 3D ---------- */
    document.querySelectorAll('.foto-slot').forEach((foto) => {
        gsap.set(foto, { transformPerspective: 900 });
        const girarY = gsap.quickTo(foto, 'rotateY', { duration: 0.5, ease: 'power3.out' });
        const girarX = gsap.quickTo(foto, 'rotateX', { duration: 0.5, ease: 'power3.out' });
        foto.addEventListener('pointermove', (e) => {
            const r = foto.getBoundingClientRect();
            girarY(((e.clientX - r.left) / r.width - 0.5) * 8);
            girarX(-((e.clientY - r.top) / r.height - 0.5) * 8);
        });
        foto.addEventListener('pointerleave', () => {
            gsap.to(foto, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
        });
    });
});
