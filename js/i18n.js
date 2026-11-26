/*
 * Idiomas e preferências de acessibilidade (carregado no <head>).
 *
 * - Português, inglês e espanhol: textos escritos à mão (js/textos.js).
 * - Outros idiomas do globo: tradução automática do Google a partir do português.
 * - Alto contraste e tamanho da fonte ficam salvos e são aplicados antes
 *   de a página aparecer, para não "piscar".
 */
(function () {
    const raiz = document.documentElement;

    // ---------- Acessibilidade salva ----------
    if (localStorage.getItem('hsc_contraste') === '1') raiz.classList.add('alto-contraste');
    const fonte = localStorage.getItem('hsc_fonte');
    if (fonte && fonte !== '0') raiz.dataset.fonte = fonte;

    // ---------- Idiomas ----------
    const MANUAIS = ['pt', 'en', 'es'];
    const IDIOMAS = ['pt', 'en', 'es', 'fr', 'ja', 'ht', 'ar', 'it', 'de', 'zh-CN', 'ru', 'ko', 'hi'];
    const SIGLAS = { 'zh-CN': 'ZH' };
    const NOMES_PT = { pt: 'Português', en: 'Inglês', es: 'Espanhol', fr: 'Francês', ja: 'Japonês', ht: 'Crioulo haitiano', ar: 'Árabe', it: 'Italiano', de: 'Alemão', 'zh-CN': 'Chinês', ru: 'Russo', ko: 'Coreano', hi: 'Hindi' };
    const ouvintes = [];

    function inicial() {
        const salvo = localStorage.getItem('hsc_idioma');
        if (IDIOMAS.includes(salvo)) return salvo;
        return 'pt'; // abre sempre em português; o visitante troca pelo globo
    }
    const escolha = inicial();
    let atual = MANUAIS.includes(escolha) ? escolha : 'pt'; // idioma dos textos escritos à mão
    const automatico = !MANUAIS.includes(escolha);
    // Na tradução automática a página fica marcada como português (língua de origem)
    raiz.lang = atual === 'pt' ? 'pt-BR' : atual;

    function cookieTraducao(cod) {
        ['', `; domain=${location.hostname}`, `; domain=.${location.hostname}`].forEach(d => {
            document.cookie = cod ? `googtrans=/pt/${cod}; path=/${d}` : `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
        });
    }

    function avisarFalha() {
        if (document.getElementById('aviso-traducao')) return;
        const aviso = document.createElement('div');
        aviso.id = 'aviso-traducao';
        aviso.className = 'aviso-traducao notranslate';
        aviso.setAttribute('role', 'alert');
        aviso.innerHTML = '<span>Não foi possível carregar a tradução automática. · Automatic translation could not be loaded.</span><button type="button">Português</button><button type="button" aria-label="Fechar">✕</button>';
        const [voltar, fechar] = aviso.querySelectorAll('button');
        voltar.addEventListener('click', () => window.I18N.definir('pt'));
        fechar.addEventListener('click', () => aviso.remove());
        document.body.appendChild(aviso);
    }

    if (automatico) {
        cookieTraducao(escolha);
        window.hscIniciarTradutor = function () {
            new google.translate.TranslateElement({ pageLanguage: 'pt', autoDisplay: false }, 'hsc-tradutor');
            let tentativas = 0;
            const timer = setInterval(() => {
                const caixa = document.querySelector('select.goog-te-combo');
                if (caixa && caixa.options.length > 1) {
                    clearInterval(timer);
                    if (caixa.value !== escolha) { caixa.value = escolha; caixa.dispatchEvent(new Event('change')); }
                } else if (++tentativas > 40) clearInterval(timer);
            }, 250);
        };
        document.addEventListener('DOMContentLoaded', () => {
            const caixa = document.createElement('div');
            caixa.id = 'hsc-tradutor';
            caixa.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
            document.body.appendChild(caixa);
            const s = document.createElement('script');
            s.src = 'https://translate.google.com/translate_a/element.js?cb=hscIniciarTradutor';
            s.onerror = avisarFalha;
            document.body.appendChild(s);
            setTimeout(() => { if (!document.querySelector('select.goog-te-combo')) avisarFalha(); }, 10000);
        });
    } else if (document.cookie.includes('googtrans=')) {
        cookieTraducao(null);
    }

    // ---------- Textos ----------
    function t(chave, vars) {
        const dic = (window.TEXTOS || {})[atual] || {};
        let texto = dic[chave] ?? (window.TEXTOS?.pt?.[chave]) ?? chave;
        if (vars) Object.keys(vars).forEach(k => { texto = texto.split(`{${k}}`).join(vars[k]); });
        return texto;
    }

    function aplicar(escopo) {
        const base = escopo || document;
        base.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        base.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
        base.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
        base.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
        base.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
        const titulo = raiz.dataset.titulo;
        if (titulo) document.title = `${t(titulo)} · Hospital Santa Cecilia`;
        atualizarGlobos();
    }

    // Nome de um idioma escrito na língua escolhida (recurso do próprio navegador)
    function nomeIdioma(cod) {
        try {
            const nome = new Intl.DisplayNames([_escolhaAtual === 'pt' ? 'pt-BR' : _escolhaAtual], { type: 'language' }).of(cod);
            if (nome && nome.toLowerCase() !== cod.toLowerCase()) return nome.charAt(0).toLocaleUpperCase() + nome.slice(1);
        } catch (e) { /* sem suporte: usa o nome em português */ }
        return NOMES_PT[cod] || cod;
    }
    let _escolhaAtual = escolha;
    const escolhaAtual = () => _escolhaAtual;

    // ---------- Globo ----------
    const GLOBO = '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>';
    let contador = 0;
    function montarGlobo(alvo) {
        const id = 'hsc-idiomas-' + (++contador);
        alvo.classList.add('globo', 'notranslate');
        alvo.setAttribute('translate', 'no');
        alvo.innerHTML = `
            <button type="button" class="globo-botao" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}" title="Idioma · Language · Idioma">${GLOBO}<span class="globo-sigla"></span></button>
            <ul class="globo-lista" id="${id}" role="listbox" aria-label="Idioma · Language" hidden>
                ${IDIOMAS.map(c => `<li role="option" tabindex="-1" data-cod="${c}" aria-selected="false"><span class="globo-nome"></span>${MANUAIS.includes(c) ? '' : '<small>auto</small>'}</li>`).join('')}
            </ul>`;
        const botao = alvo.querySelector('button');
        const lista = alvo.querySelector('ul');
        const itens = [...lista.querySelectorAll('li')];
        const abrir = (sim) => {
            lista.hidden = !sim;
            botao.setAttribute('aria-expanded', sim);
            if (sim) (itens.find(li => li.getAttribute('aria-selected') === 'true') || itens[0]).focus();
        };
        botao.addEventListener('click', (e) => { e.stopPropagation(); abrir(lista.hidden); });
        lista.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) { abrir(false); window.I18N.definir(li.dataset.cod); } });
        lista.addEventListener('keydown', (e) => {
            const i = itens.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') { e.preventDefault(); itens[(i + 1) % itens.length].focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); itens[(i - 1 + itens.length) % itens.length].focus(); }
            else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); }
            else if (e.key === 'Escape') { abrir(false); botao.focus(); }
        });
        document.addEventListener('click', (e) => { if (!alvo.contains(e.target)) abrir(false); });
        atualizarGlobos();
    }
    function atualizarGlobos() {
        document.querySelectorAll('.globo').forEach(g => {
            const sigla = g.querySelector('.globo-sigla');
            if (sigla) sigla.textContent = SIGLAS[_escolhaAtual] || _escolhaAtual.toUpperCase();
            g.querySelectorAll('li').forEach(li => {
                li.setAttribute('aria-selected', li.dataset.cod === _escolhaAtual);
                li.querySelector('.globo-nome').textContent = nomeIdioma(li.dataset.cod);
            });
        });
    }

    window.I18N = {
        t, aplicar, montarGlobo,
        idioma: () => atual,
        escolha: escolhaAtual,
        aoTrocar: (fn) => ouvintes.push(fn),
        definir(cod) {
            if (!IDIOMAS.includes(cod) || cod === _escolhaAtual) return;
            localStorage.setItem('hsc_idioma', cod);
            if (automatico || !MANUAIS.includes(cod)) {
                cookieTraducao(MANUAIS.includes(cod) ? null : cod);
                location.reload();
                return;
            }
            _escolhaAtual = cod;
            atual = cod;
            raiz.lang = cod === 'pt' ? 'pt-BR' : cod;
            aplicar();
            ouvintes.forEach(fn => fn(cod));
        },
        // Formatação de hora e data no idioma atual
        local: () => ({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[atual]),
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-globo]').forEach(montarGlobo);
        aplicar();
    });
})();
