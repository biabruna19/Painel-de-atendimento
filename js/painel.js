/*
 * Página da fila (fila.html): chamada atual, controles do atendente,
 * lista de espera, retirada de senha com comprovante e "acompanhar minha senha".
 */
(function () {
    const $ = (id) => document.getElementById(id);
    const t = (k, v) => I18N.t(k, v);
    const CHAVE_MINHA = 'hsc_minha_senha';
    const INTERVALO = 30; // segundos entre chamadas automáticas (como na versão original)
    let ultimaAnunciada = null;

    // Preferências do atendente
    const auto = $('autoAvancar');
    const som = $('somAtivo');
    auto.checked = localStorage.getItem('hsc_auto') !== '0';
    som.checked = localStorage.getItem('hsc_som') !== '0';
    auto.addEventListener('change', () => { localStorage.setItem('hsc_auto', auto.checked ? '1' : '0'); restante = INTERVALO; desenharContagem(); });
    som.addEventListener('change', () => localStorage.setItem('hsc_som', som.checked ? '1' : '0'));

    const nomeTipo = (s) => (s.tipo === 'P' ? t('fila.prioritario') : t('fila.normal'));

    // ---------- Desenho ----------
    function desenharChamando(animar) {
        const atual = FILA.chamando();
        const caixa = $('chamandoConteudo');
        if (!atual) {
            caixa.innerHTML = `<p class="chamando-vazio">${t('fila.nenhum')}</p>`;
            return;
        }
        caixa.innerHTML = `
            <div class="chamando-numero ${animar ? 'troca' : ''}">
                <span class="etiqueta ${atual.tipo === 'P' ? 'etiqueta-prioridade' : ''}">${nomeTipo(atual)}</span>
                <strong>${atual.numero}</strong>
                <span class="guiche">${t('fila.guiche', { n: atual.guiche })}</span>
            </div>
            <p class="chamando-aviso">${t('fila.va')}</p>`;
        if (animar) {
            const painel = $('chamando');
            painel.classList.remove('pulsando'); void painel.offsetWidth; painel.classList.add('pulsando');
        }
    }

    function desenharLista() {
        const lista = FILA.emEspera();
        const minha = +sessionStorage.getItem(CHAVE_MINHA);
        $('listaEspera').innerHTML = lista.length
            ? lista.map((s, i) => `
                <li class="senha-item ${s.tipo === 'P' ? 'prioridade' : ''} ${s.id === minha ? 'minha' : ''}">
                    <span class="senha-posicao">${i + 1}</span>
                    <div><strong>${s.numero}</strong><p>${nomeTipo(s)}</p></div>
                    <small>${t('fila.desde', { h: formatarHora(s.criada) })}<br>~${FILA.minutosAte(i)} ${t('fila.min')}</small>
                </li>`).join('')
            : `<li class="vazio">${t('fila.vazia')}</li>`;
        $('proximaSenha').textContent = lista[0] ? lista[0].numero : '—';
        $('totalEspera').textContent = lista.length;
        $('tempoEstimado').textContent = FILA.tempoTotal();
        $('repetirChamada').disabled = !FILA.chamando();
        $('chamarProxima').disabled = !FILA.chamando() && !lista.length;
    }

    function desenharHistorico() {
        const itens = FILA.historico(5);
        $('historico').innerHTML = itens.length
            ? itens.map(s => `<li><strong>${s.numero}</strong><span>${t('fila.guiche', { n: s.guiche })} · ${formatarHora(s.chamada)}</span></li>`).join('')
            : `<li style="color:var(--tinta-3)">${t('fila.historico.vazio')}</li>`;
    }

    function desenharMinhaSenha() {
        const id = +sessionStorage.getItem(CHAVE_MINHA);
        const faixa = $('minhaSenha');
        const senha = id && FILA.estado().senhas.find(s => s.id === id);
        if (!senha || senha.status === 'atendida') { faixa.hidden = true; if (senha) sessionStorage.removeItem(CHAVE_MINHA); return; }
        faixa.hidden = false;
        $('minhaSenhaTitulo').textContent = t('fila.minha', { s: senha.numero });
        if (senha.status === 'chamando') {
            faixa.classList.add('chamada');
            $('minhaSenhaInfo').textContent = t('fila.minha.vez', { g: senha.guiche });
        } else {
            faixa.classList.remove('chamada');
            const pos = FILA.posicao(id);
            $('minhaSenhaInfo').textContent = pos === 0 ? t('fila.minha.proximo') : t('fila.minha.pos', { n: pos, m: FILA.minutosAte(pos) });
        }
    }

    function desenharTudo(animar) {
        desenharChamando(animar);
        desenharLista();
        desenharHistorico();
        desenharMinhaSenha();
    }

    // ---------- Chamadas ----------
    function tratarEvento(evento) {
        if (!evento || evento.tipo !== 'chamada') return;
        const chave = `${evento.id}-${evento.quando}`;
        if (chave === ultimaAnunciada || Date.now() - evento.quando > 8000) return;
        ultimaAnunciada = chave;
        const senha = FILA.estado().senhas.find(s => s.id === evento.id);
        CHAMADA.anunciar(senha, { somAtivo: som.checked });
    }

    $('chamarProxima').addEventListener('click', () => { FILA.chamarProxima(); restante = INTERVALO; });
    $('repetirChamada').addEventListener('click', () => FILA.repetirChamada());
    $('reiniciarFila').addEventListener('click', () => { if (confirm(t('fila.reiniciar.confirma'))) { sessionStorage.removeItem(CHAVE_MINHA); FILA.reiniciar(); } });

    FILA.aoMudar((estado, evento) => {
        desenharTudo(evento && evento.tipo === 'chamada');
        tratarEvento(evento);
    });

    // ---------- Retirar senha + comprovante ----------
    const janela = $('janelaSenha');
    let focoAnterior = null;
    function abrirComprovante(senha) {
        const pos = FILA.posicao(senha.id);
        $('compMarca').innerHTML = window.MARCA_HSC;
        I18N.aplicar($('compMarca'));
        $('compNumero').textContent = senha.numero;
        $('compTipo').textContent = nomeTipo(senha);
        $('compPosicao').textContent = t('fila.posicao', { n: pos + 1 });
        $('compTempo').textContent = `~${FILA.minutosAte(pos)} ${t('fila.min')}`;
        $('compHora').textContent = formatarHora(senha.criada);
        focoAnterior = document.activeElement;
        janela.hidden = false;
        janela.querySelector('[data-fechar]').focus();
    }
    function fecharComprovante() { janela.hidden = true; if (focoAnterior) focoAnterior.focus(); }
    document.querySelectorAll('[data-retirar]').forEach(b => b.addEventListener('click', () => {
        const senha = FILA.retirar(b.dataset.retirar);
        sessionStorage.setItem(CHAVE_MINHA, senha.id);
        desenharTudo(false);
        abrirComprovante(senha);
    }));
    janela.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', fecharComprovante));
    janela.addEventListener('click', (e) => { if (e.target === janela) fecharComprovante(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !janela.hidden) fecharComprovante(); });
    $('imprimirSenha').addEventListener('click', () => window.print());
    $('esquecerSenha').addEventListener('click', () => { sessionStorage.removeItem(CHAVE_MINHA); desenharTudo(false); });

    // ---------- Chamada automática a cada 30 s ----------
    let restante = INTERVALO;
    function desenharContagem() {
        $('contagemAuto').textContent = auto.checked ? t('fila.auto.em', { s: restante }) : '';
    }
    setInterval(() => {
        $('relogio').textContent = new Date().toLocaleTimeString(I18N.local(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        // só a aba visível chama automaticamente (evita duas abas chamando ao mesmo tempo)
        if (auto.checked && document.visibilityState === 'visible') {
            restante -= 1;
            if (restante <= 0) {
                restante = INTERVALO;
                if (FILA.emEspera().length || FILA.chamando()) FILA.chamarProxima();
            }
        }
        desenharContagem();
    }, 1000);

    I18N.aoTrocar(() => { desenharTudo(false); desenharContagem(); });
    desenharTudo(false);
    desenharContagem();
})();
