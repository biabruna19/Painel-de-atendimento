/*
 * Fila de atendimento compartilhada entre as páginas (início, painel e modo TV).
 *
 * - Fica salva no navegador (localStorage), então não some ao recarregar.
 * - Abas abertas ao mesmo tempo se atualizam sozinhas (evento "storage").
 * - Regra da fila (igual à versão original): prioritários primeiro,
 *   e dentro de cada tipo, quem chegou antes.
 * - Tempo estimado: 5 min por senha normal e 8 min por prioritária.
 */
(function () {
    const CHAVE = 'hsc_fila';
    const GUICHES = 3;
    const MINUTOS = { N: 5, P: 8 };
    const ouvintes = [];

    function inicial() {
        const agora = Date.now();
        return {
            contador: { N: 1, P: 2 },
            proximoGuiche: 2,
            senhas: [
                { id: 1, numero: 'P001', tipo: 'P', status: 'chamando', criada: agora - 6e5, chamada: agora - 6e4, guiche: 1 },
                { id: 2, numero: 'N001', tipo: 'N', status: 'espera', criada: agora - 5e5 },
                { id: 3, numero: 'P002', tipo: 'P', status: 'espera', criada: agora - 4e5 },
            ],
            versao: 1,
        };
    }

    function ler() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE));
            if (dados && Array.isArray(dados.senhas)) return dados;
        } catch (e) { /* dados corrompidos: recomeça */ }
        const novo = inicial();
        localStorage.setItem(CHAVE, JSON.stringify(novo));
        return novo;
    }

    let estado = ler();
    function salvar(evento) {
        estado.versao = (estado.versao || 0) + 1;
        estado.ultimoEvento = evento || null;
        localStorage.setItem(CHAVE, JSON.stringify(estado));
        avisar(evento);
    }
    function avisar(evento) { ouvintes.forEach(fn => fn(estado, evento)); }

    // Outra aba mudou a fila
    window.addEventListener('storage', (e) => {
        if (e.key !== CHAVE || !e.newValue) return;
        const anterior = estado.versao;
        estado = JSON.parse(e.newValue);
        if (estado.versao !== anterior) avisar(estado.ultimoEvento);
    });

    const emEspera = () => estado.senhas
        .filter(s => s.status === 'espera')
        .sort((a, b) => (a.tipo === b.tipo ? a.criada - b.criada : a.tipo === 'P' ? -1 : 1));
    const chamando = () => estado.senhas.find(s => s.status === 'chamando') || null;

    function minutosAte(indice) {
        // tempo da senha sendo atendida + das que estão na frente
        const atual = chamando();
        let total = atual ? MINUTOS[atual.tipo] : 0;
        emEspera().slice(0, indice).forEach(s => { total += MINUTOS[s.tipo]; });
        return total;
    }

    window.FILA = {
        GUICHES,
        estado: () => estado,
        emEspera,
        chamando,
        historico: (n = 5) => estado.senhas.filter(s => s.chamada).sort((a, b) => b.chamada - a.chamada).slice(0, n),
        posicao: (id) => emEspera().findIndex(s => s.id === id),
        minutosAte,
        tempoTotal: () => minutosAte(emEspera().length),

        retirar(tipo) {
            const letra = tipo === 'P' ? 'P' : 'N';
            estado.contador[letra] = (estado.contador[letra] || 0) + 1;
            const senha = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                numero: letra + String(estado.contador[letra]).padStart(3, '0'),
                tipo: letra, status: 'espera', criada: Date.now(),
            };
            estado.senhas.push(senha);
            // guarda só as últimas 200 senhas
            if (estado.senhas.length > 200) estado.senhas = estado.senhas.slice(-200);
            salvar({ tipo: 'retirada', id: senha.id });
            return senha;
        },

        chamarProxima() {
            const atual = chamando();
            if (atual) atual.status = 'atendida';
            const proxima = emEspera()[0];
            if (proxima) {
                proxima.status = 'chamando';
                proxima.chamada = Date.now();
                proxima.guiche = estado.proximoGuiche;
                estado.proximoGuiche = (estado.proximoGuiche % GUICHES) + 1;
            }
            salvar(proxima ? { tipo: 'chamada', id: proxima.id, quando: Date.now() } : { tipo: 'vazia' });
            return proxima || null;
        },

        repetirChamada() {
            const atual = chamando();
            if (atual) salvar({ tipo: 'chamada', id: atual.id, quando: Date.now(), repetida: true });
            return atual;
        },

        reiniciar() {
            estado = inicial();
            estado.senhas = [];
            estado.contador = { N: 0, P: 0 };
            estado.proximoGuiche = 1;
            salvar({ tipo: 'reiniciada' });
        },

        // usado pelo "Desfazer" depois de reiniciar a fila
        copia: () => JSON.parse(JSON.stringify(estado)),
        restaurar(copia) {
            const versao = estado.versao;
            estado = JSON.parse(JSON.stringify(copia));
            estado.versao = versao;
            salvar({ tipo: 'restaurada' });
        },

        aoMudar: (fn) => ouvintes.push(fn),
    };

    // ---------- Chamada com sinal sonoro e voz ----------
    let audio = null;
    function sinal() {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            if (audio.state === 'suspended') audio.resume();
            const agora = audio.currentTime;
            [[880, 0], [660, 0.32]].forEach(([freq, atraso]) => {
                const osc = audio.createOscillator();
                const vol = audio.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                vol.gain.setValueAtTime(0.0001, agora + atraso);
                vol.gain.exponentialRampToValueAtTime(0.35, agora + atraso + 0.02);
                vol.gain.exponentialRampToValueAtTime(0.0001, agora + atraso + 0.6);
                osc.connect(vol).connect(audio.destination);
                osc.start(agora + atraso);
                osc.stop(agora + atraso + 0.65);
            });
        } catch (e) { /* navegador sem áudio */ }
    }

    // "P003" é lido como "P, zero, zero, três" para ficar claro
    function soletrar(numero) {
        return numero.split('').join(' ');
    }

    window.CHAMADA = {
        anunciar(senha, { voz = true, somAtivo = true } = {}) {
            if (!senha || !somAtivo) return;
            sinal();
            if (!voz || !('speechSynthesis' in window)) return;
            const idioma = I18N.idioma();
            const tipo = senha.tipo === 'P' ? I18N.t('fila.prioritario') : I18N.t('fila.normal');
            const fala = new SpeechSynthesisUtterance(I18N.t('voz.chamada', { senha: soletrar(senha.numero), tipo, guiche: senha.guiche }));
            fala.lang = I18N.local();
            fala.rate = 0.9;
            const vozes = speechSynthesis.getVoices().filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(idioma));
            if (vozes.length) fala.voice = vozes[0];
            speechSynthesis.cancel();
            setTimeout(() => speechSynthesis.speak(fala), 900);
        },
        sinal,
    };

    window.formatarHora = (ms) => new Date(ms).toLocaleTimeString(I18N.local(), { hour: '2-digit', minute: '2-digit' });
})();
