/*
 * Estrutura compartilhada: ícones, topo, menu do celular, acessibilidade,
 * rodapé com o crédito da desenvolvedora e aviso de demonstração.
 *
 * Uso: <div id="topo"></div><script src="./js/layout.js"></script> logo após <body>
 *      <div id="rodape"></div> antes de </body>
 */
(function () {
    const ICONES = {
        cruz: '<path d="M12 5v14M5 12h14"/>',
        ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
        calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
        copiar: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        sino: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
        relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
        pessoas: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        megafone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
        tv: '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/>',
        impressora: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        estrela: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
        contraste: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>',
        som: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
        mudo: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m23 9-6 6M17 9l6 6"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
        menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
        seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        setaEsquerda: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
        proxima: '<path d="m9 18 6-6-6-6"/>',
        anterior: '<path d="m15 18-6-6 6-6"/>',
        repetir: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
        lixeira: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
        busca: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
        telefone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
        pino: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
        email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
        github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.3-2.5-1-3.5.3-1.2.3-2.4 0-3.5 0 0-1 0-3 1.5a13.4 13.4 0 0 0-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.4.5-.7 1-.9 1.7-.2.6-.2 1.2-.1 1.8v4"/><path d="M9 18c-4.5 2-5-2-7-2"/>',
        linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
        historia: '<path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
        alvo: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        olho: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
        diamante: '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6M2 9h20"/>',
        // Especialidades
        coracao: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3.2 12h3.3l1.5-3 3 6 2-3h7.8"/>',
        cerebro: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5-.5 2.5 2.5 0 0 1-3-3 3 3 0 0 1-.3-5.6A2.5 2.5 0 0 1 5 6.2 2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5-.5 2.5 2.5 0 0 0 3-3 3 3 0 0 0 .3-5.6A2.5 2.5 0 0 0 19 6.2 2.5 2.5 0 0 0 14.5 2z"/>',
        sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        bebe: '<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5S14.6 8 13.5 8c-.8 0-1.5-.4-1.5-1"/>',
        pulso: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        osso: '<path d="M17 10c.7-.7 1.7 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .8.7 1.8 0 2.5l-7 7c-.7.7-1.7 0-2.5 0a2.5 2.5 0 0 0 0 5c.3 0 .5.2.5.5a2.5 2.5 0 1 0 5 0c0-.8-.7-1.8 0-2.5Z"/>',
        feminino: '<circle cx="12" cy="9" r="6"/><path d="M12 15v7M9 19h6"/>',
        gota: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
        pilula: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
        laco: '<path d="M12 2a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4z"/><path d="M8.5 11.5 5 21l3-1 2 2 2-6M15.5 11.5 19 21l-3-1-2 2-2-6"/>',
        seringa: '<path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6"/>',
        escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        pulmao: '<path d="M6.1 6.1C3.6 7.3 2 11.2 2 15.4c0 2.3 1.2 3.6 3 3.6 2.5 0 4-2 4-5V8.7M17.9 6.1c2.5 1.2 4.1 5.1 4.1 9.3 0 2.3-1.2 3.6-3 3.6-2.5 0-4-2-4-5V8.7M12 2v8M9 8l3 2 3-2"/>',
    };
    window.icone = (nome, extra = '') => `<svg class="icone ${extra}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ''}</svg>`;

    const pagina = location.pathname.split('/').pop() || 'index.html';
    const LINKS = [
        { href: './index.html', chave: 'nav.inicio' },
        { href: './fila.html', chave: 'nav.fila' },
        { href: './especialidades.html', chave: 'nav.especialidades' },
        { href: './sobre.html', chave: 'nav.sobre' },
    ];
    const atual = (href) => href.replace('./', '') === pagina ? ' aria-current="page"' : '';
    const links = LINKS.map(l => `<a href="${l.href}"${atual(l.href)} data-i18n="${l.chave}"></a>`).join('');

    const MARCA = `<span class="marca-icone">${icone('cruz')}</span><span class="marca-nome">Hospital Santa Cecilia<small data-i18n="marca.sub"></small></span>`;
    window.MARCA_HSC = MARCA;

    const acessibilidade = `
        <div class="acessibilidade" role="group">
            <button type="button" data-acao="contraste" aria-pressed="false" data-i18n-title="acess.contraste" data-i18n-aria="acess.contraste">${icone('contraste')}</button>
            <button type="button" data-acao="menor" data-i18n-title="acess.menor" data-i18n-aria="acess.menor">A−</button>
            <button type="button" data-acao="padrao" data-i18n-title="acess.padrao" data-i18n-aria="acess.padrao">A</button>
            <button type="button" data-acao="maior" data-i18n-title="acess.maior" data-i18n-aria="acess.maior">A+</button>
        </div>`;

    const topo = `
<a class="visualmente-oculto" href="#conteudo" data-i18n="pular"></a>
<header class="topo">
    <div class="container">
        <a class="marca" href="./index.html" aria-label="Hospital Santa Cecilia">${MARCA}</a>
        <nav class="menu-principal" aria-label="Menu">${links}</nav>
        <div class="ferramentas">
            ${acessibilidade}
            <div data-globo></div>
            <button type="button" class="botao-menu" id="botaoMenu" aria-expanded="false" aria-controls="gaveta" data-i18n-aria="menu.abrir">${icone('menu')}</button>
        </div>
    </div>
</header>
<div class="gaveta" id="gaveta">
    <nav aria-label="Menu">${links}</nav>
    <div class="gaveta-ferramentas">${acessibilidade}<div data-globo></div></div>
</div>
<div class="aviso-demo" role="note">
    ${icone('info')}
    <div><strong data-i18n="demo.titulo"></strong><span data-i18n="demo.texto"></span></div>
    <button type="button" aria-label="Fechar">${icone('fechar')}</button>
</div>`;

    const rodape = `
<footer class="rodape">
    <div class="container">
        <div class="rodape-grade">
            <div>
                <a class="marca" href="./index.html" aria-label="Hospital Santa Cecilia">${MARCA}</a>
                <p data-i18n="rod.texto"></p>
            </div>
            <div>
                <h3 data-i18n="rod.navegacao"></h3>
                <ul>${LINKS.map(l => `<li><a href="${l.href}" data-i18n="${l.chave}"></a></li>`).join('')}<li><a href="./tv.html" data-i18n="atalho.tv"></a></li></ul>
            </div>
            <div>
                <h3 data-i18n="rod.contato"></h3>
                <ul>
                    <li>${icone('telefone')}<span>(11) 98765-4321</span></li>
                    <li>${icone('pino')}<span data-i18n="rod.endereco"></span></li>
                    <li>${icone('email')}<span>contato@hospitalsantacecilia.com.br</span></li>
                </ul>
            </div>
        </div>
        <div class="desenvolvedora">
            <div><small data-i18n="rod.dev"></small><strong>Beatriz Oliveira</strong></div>
            <div class="desenvolvedora-links">
                <a href="https://github.com/biabruna19" target="_blank" rel="noopener" aria-label="GitHub de Beatriz Oliveira">${icone('github')}<span>GitHub</span></a>
                <a href="https://www.linkedin.com/in/beatriz-oliveira-759867294/" target="_blank" rel="noopener" aria-label="LinkedIn de Beatriz Oliveira">${icone('linkedin')}<span>LinkedIn</span></a>
                <a href="mailto:biabruna.1901@gmail.com" aria-label="E-mail de Beatriz Oliveira">${icone('email')}<span>E-mail</span></a>
            </div>
        </div>
        <div class="rodape-base">
            <span>© ${new Date().getFullYear()} Hospital Santa Cecilia</span>
            <span data-i18n="rod.ficticio"></span>
        </div>
    </div>
</footer>`;

    const alvoTopo = document.getElementById('topo');
    if (alvoTopo) alvoTopo.outerHTML = topo;
    document.addEventListener('DOMContentLoaded', () => {
        const alvoRodape = document.getElementById('rodape');
        if (alvoRodape) alvoRodape.outerHTML = rodape;
        // <span data-icone="nome"></span> vira o ícone em SVG
        document.querySelectorAll('[data-icone]').forEach(el => { el.outerHTML = icone(el.dataset.icone); });
        I18N.aplicar();
        atualizarAcessibilidade();
        iniciarRevelar();
    });

    // ---------- Acessibilidade ----------
    const raiz = document.documentElement;
    function atualizarAcessibilidade() {
        const contraste = raiz.classList.contains('alto-contraste');
        document.querySelectorAll('[data-acao="contraste"]').forEach(b => b.setAttribute('aria-pressed', contraste));
        const f = +(raiz.dataset.fonte || 0);
        document.querySelectorAll('[data-acao="menor"]').forEach(b => { b.disabled = f <= -1; });
        document.querySelectorAll('[data-acao="maior"]').forEach(b => { b.disabled = f >= 3; });
    }
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-acao]');
        if (!b) return;
        const acao = b.dataset.acao;
        if (acao === 'contraste') {
            const ativo = raiz.classList.toggle('alto-contraste');
            localStorage.setItem('hsc_contraste', ativo ? '1' : '0');
        } else {
            let f = +(raiz.dataset.fonte || 0);
            f = acao === 'maior' ? Math.min(3, f + 1) : acao === 'menor' ? Math.max(-1, f - 1) : 0;
            if (f === 0) delete raiz.dataset.fonte; else raiz.dataset.fonte = f;
            localStorage.setItem('hsc_fonte', f);
        }
        atualizarAcessibilidade();
    });

    // ---------- Menu do celular ----------
    const botao = document.getElementById('botaoMenu');
    const gaveta = document.getElementById('gaveta');
    if (botao && gaveta) {
        const fechar = () => { gaveta.classList.remove('aberta'); botao.setAttribute('aria-expanded', 'false'); botao.innerHTML = icone('menu'); };
        botao.addEventListener('click', () => {
            const aberta = gaveta.classList.toggle('aberta');
            botao.setAttribute('aria-expanded', aberta);
            botao.innerHTML = icone(aberta ? 'fechar' : 'menu');
        });
        gaveta.querySelectorAll('nav a').forEach(a => a.addEventListener('click', fechar));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
    }

    // ---------- Aviso de demonstração ----------
    const aviso = document.querySelector('.aviso-demo');
    if (aviso) {
        if (sessionStorage.getItem('hsc_aviso')) aviso.remove();
        else aviso.querySelector('button').addEventListener('click', () => { sessionStorage.setItem('hsc_aviso', '1'); aviso.remove(); });
    }

    // ---------- Avisos rápidos (no lugar das janelas confirm do navegador) ----------
    // avisoRapido('Fila reiniciada', { acao: 'Desfazer', aoAcionar: () => ... })
    window.avisoRapido = function (texto, opcoes = {}) {
        let pilha = document.getElementById('avisos');
        if (!pilha) {
            pilha = document.createElement('div');
            pilha.id = 'avisos';
            pilha.className = 'avisos';
            pilha.setAttribute('role', 'status');
            pilha.setAttribute('aria-live', 'polite');
            document.body.appendChild(pilha);
        }
        const aviso = document.createElement('div');
        aviso.className = 'aviso-rapido';
        aviso.innerHTML = `<span></span>${opcoes.acao ? '<button type="button" class="aviso-acao"></button>' : ''}
            <button type="button" class="aviso-x" aria-label="${I18N.t('aviso.fechar')}">${icone('fechar')}</button>`;
        aviso.querySelector('span').textContent = texto;
        let tempo;
        const fechar = () => { clearTimeout(tempo); aviso.classList.add('saindo'); setTimeout(() => aviso.remove(), 250); };
        if (opcoes.acao) {
            const b = aviso.querySelector('.aviso-acao');
            b.textContent = opcoes.acao;
            b.addEventListener('click', () => { fechar(); opcoes.aoAcionar && opcoes.aoAcionar(); });
        }
        aviso.querySelector('.aviso-x').addEventListener('click', fechar);
        // passar o mouse ou focar segura o aviso na tela
        const contar = () => { clearTimeout(tempo); tempo = setTimeout(fechar, opcoes.duracao || (opcoes.acao ? 7000 : 4000)); };
        aviso.addEventListener('mouseenter', () => clearTimeout(tempo));
        aviso.addEventListener('mouseleave', contar);
        aviso.addEventListener('focusin', () => clearTimeout(tempo));
        aviso.addEventListener('focusout', contar);
        pilha.appendChild(aviso);
        contar();
        return fechar;
    };

    // ---------- Aparecer ao rolar ----------
    function iniciarRevelar() {
        const itens = document.querySelectorAll('.revelar');
        if (!('IntersectionObserver' in window)) { itens.forEach(el => el.classList.add('visivel')); return; }
        const obs = new IntersectionObserver((ent) => ent.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); } }), { rootMargin: '0px 0px -40px 0px' });
        itens.forEach(el => obs.observe(el));
    }
})();
