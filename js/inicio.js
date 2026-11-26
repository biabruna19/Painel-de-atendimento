/*
 * Página inicial: fila ao vivo, agendamento, notícias e avaliação.
 *
 * Na versão anterior a página inteira era redesenhada a cada 8 segundos
 * (por causa do carrossel), e quem estava preenchendo o formulário perdia
 * o que tinha digitado. Agora cada parte se atualiza sozinha.
 */
(function () {
    const $ = (id) => document.getElementById(id);
    const t = (k, v) => I18N.t(k, v);
    const idioma = () => I18N.idioma();

    // ---------- Relógio e fila ao vivo ----------
    function relogio() {
        $('relogio').textContent = new Date().toLocaleTimeString(I18N.local(), { hour: '2-digit', minute: '2-digit' });
    }
    function aoVivo(animar) {
        const atual = FILA.chamando();
        $('vivoSenha').innerHTML = `
            <small>${t('vivo.chamando')}</small>
            <strong class="${animar ? 'troca' : ''}">${atual ? atual.numero : t('vivo.ninguem')}</strong>
            <span>${atual ? t('vivo.guiche', { n: atual.guiche }) : '&nbsp;'}</span>`;
        $('vivoFila').textContent = FILA.emEspera().length;
        $('vivoTempo').textContent = FILA.tempoTotal();
    }
    FILA.aoMudar((e, evento) => aoVivo(evento && evento.tipo === 'chamada'));

    // ---------- Agendamento ----------
    const form = $('formAgendamento');
    const selEsp = $('especialidade');
    const campoData = $('data');
    let horarioEscolhido = null;
    const CHAVE_AG = 'hsc_agendamentos';
    const agendamentos = () => JSON.parse(localStorage.getItem(CHAVE_AG) || '[]');

    function preencherEspecialidades() {
        const valor = selEsp.value;
        selEsp.innerHTML = `<option value="">${t('ag.selecione')}</option>` +
            ESPECIALIDADES.slice().sort((a, b) => a.nome[idioma()].localeCompare(b.nome[idioma()]))
                .map(e => `<option value="${e.id}">${e.nome[idioma()]}</option>`).join('');
        selEsp.value = valor;
    }

    const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
    const isoData = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    campoData.min = isoData(hoje());

    // Horários de 08:00 às 17:30 (pausa para almoço). Alguns aparecem ocupados,
    // sempre os mesmos para a mesma especialidade e o mesmo dia.
    const HORARIOS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    function ocupado(esp, data, hora) {
        let h = 0;
        for (const c of esp + data + hora) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        if (h % 4 === 0) return true;
        if (agendamentos().some(a => a.especialidade === esp && a.data === data && a.hora === hora)) return true;
        if (data === isoData(hoje())) {
            const [hh, mm] = hora.split(':').map(Number);
            const agora = new Date();
            return hh * 60 + mm <= agora.getHours() * 60 + agora.getMinutes() + 30;
        }
        return false;
    }

    function desenharHorarios() {
        const caixa = $('horarios');
        const esp = selEsp.value;
        const data = campoData.value;
        if (!esp || !data) { caixa.className = 'horarios-vazio'; caixa.textContent = t('ag.escolha.data'); horarioEscolhido = null; return; }
        const dia = new Date(data + 'T12:00:00');
        if (dia.getDay() === 0) { caixa.className = 'horarios-vazio'; caixa.textContent = t('ag.domingo'); horarioEscolhido = null; return; }
        caixa.className = 'horarios';
        if (horarioEscolhido && ocupado(esp, data, horarioEscolhido)) horarioEscolhido = null;
        caixa.innerHTML = HORARIOS.map(h => {
            const ocup = ocupado(esp, data, h);
            return `<button type="button" data-hora="${h}" aria-pressed="${h === horarioEscolhido}" ${ocup ? 'disabled' : ''}>${h}</button>`;
        }).join('');
    }
    $('horarios').addEventListener('click', (e) => {
        const b = e.target.closest('[data-hora]');
        if (!b || b.disabled) return;
        horarioEscolhido = b.dataset.hora;
        $('horarios').querySelectorAll('[data-hora]').forEach(x => x.setAttribute('aria-pressed', x === b));
        $('erro-horario').textContent = '';
    });
    selEsp.addEventListener('change', desenharHorarios);
    campoData.addEventListener('change', desenharHorarios);

    // Telefone no formato (11) 91234-5678
    $('telefone').addEventListener('input', (e) => {
        const n = e.target.value.replace(/\D/g, '').slice(0, 11);
        let f = n;
        if (n.length > 2) f = `(${n.slice(0, 2)}) ${n.slice(2)}`;
        if (n.length > 7) f = `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}`;
        e.target.value = f;
    });
    $('mensagem').addEventListener('input', (e) => { $('contador').textContent = `${e.target.value.length}/500`; });

    function erro(campo, chave) {
        const el = $(campo);
        if (el) el.setAttribute('aria-invalid', chave ? 'true' : 'false');
        $(`erro-${campo}`).textContent = chave ? t(chave) : '';
        return !chave;
    }
    function validar() {
        const v = (id) => $(id).value.trim();
        let ok = true;
        ok = erro('especialidade', v('especialidade') ? '' : 'ag.erro.obrigatorio') && ok;
        const data = v('data');
        ok = erro('data', !data ? 'ag.erro.obrigatorio' : data < campoData.min ? 'ag.erro.data' : new Date(data + 'T12:00:00').getDay() === 0 ? 'ag.domingo' : '') && ok;
        $('erro-horario').textContent = horarioEscolhido ? '' : t('ag.erro.horario');
        ok = !!horarioEscolhido && ok;
        ok = erro('nome', v('nome').length >= 3 ? '' : 'ag.erro.obrigatorio') && ok;
        ok = erro('email', !v('email') ? 'ag.erro.obrigatorio' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) ? '' : 'ag.erro.email') && ok;
        ok = erro('telefone', v('telefone').replace(/\D/g, '').length >= 10 ? '' : 'ag.erro.telefone') && ok;
        const msg = v('mensagem').length;
        ok = erro('mensagem', msg >= 10 && msg <= 500 ? '' : 'ag.erro.mensagem') && ok;
        if (!ok) form.querySelector('[aria-invalid="true"], .horarios button:not([disabled])')?.focus();
        return ok;
    }

    const nomeEsp = (id) => (ESPECIALIDADES.find(e => e.id === id) || { nome: { pt: id, en: id, es: id } }).nome[idioma()];
    const dataBonita = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(I18N.local(), { weekday: 'short', day: '2-digit', month: 'short' });

    function desenharMeus() {
        const lista = agendamentos().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
        $('meusAgendamentos').innerHTML = lista.length
            ? lista.map(a => `<li><div><strong>${nomeEsp(a.especialidade)}</strong><small>${dataBonita(a.data)} · ${a.hora} · ${a.protocolo}</small></div>
                <button type="button" class="botao botao-contorno botao-pequeno" data-cancelar="${a.protocolo}">${t('ag.cancelar')}</button></li>`).join('')
            : `<li style="background:none;padding:0;color:var(--tinta-3)">${t('ag.meus.vazio')}</li>`;
    }
    $('meusAgendamentos').addEventListener('click', (e) => {
        const b = e.target.closest('[data-cancelar]');
        if (!b || !confirm(t('ag.cancelar.confirma'))) return;
        localStorage.setItem(CHAVE_AG, JSON.stringify(agendamentos().filter(a => a.protocolo !== b.dataset.cancelar)));
        desenharMeus();
        desenharHorarios();
    });

    let ultimoConfirmado = null;
    function desenharConfirmacao() {
        const a = ultimoConfirmado;
        const caixa = $('confirmacao');
        if (!a) { caixa.hidden = true; return; }
        caixa.hidden = false;
        caixa.innerHTML = `<h3>${icone('check')}${t('ag.ok.titulo')}</h3>
            <p>${t('ag.ok.texto', { esp: nomeEsp(a.especialidade), data: dataBonita(a.data), hora: a.hora })}</p>
            <p>${t('ag.ok.protocolo')}: <code>${a.protocolo}</code></p>`;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validar()) return;
        const novo = {
            protocolo: `HSC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            especialidade: selEsp.value, data: campoData.value, hora: horarioEscolhido,
            nome: $('nome').value.trim(), criado: Date.now(),
        };
        localStorage.setItem(CHAVE_AG, JSON.stringify([...agendamentos(), novo]));
        ultimoConfirmado = novo;
        form.reset();
        $('contador').textContent = '0/500';
        horarioEscolhido = null;
        desenharHorarios();
        desenharMeus();
        desenharConfirmacao();
        $('confirmacao').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Vindo da página de especialidades: index.html?especialidade=cardiologia#agendar
    const pedida = new URLSearchParams(location.search).get('especialidade');

    // ---------- Notícias ----------
    const NOTICIAS = [
        { n: 1, icone: 'seringa', cor: 'linear-gradient(135deg,#0b5c8f,#0ea5e9)' },
        { n: 2, icone: 'sol', cor: 'linear-gradient(135deg,#0e7490,#38bdf8)' },
        { n: 3, icone: 'pulmao', cor: 'linear-gradient(135deg,#062b4a,#0e7490)' },
        { n: 4, icone: 'ticket', cor: 'linear-gradient(135deg,#0284c7,#38bdf8)' },
    ];
    let slide = 0;
    let timer = null;
    function desenharNoticias() {
        $('trilho').innerHTML = NOTICIAS.map((x, i) => `
            <article class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${NOTICIAS.length}" ${i === slide ? '' : 'aria-hidden="true"'}>
                <div class="slide-arte" style="background:${x.cor}">${icone(x.icone)}</div>
                <div class="slide-texto"><h3>${t(`not.${x.n}.t`)}</h3><p>${t(`not.${x.n}.x`)}</p></div>
            </article>`).join('');
        $('pontos').innerHTML = NOTICIAS.map((x, i) => `<button type="button" data-slide="${i}" aria-label="${t('not.ir', { n: i + 1 })}" aria-current="${i === slide}"></button>`).join('');
        irPara(slide);
    }
    function irPara(i) {
        slide = (i + NOTICIAS.length) % NOTICIAS.length;
        $('trilho').style.transform = `translateX(-${slide * 100}%)`;
        $('pontos').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === slide));
        $('trilho').querySelectorAll('.slide').forEach((s, j) => { if (j === slide) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
    }
    const iniciar = () => { clearInterval(timer); timer = setInterval(() => irPara(slide + 1), 8000); };
    $('anterior').addEventListener('click', () => { irPara(slide - 1); iniciar(); });
    $('proxima').addEventListener('click', () => { irPara(slide + 1); iniciar(); });
    $('pontos').addEventListener('click', (e) => { const b = e.target.closest('[data-slide]'); if (b) { irPara(+b.dataset.slide); iniciar(); } });
    const carrossel = $('carrossel');
    carrossel.addEventListener('mouseenter', () => clearInterval(timer));
    carrossel.addEventListener('mouseleave', iniciar);
    carrossel.addEventListener('focusin', () => clearInterval(timer));
    carrossel.addEventListener('focusout', iniciar);
    let toqueX = null;
    carrossel.addEventListener('touchstart', (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
    carrossel.addEventListener('touchend', (e) => {
        if (toqueX === null) return;
        const dx = e.changedTouches[0].clientX - toqueX;
        if (Math.abs(dx) > 40) { irPara(slide + (dx < 0 ? 1 : -1)); iniciar(); }
        toqueX = null;
    });

    // ---------- Avaliação ----------
    const CHAVE_AV = 'hsc_avaliacoes';
    let nota = 0;
    function desenharEstrelas(preview) {
        const mostrar = preview || nota;
        $('estrelas').querySelectorAll('button').forEach((b, i) => {
            b.classList.toggle('acesa', i < mostrar);
            b.setAttribute('aria-checked', i + 1 === nota);
        });
        $('rotuloNota').textContent = mostrar ? t(`av.${mostrar}`) : '';
    }
    function montarEstrelas() {
        $('estrelas').innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="false" data-nota="${n}" aria-label="${t('av.estrela', { n })}">${icone('estrela')}</button>`).join('');
        desenharEstrelas();
    }
    $('estrelas').addEventListener('click', (e) => { const b = e.target.closest('[data-nota]'); if (!b) return; nota = +b.dataset.nota; $('enviarAvaliacao').disabled = false; desenharEstrelas(); });
    $('estrelas').addEventListener('mouseover', (e) => { const b = e.target.closest('[data-nota]'); if (b) desenharEstrelas(+b.dataset.nota); });
    $('estrelas').addEventListener('mouseleave', () => desenharEstrelas());
    $('estrelas').addEventListener('keydown', (e) => {
        const passo = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (!passo) return;
        e.preventDefault();
        nota = Math.min(5, Math.max(1, (nota || 0) + passo));
        $('enviarAvaliacao').disabled = false;
        desenharEstrelas();
        $('estrelas').querySelectorAll('button')[nota - 1].focus();
    });
    function desenharMedia() {
        const lista = JSON.parse(localStorage.getItem(CHAVE_AV) || '[]');
        if (!lista.length) { $('media').textContent = t('av.nenhuma'); return; }
        const media = lista.reduce((s, a) => s + a.nota, 0) / lista.length;
        $('media').innerHTML = `<strong>${media.toFixed(1).replace('.', idioma() === 'en' ? '.' : ',')}</strong><span>★ · ${t('av.media', { n: lista.length })}</span>`;
    }
    let notaEnviada = 0;
    $('enviarAvaliacao').addEventListener('click', () => {
        const lista = JSON.parse(localStorage.getItem(CHAVE_AV) || '[]');
        lista.push({ nota, comentario: $('comentario').value.trim(), data: Date.now() });
        localStorage.setItem(CHAVE_AV, JSON.stringify(lista));
        notaEnviada = nota;
        $('obrigado').hidden = false;
        $('obrigado').textContent = t('av.obrigado', { n: nota });
        $('comentario').value = '';
        nota = 0;
        $('enviarAvaliacao').disabled = true;
        desenharEstrelas();
        desenharMedia();
    });

    // ---------- Início ----------
    function desenharIdioma() {
        preencherEspecialidades();
        desenharHorarios();
        desenharMeus();
        desenharConfirmacao();
        desenharNoticias();
        montarEstrelas();
        desenharMedia();
        if (notaEnviada) $('obrigado').textContent = t('av.obrigado', { n: notaEnviada });
        aoVivo(false);
        relogio();
    }
    I18N.aoTrocar(desenharIdioma);
    desenharIdioma();
    if (pedida && ESPECIALIDADES.some(e => e.id === pedida)) { selEsp.value = pedida; desenharHorarios(); }
    iniciar();
    setInterval(relogio, 1000 * 15);
})();
