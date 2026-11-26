/* =========================================================
   CENA 3D DO HERO (three.js)
   Monta uma picape low-poly carregada de caixas, andando numa
   "maquete" de estrada, com caixas e um pino de localização
   flutuando em volta. Tudo é feito com formas simples (caixas e
   cilindros), sem precisar de nenhum arquivo de modelo 3D.

   Cuidados de desempenho:
   - pausa quando o hero sai da tela ou a aba fica escondida
   - no celular usa resolução menor e menos objetos
   - quem pediu "reduzir movimento" vê só um quadro parado
   ========================================================= */
(function () {
    const area = document.getElementById('hero3d');
    const canvas = document.getElementById('cena3d');
    if (!area || !canvas) return;

    // Se a biblioteca não carregou, mostra o banner no lugar
    if (typeof THREE === 'undefined') {
        area.classList.add('sem-3d');
        return;
    }

    const ehCelular = window.matchMedia('(max-width: 860px)').matches;
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- RENDERIZADOR ----------
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !ehCelular, powerPreference: 'low-power' });
    } catch (erro) {
        area.classList.add('sem-3d'); // navegador sem WebGL
        return;
    }
    // Limita a resolução: telas retina no celular pesariam demais
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ehCelular ? 1.25 : 1.5));

    const cena = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(8.5, 5.2, 10.5);
    camera.lookAt(0, 0.7, 0);

    // ---------- LUZES ----------
    cena.add(new THREE.HemisphereLight(0xdbe6ff, 0x0b1224, 0.75));

    const sol = new THREE.DirectionalLight(0xfff0e0, 0.9);
    sol.position.set(6, 10, 6);
    cena.add(sol);

    // Luz laranja por trás, para destacar o contorno do caminhão
    const contraluz = new THREE.PointLight(0xec955f, 1.4, 20);
    contraluz.position.set(-4, 3, -5);
    cena.add(contraluz);

    // ---------- MATERIAIS (cores da marca) ----------
    const mat = (cor, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.55, metalness: 0.05, flatShading: true }, extra));

    const M = {
        laranja: mat(0xec955f, { roughness: 0.4, metalness: 0.1, emissive: 0x6a2e0e, emissiveIntensity: 0.35 }),
        laranjaEscuro: mat(0xd2723a),
        chassi: mat(0x262c3a),
        pneu: mat(0x15181f, { roughness: 0.9 }),
        roda: mat(0xc7ccd6, { metalness: 0.6, roughness: 0.3 }),
        vidro: mat(0x9cc4ec, { roughness: 0.1, metalness: 0.4, emissive: 0x1d3557, emissiveIntensity: 0.4 }),
        farol: mat(0xfff3c4, { emissive: 0xffe08a, emissiveIntensity: 1.2 }),
        lanterna: mat(0xff4d4d, { emissive: 0xff2a2a, emissiveIntensity: 0.9 }),
        caixa: mat(0xc99a63, { roughness: 0.85 }),
        caixaClara: mat(0xdcb07a, { roughness: 0.85 }),
        fita: mat(0xf3dcb4, { roughness: 0.6 }),
        base: mat(0x1c2a4f, { roughness: 0.9 }),
        asfalto: mat(0x2b3656, { roughness: 0.95 }),
        faixa: mat(0xf7c8a6, { emissive: 0xec955f, emissiveIntensity: 0.25 }),
        pino: mat(0xec955f, { flatShading: false, roughness: 0.35, metalness: 0.2 })
    };

    // Atalho para criar uma caixa (box) já posicionada
    function bloco(l, a, p, material, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), material);
        m.position.set(x, y, z);
        return m;
    }

    // Grupo geral: girar ele gira a maquete inteira
    const maquete = new THREE.Group();
    cena.add(maquete);

    // ---------- BASE / ESTRADA ----------
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.35, 48), M.base);
    base.position.y = -0.18;
    maquete.add(base);

    const estrada = bloco(9.15, 0.04, 2.6, M.asfalto, 0, 0.02, 0);
    maquete.add(estrada);

    // Faixas tracejadas que andam para trás (dá a sensação de movimento)
    const faixas = [];
    const qtdFaixas = 8;
    for (let i = 0; i < qtdFaixas; i++) {
        const f = bloco(0.55, 0.02, 0.1, M.faixa, -4.5 + i * 1.15, 0.05, 0);
        faixas.push(f);
        maquete.add(f);
    }

    // Sombra falsa (um círculo escuro desfocado): bem mais leve que sombra real
    const texturaSombra = (function () {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0,0,0,0.55)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    })();
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8), new THREE.MeshBasicMaterial({ map: texturaSombra, transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.06;
    maquete.add(sombra);

    // ---------- PICAPE ----------
    const picape = new THREE.Group();
    const carroceria = new THREE.Group(); // parte que balança na suspensão
    picape.add(carroceria);
    maquete.add(picape);

    carroceria.add(bloco(4.5, 0.32, 1.7, M.chassi, 0, 0.62, 0));             // chassi
    carroceria.add(bloco(1.55, 1.05, 1.62, M.laranja, 0.95, 1.3, 0));        // cabine
    carroceria.add(bloco(1.0, 0.62, 1.62, M.laranja, 2.05, 1.07, 0));        // capô
    carroceria.add(bloco(0.95, 0.46, 1.66, M.vidro, 0.85, 1.52, 0));         // janelas laterais
    carroceria.add(bloco(0.16, 0.24, 1.72, M.chassi, 2.6, 0.72, 0));         // para-choque dianteiro
    carroceria.add(bloco(0.16, 0.22, 1.72, M.chassi, -2.32, 0.72, 0));       // para-choque traseiro

    // Para-brisa reto, colado na frente da cabine (frente da cabine fica em x = 1.725)
    carroceria.add(bloco(0.04, 0.4, 1.36, M.vidro, 1.735, 1.58, 0));

    // Teto um pouco mais escuro
    carroceria.add(bloco(1.3, 0.06, 1.64, M.laranjaEscuro, 0.85, 1.84, 0));

    // Faróis e lanternas
    [-0.58, 0.58].forEach((z) => {
        carroceria.add(bloco(0.06, 0.16, 0.32, M.farol, 2.56, 1.12, z));
        carroceria.add(bloco(0.06, 0.26, 0.16, M.lanterna, -2.3, 1.02, z * 1.2));
    });

    // Caçamba: piso + laterais + tampa traseira
    carroceria.add(bloco(2.55, 0.1, 1.62, M.laranjaEscuro, -1.0, 0.82, 0));
    carroceria.add(bloco(2.55, 0.48, 0.08, M.laranja, -1.0, 1.06, 0.77));
    carroceria.add(bloco(2.55, 0.48, 0.08, M.laranja, -1.0, 1.06, -0.77));
    carroceria.add(bloco(0.08, 0.48, 1.62, M.laranja, -2.24, 1.06, 0));

    // Faixa decorativa na porta
    carroceria.add(bloco(1.2, 0.08, 1.64, M.chassi, 0.9, 0.98, 0));

    // Caixas de papelão na caçamba (largura, altura, profundidade, x, y, z, giro)
    const caixasCacamba = [
        [0.9, 0.7, 0.7, -1.7, 1.22, -0.36, 0.05],
        [0.9, 0.7, 0.7, -1.7, 1.22, 0.38, -0.04],
        [0.8, 0.6, 0.75, -0.75, 1.17, -0.34, 0.1],
        [0.75, 0.55, 0.7, -0.75, 1.15, 0.38, 0],
        [0.7, 0.55, 0.6, -1.65, 1.85, 0.0, 0.18],
        [0.55, 0.45, 0.5, -0.8, 1.7, 0.1, -0.2]
    ];
    caixasCacamba.forEach(([l, a, p, x, y, z, r], i) => {
        const g = new THREE.Group();
        g.add(bloco(l, a, p, i % 2 ? M.caixaClara : M.caixa, 0, 0, 0));
        g.add(bloco(l + 0.01, 0.02, 0.14, M.fita, 0, a / 2, 0)); // fita adesiva
        g.position.set(x, y, z);
        g.rotation.y = r;
        carroceria.add(g);
    });

    // Rodas (giram enquanto o caminhão "anda")
    const rodas = [];
    const geoPneu = new THREE.CylinderGeometry(0.44, 0.44, 0.32, 20);
    const geoCubo = new THREE.CylinderGeometry(0.22, 0.22, 0.34, 8);
    [[1.6, 0.86], [1.6, -0.86], [-1.35, 0.86], [-1.35, -0.86]].forEach(([x, z]) => {
        const roda = new THREE.Group();
        roda.add(new THREE.Mesh(geoPneu, M.pneu));
        roda.add(new THREE.Mesh(geoCubo, M.roda));
        roda.rotation.x = Math.PI / 2;
        const suporte = new THREE.Group(); // gira em z sem bagunçar o x acima
        suporte.position.set(x, 0.44, z);
        suporte.add(roda);
        picape.add(suporte);
        rodas.push(suporte);
    });

    // ---------- OBJETOS FLUTUANTES ----------
    const flutuantes = [];

    function caixaFlutuante(tamanho, x, y, z) {
        const g = new THREE.Group();
        g.add(bloco(tamanho, tamanho * 0.8, tamanho, M.caixaClara, 0, 0, 0));
        g.add(bloco(tamanho + 0.01, 0.02, tamanho * 0.2, M.fita, 0, tamanho * 0.4, 0));
        g.position.set(x, y, z);
        g.userData = { yBase: y, fase: Math.random() * Math.PI * 2, giro: 0.3 + Math.random() * 0.4 };
        maquete.add(g);
        flutuantes.push(g);
    }

    caixaFlutuante(0.6, -3.4, 3.0, -1.6);
    caixaFlutuante(0.45, 3.8, 2.2, 1.8);
    if (!ehCelular) {
        caixaFlutuante(0.35, -2.2, 3.9, 2.2);
        caixaFlutuante(0.4, 1.0, 4.2, -2.6);
    }

    // Pino de localização (esfera + cone), lembrando a rota do frete
    const pino = new THREE.Group();
    const cabecaPino = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), M.pino);
    cabecaPino.position.y = 0.55;
    const pontaPino = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.75, 24), M.pino);
    pontaPino.rotation.x = Math.PI;
    pontaPino.position.y = 0.05;
    const furoPino = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mat(0x111a33));
    furoPino.position.set(0, 0.58, 0.32);
    pino.add(cabecaPino, pontaPino, furoPino);
    pino.position.set(3.4, 2.9, -1.2);
    pino.userData = { yBase: 2.9, fase: 1, giro: 0.8 };
    maquete.add(pino);
    flutuantes.push(pino);

    // ---------- ROTAS DE LUZ ----------
    // Arcos que saem de um ponto da maquete e chegam em outro, com uma
    // "luz" percorrendo cada um: representa as entregas acontecendo.
    const arcos = [];
    const matArco = new THREE.MeshBasicMaterial({ color: 0xec955f, transparent: true, opacity: 0.35 });
    const matLuz = new THREE.MeshBasicMaterial({ color: 0xffe2c8 });
    const matMarco = new THREE.MeshBasicMaterial({ color: 0xec955f, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

    function criarArco(inicio, fim, altura, velocidade) {
        const meio = inicio.clone().add(fim).multiplyScalar(0.5);
        meio.y = altura;
        const curva = new THREE.QuadraticBezierCurve3(inicio, meio, fim);
        maquete.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 48, 0.022, 6, false), matArco));

        // anéis marcando a origem e o destino no chão
        [inicio, fim].forEach((ponto) => {
            const anel = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.2, 24), matMarco);
            anel.rotation.x = -Math.PI / 2;
            anel.position.set(ponto.x, 0.03, ponto.z);
            maquete.add(anel);
        });

        const luz = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), matLuz);
        maquete.add(luz);
        arcos.push({ curva, luz, t: Math.random(), velocidade });
    }

    criarArco(new THREE.Vector3(-3.6, 0.03, -1.6), new THREE.Vector3(2.8, 0.03, -2.9), 3.4, 0.22);
    criarArco(new THREE.Vector3(-2.2, 0.03, 2.6), new THREE.Vector3(3.6, 0.03, 1.6), 2.4, 0.3);
    if (!ehCelular) criarArco(new THREE.Vector3(-3.9, 0.03, 1.2), new THREE.Vector3(1.2, 0.03, -3.6), 4.2, 0.18);

    // ---------- PARTÍCULAS (poeira de luz flutuando) ----------
    const qtdParticulas = ehCelular ? 60 : 160;
    const posicoes = new Float32Array(qtdParticulas * 3);
    for (let i = 0; i < qtdParticulas; i++) {
        posicoes[i * 3] = (Math.random() - 0.5) * 16;      // x
        posicoes[i * 3 + 1] = Math.random() * 7;           // y
        posicoes[i * 3 + 2] = (Math.random() - 0.5) * 12;  // z
    }
    const geoParticulas = new THREE.BufferGeometry();
    geoParticulas.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
    const particulas = new THREE.Points(geoParticulas, new THREE.PointsMaterial({
        color: 0xf7c8a6, size: 0.05, transparent: true, opacity: 0.75, depthWrite: false
    }));
    cena.add(particulas);

    // ---------- TAMANHO DA TELA ----------
    function ajustarTamanho() {
        const largura = area.clientWidth;
        const altura = area.clientHeight;
        if (!largura || !altura) return;
        renderer.setSize(largura, altura, false);
        camera.aspect = largura / altura;
        // Em telas estreitas afasta a câmera para caber tudo
        camera.position.setLength(camera.aspect < 1.05 ? 16.5 : 15);
        camera.updateProjectionMatrix();
    }
    ajustarTamanho();
    new ResizeObserver(ajustarTamanho).observe(area);

    // ---------- INTERAÇÃO (mouse e arrastar) ----------
    let alvoGiroY = 0, alvoGiroX = 0;   // para onde queremos girar
    let giroY = 0, giroX = 0;           // giro atual (suavizado)
    let arrasteGiro = 0, arrastando = false, inicioArraste = 0, giroNoInicio = 0;

    // Parallax: a maquete acompanha o mouse levemente
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        alvoGiroY = nx * 0.5;
        alvoGiroX = ny * 0.12;
        if (arrastando) arrasteGiro = giroNoInicio + (e.clientX - inicioArraste) * 0.01;
    });

    // Arrastar com o mouse gira a maquete (no toque deixamos a rolagem livre)
    canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        arrastando = true;
        inicioArraste = e.clientX;
        giroNoInicio = arrasteGiro;
    });
    window.addEventListener('pointerup', () => { arrastando = false; });

    // ---------- LOOP DE ANIMAÇÃO ----------
    const relogio = new THREE.Clock();
    let tempo = 0;
    let rodando = false;
    let entrada = 0; // 0 → 1 durante a animação de chegada do caminhão

    const suavizar = (t) => 1 - Math.pow(1 - t, 3); // easing "ease-out"

    function quadro() {
        const dt = Math.min(relogio.getDelta(), 0.05);
        tempo += dt;
        entrada = Math.min(entrada + dt / 1.8, 1);
        const e = suavizar(entrada);

        // Quanto do hero já foi rolado (0 no topo, 1 quando sumiu)
        const rolagem = Math.min(window.scrollY / (area.closest('section').offsetHeight || 1), 1);

        // Caminhão chega pela esquerda e, ao rolar, avança um pouco.
        // LIMITE_PISTA garante que ele nunca saia da estrada (que vai de
        // -4.57 a 4.57; metade do caminhão mede ~2.3)
        const LIMITE_PISTA = 2.1;
        const xDesejado = (1 - e) * -LIMITE_PISTA + rolagem * LIMITE_PISTA;
        picape.position.x = Math.max(-LIMITE_PISTA, Math.min(LIMITE_PISTA, xDesejado));
        sombra.position.x = picape.position.x;

        // Suspensão: pequena vibração da carroceria
        carroceria.position.y = Math.sin(tempo * 9) * 0.018;
        carroceria.rotation.x = Math.sin(tempo * 5.5) * 0.008;

        // Velocidade "aparente": mais rápida na chegada e ao rolar
        const velocidade = 2.2 + (1 - e) * 6 + rolagem * 6;
        rodas.forEach((r) => { r.rotation.z -= velocidade * dt / 0.44; });
        faixas.forEach((f) => {
            f.position.x -= velocidade * dt;
            if (f.position.x < -4.6) f.position.x += qtdFaixas * 1.15;
        });

        // Objetos flutuando e girando
        flutuantes.forEach((o) => {
            const d = o.userData;
            o.position.y = d.yBase + Math.sin(tempo * 1.4 + d.fase) * 0.18;
            o.rotation.y += d.giro * dt;
            o.scale.setScalar(e);
        });

        // Giro suave da maquete (balanço automático + mouse + arraste)
        giroY += (alvoGiroY + arrasteGiro + Math.sin(tempo * 0.35) * 0.18 - giroY) * 0.05;
        giroX += (alvoGiroX - giroX) * 0.05;
        maquete.rotation.y = giroY - 0.25;
        maquete.rotation.x = giroX;

        // Luzes percorrendo as rotas
        arcos.forEach((a) => {
            a.t = (a.t + a.velocidade * dt) % 1;
            a.luz.position.copy(a.curva.getPoint(a.t));
            a.luz.scale.setScalar(e * (0.6 + Math.sin(a.t * Math.PI) * 0.6));
        });

        // Partículas sobem devagar e recomeçam embaixo
        const pos = geoParticulas.attributes.position;
        for (let i = 0; i < qtdParticulas; i++) {
            let y = pos.getY(i) + dt * 0.25;
            if (y > 7) y = 0;
            pos.setY(i, y);
        }
        pos.needsUpdate = true;
        particulas.rotation.y = tempo * 0.02;

        renderer.render(cena, camera);
        if (rodando) requestAnimationFrame(quadro);
    }

    function iniciar() {
        if (rodando || menosMovimento) return;
        rodando = true;
        relogio.getDelta(); // descarta o tempo que ficou pausado
        requestAnimationFrame(quadro);
    }

    function pausar() {
        rodando = false;
    }

    if (menosMovimento) {
        // Mostra um único quadro com tudo já no lugar
        entrada = 1;
        quadro();
        return;
    }

    // Só anima enquanto o hero está visível
    new IntersectionObserver((entradas) => {
        entradas[0].isIntersecting ? iniciar() : pausar();
    }).observe(area);

    document.addEventListener('visibilitychange', () => {
        document.hidden ? pausar() : iniciar();
    });
})();
