/*
 * Modo TV (tv.html): tela cheia para a sala de espera.
 * Acompanha a fila salva no navegador e anuncia cada senha chamada
 * no painel (fila.html), mesmo que ele esteja aberto em outra aba.
 */
(function () {
    const $ = (id) => document.getElementById(id);
    const t = (k, v) => I18N.t(k, v);
    let somAtivo = false;
    let ultimaAnunciada = null;

    const MARCA = '<span class="marca-icone"><svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><span class="marca-nome">Hospital Santa Cecilia<small data-i18n="marca.sub"></small></span>';
    $('tvMarca').innerHTML = MARCA;

    function desenhar(animar) {
        const atual = FILA.chamando();
        const caixa = $('tvChamada');
        caixa.innerHTML = atual
            ? `<small>${atual.tipo === 'P' ? t('fila.prioritario') : t('fila.normal')}</small>
               <strong>${atual.numero}</strong>
               <span class="guiche">${t('fila.guiche', { n: atual.guiche })}</span>`
            : `<small>${t('tv.aguarde')}</small><strong>—</strong>`;
        if (animar) { caixa.classList.remove('pulsando'); void caixa.offsetWidth; caixa.classList.add('pulsando'); }

        const ultimas = FILA.historico(5).filter(s => !atual || s.id !== atual.id).slice(0, 4);
        $('tvUltimas').innerHTML = ultimas.length
            ? ultimas.map(s => `<li>${s.numero}<span>${t('fila.guiche', { n: s.guiche })}</span></li>`).join('')
            : `<li><span>${t('fila.historico.vazio')}</span></li>`;
        const espera = FILA.emEspera();
        $('tvNormal').textContent = espera.filter(s => s.tipo === 'N').length;
        $('tvPrioritario').textContent = espera.filter(s => s.tipo === 'P').length;
    }

    function letreiro() {
        $('tvLetreiro').innerHTML = [1, 2, 3, 4].map(n => `<span><strong>${t(`not.${n}.t`)}:</strong> ${t(`not.${n}.x`)}</span>`).join('');
    }

    function relogio() {
        const agora = new Date();
        $('tvHora').textContent = agora.toLocaleTimeString(I18N.local(), { hour: '2-digit', minute: '2-digit' });
        const data = agora.toLocaleDateString(I18N.local(), { weekday: 'long', day: 'numeric', month: 'long' });
        $('tvData').textContent = data.charAt(0).toLocaleUpperCase() + data.slice(1);
    }

    FILA.aoMudar((estado, evento) => {
        const chamada = evento && evento.tipo === 'chamada';
        desenhar(chamada);
        if (chamada) {
            const chave = `${evento.id}-${evento.quando}`;
            if (chave !== ultimaAnunciada && Date.now() - evento.quando < 8000) {
                ultimaAnunciada = chave;
                CHAMADA.anunciar(estado.senhas.find(s => s.id === evento.id), { somAtivo });
            }
        }
    });

    // O navegador só libera som depois de um toque na página
    function fecharAviso(comSom) {
        somAtivo = comSom;
        if (comSom) {
            CHAMADA.sinal();
            if ('speechSynthesis' in window) speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(' '), { volume: 0 }));
        }
        $('tvAtivar').hidden = true;
        document.documentElement.requestFullscreen?.().catch(() => {});
    }
    $('tvSomSim').addEventListener('click', () => fecharAviso(true));
    $('tvSomNao').addEventListener('click', () => fecharAviso(false));

    I18N.aoTrocar(() => { desenhar(false); letreiro(); relogio(); });
    document.addEventListener('DOMContentLoaded', () => { I18N.aplicar(); desenhar(false); letreiro(); });
    relogio();
    setInterval(relogio, 1000);
})();
