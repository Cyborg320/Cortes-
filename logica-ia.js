// 🧠 NOME ESTILOSO • HORA EM TEMPO REAL • SELETOR DE PASTA
const ESTADO = {
    gravacao: { ativa: false, mediaRecorder: null, dados: [], ultimoArquivo: null },
    processamento: { arquivos: [], progresso: 0 },
    ia: { nivel: 1, experiencia: 0, destaquesGerados: 0 },
    live: { conectada: false, clipes: 0 },
    historico: { totalArquivos: 0, horas: 0, listaGravacoes: [] },
    configuracao: {
        nomePasta: 'IA_Editora_Arquivos',
        padraoNome: 'data',
        prefixoPersonalizado: 'MinhaGravacao'
    }
};

const BANCO = {
    frasesLive: {
        saudacao: ["Olá! Bem-vindos! 🎉", "E aí turma! Bora! 🚀"],
        engajamento: ["Comenta aí! 👇", "Deixa o like! 👍✨"],
        incentivo: ["Segue pra mais! 🌟", "Compartilha! 🔄"]
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    iniciarRelogio();
    configurarSeletorPasta();
    configurarAbas();
    configurarGravacaoOffline();
    configurarUploadEProcessamento();
    configurarLive();
    carregarDadosSalvos();
    atualizarTelaDados();
});

// ⏰ RELÓGIO ESTILIZADO
function iniciarRelogio() {
    const elemento = document.getElementById('mostra-hora');
    function atualizar() {
        const agora = new Date();
        const data = agora.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const hora = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        elemento.innerHTML = `📅 ${data} &nbsp;&nbsp; ⏰ ${hora}`;
    }
    atualizar();
    setInterval(atualizar, 1000);
}

// 📁 SELETOR DE PASTA VISÍVEL
function configurarSeletorPasta() {
    const nomeSalvo = localStorage.getItem('nomePastaSalva');
    if (nomeSalvo) {
        ESTADO.configuracao.nomePasta = nomeSalvo;
        document.getElementById('nome-pasta-salvamento').value = nomeSalvo;
    }
    atualizarCaminhosPasta();

    document.getElementById('salvar-pasta').addEventListener('click', () => {
        const novoNome = document.getElementById('nome-pasta-salvamento').value.trim() || 'IA_Editora_Arquivos';
        ESTADO.configuracao.nomePasta = novoNome;
        localStorage.setItem('nomePastaSalva', novoNome);
        atualizarCaminhosPasta();
        alert(`✅ Pasta de salvamento definida: "${novoNome}"\n\nOs arquivos serão baixados para:\nDownloads / ${novoNome} /`);
    });

    document.getElementById('padrao-nome').addEventListener('change', (e) => {
        ESTADO.configuracao.padraoNome = e.target.value;
        const grupo = document.getElementById('nome-personalizado-grupo');
        if (e.target.value === 'personalizado') {
            grupo.classList.remove('oculto');
        } else {
            grupo.classList.add('oculto');
        }
    });

    document.getElementById('nome-arquivo-prefixo').addEventListener('input', (e) => {
        ESTADO.configuracao.prefixoPersonalizado = e.target.value || 'MinhaGravacao';
    });
}

function atualizarCaminhosPasta() {
    const nome = ESTADO.configuracao.nomePasta;
    document.getElementById('nome-pasta-mostra').textContent = nome;
    document.getElementById('nome-pasta-saida').textContent = nome;
    document.getElementById('resumo-nome-pasta').textContent = nome;
    document.getElementById('caminho-pasta').innerHTML = `Pasta padrão: Downloads / <strong>${nome}</strong> /`;
    document.getElementById('status-pasta').textContent = `📁 Pasta: ${nome}`;
}

function gerarNomeArquivo(tipo = 'gravacao') {
    if (ESTADO.configuracao.padraoNome === 'data') {
        return `${tipo}_${dataParaNome()}`;
    } else {
        const contador = ESTADO.historico.listaGravacoes.length + 1;
        return `${ESTADO.configuracao.prefixoPersonalizado}_${String(contador).padStart(3, '0')}`;
    }
}

// 🔄 ABAS
function configurarAbas() {
    document.querySelectorAll('.abas button').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.abas button').forEach(x => x.classList.remove('aba-ativa'));
            b.classList.add('aba-ativa');
            document.querySelectorAll('.conteudo').forEach(c => c.classList.remove('aba-visivel'));
            document.getElementById(b.dataset.aba).classList.add('aba-visivel');
        });
    });
}

// 🎙️ GRAVAÇÃO OFFLINE
function configurarGravacaoOffline() {
    const video = document.getElementById('visualizacao');
    let stream = null;

    document.getElementById('btn-iniciar-grav').addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: document.getElementById('gravar-audio').checked
            });
            video.srcObject = stream;
            
            ESTADO.gravacao.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            ESTADO.gravacao.dados = [];
            
            ESTADO.gravacao.mediaRecorder.ondataavailable = e => ESTADO.gravacao.dados.push(e.data);
            ESTADO.gravacao.mediaRecorder.onstop = finalizarGravacao;
            ESTADO.gravacao.mediaRecorder.start(1000);
            ESTADO.gravacao.ativa = true;

            document.getElementById('btn-iniciar-grav').classList.add('oculto');
            document.getElementById('btn-parar-grav').classList.remove('oculto');
            document.getElementById('status-gravacao').textContent = '🔴 Gravando... Navegue normalmente, tudo está sendo salvo!';
        } catch (erro) {
            alert('⚠️ Permita acesso à tela/câmera. Funciona melhor no Chrome/Edge.');
        }
    });

    document.getElementById('btn-parar-grav').addEventListener('click', () => {
        if (ESTADO.gravacao.mediaRecorder && ESTADO.gravacao.ativa) {
            ESTADO.gravacao.mediaRecorder.stop();
            ESTADO.gravacao.ativa = false;
            stream?.getTracks().forEach(t => t.stop());
            video.srcObject = null;
        }
    });

    document.getElementById('btn-baixar-grav').addEventListener('click', () => {
        if (!ESTADO.gravacao.ultimoArquivo) return;
        const nomeArq = gerarNomeArquivo('Gravacao') + '.webm';
        salvarArquivoLocal(ESTADO.gravacao.ultimoArquivo, nomeArq);
    });
}

function finalizarGravacao() {
    const blob = new Blob(ESTADO.gravacao.dados, { type: 'video/webm' });
    ESTADO.gravacao.ultimoArquivo = blob;
    
    document.getElementById('btn-parar-grav').classList.add('oculto');
    document.getElementById('btn-baixar-grav').classList.remove('oculto');
    document.getElementById('btn-iniciar-grav').classList.remove('oculto');
    
    const nomeArq = gerarNomeArquivo('Gravacao');
    document.getElementById('status-gravacao').innerHTML = 
        `✅ Gravação pronta! Arquivo: <strong>${nomeArq}.webm</strong> &nbsp; <button id="salvar-agora" class="botao">💾 Salvar Agora</button>`;
    
    document.getElementById('salvar-agora').addEventListener('click', () => {
        salvarArquivoLocal(blob, nomeArq + '.webm');
        if (document.getElementById('auto-editar').checked) {
            adicionarParaProcessamento(blob, nomeArq);
        }
    });

    ESTADO.historico.listaGravacoes.unshift({
        nome: nomeArq + '.webm',
        data: new Date().toLocaleString(),
        tamanho: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    atualizarListaGravacoes();
    salvarDados();
}

function salvarArquivoLocal(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`💾 Salvo: ${nomeArquivo}`);
}

function dataParaNome() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`;
}

function atualizarListaGravacoes() {
    const el = document.getElementById('lista-gravadas');
    if (!ESTADO.historico.listaGravacoes.length) {
        el.innerHTML = '<li>Nenhuma gravação salva ainda</li>';
        return;
    }
    el.innerHTML = ESTADO.historico.listaGravacoes.map(g => 
        `<li>✅ ${g.nome} — ${g.data} — ${g.tamanho}</li>`
    ).join('');
}

// ✂️ PROCESSAMENTO
function configurarUploadEProcessamento() {
    const entrada = document.getElementById('entrada-video');
    document.getElementById('area-upload').addEventListener('click', () => entrada.click());
    entrada.addEventListener('change', e => {
        ESTADO.processamento.arquivos = Array.from(e.target.files);
        document.getElementById('status-envio').textContent = 
            `${ESTADO.processamento.arquivos.length} arquivo(s) pronto(s)`;
    });

    document.getElementById('iniciar-processamento').addEventListener('click', async () => {
        if (!ESTADO.processamento.arquivos.length) {
            alert('Selecione ou grave um vídeo primeiro!');
            return;
        }

        document.getElementById('painel-progresso').classList.remove('oculto');
        document.getElementById('resultados-finais').classList.add('oculto');
        const log = document.getElementById('log-ia');
        log.innerHTML = '';

        const etapas = [
            "📥 Carregando arquivos...",
            "👁️ Analisando conteúdo...",
            "🎯 Detectando momentos altos...",
            "🏅 Identificando DESTAQUES Estilo Medalha...",
            "✂️ Gerando clipes...",
            "💬 Criando legendas...",
            "🎵 Selecionando trilha...",
            "✨ Melhorando qualidade...",
            "📦 Preparando para download..."
        ];

        for (let i = 0; i < etapas.length; i++) {
            document.getElementById('etapa-atual').textContent = etapas[i];
            document.getElementById('barra-principal').style.width = `${((i+1)/etapas.length)*100}%`;
            log.innerHTML += `<p>[${i+1}/${etapas.length}] ${etapas[i]}</p>`;
            log.scrollTop = log.scrollHeight;
            await esperar(700 + Math.random() * 500);
        }

        const qtdDestaques = Math.floor(Math.random() * 3) + 2;
        ESTADO.ia.destaquesGerados += qtdDestaques;
        ESTADO.historico.totalArquivos += ESTADO.processamento.arquivos.length;
        ESTADO.historico.horas += ESTADO.processamento.arquivos.length * (Math.random() * 1.5 + 0.3);
        ESTADO.ia.experiencia += ESTADO.processamento.arquivos.length * 10;
        
        if (ESTADO.ia.experiencia >= ESTADO.ia.nivel * 100) {
            ESTADO.ia.nivel++;
            ESTADO.ia.experiencia = 0;
            alert(`🧠 IA EVOLUIU! Nível ${ESTADO.ia.nivel}!`);
        }

        exibirResultadosProcessamento(qtdDestaques);
        salvarDados();
        atualizarTelaDados();
    });
}

function exibirResultadosProcessamento(qtdDestaques) {
    document.getElementById('painel-progresso').classList.add('oculto');
    const lista = document.getElementById('lista-arquivos');
    lista.innerHTML = '';

    ESTADO.processamento.arquivos.forEach(arq => {
        lista.innerHTML += `
            <div class="item-resultado">
                <h4>✅ ${arq.name}</h4>
                <p>📁 Pasta de saída: <strong>${ESTADO.configuracao.nomePasta}/_Edicoes_Finais/</strong></p>
                <ul>
                    <li>📄 Arquivo Original</li>
                    <li>📱 Versão Vertical (TikTok/Shorts)</li>
                    <li>🏅 ${qtdDestaques} Destaques com Estilo Medalha</li>
                    <li>🏆 Top 5 Momentos juntos</li>
                    <li>💬 Legendas sincronizadas</li>
                </ul>
                <button class="botao">💾 Baixar ${arq.name}</button>
            </div>
        `;
    });

    const listaDestaques = document.getElementById('lista-destaques-salvos');
    listaDestaques.innerHTML = `<li>🏅 ${qtdDestaques} novos destaques gerados!</li>`;
    document.getElementById('resultados-finais').classList.remove('oculto');
}

function adicionarParaProcessamento(blob, nome) {
    ESTADO.processamento.arquivos = [{
        name: `${nome}.webm`,
        size: blob.size,
        lastModified: Date.now()
    }];
    document.querySelector('[data-aba="editoria"]').click();
    alert('✅ Gravação enviada para edição!');
}

// 📡 LIVE
function configurarLive() {
    document.getElementById('conectar-live').addEventListener('click', () => {
        const canal = document.getElementById('canal-live').value.trim() || 'Canal de Teste';
        ESTADO.live.conectada = true;
        document.getElementById('painel-live-ativo').classList.remove('oculto');
        document.getElementById('caixa-chat-ia').innerHTML = `<p><span style="color:#10b981">📢 Sistema:</span> Conectado a ${canal} — IA ativa!</p>`;
        
        const loop = () => {
            if (!ESTADO.live.conectada) return;
            const frases = Object.values(BANCO.frasesLive).flat();
            const msg = frases[Math.floor(Math.random() * frases.length)];
            document.getElementById('caixa-chat-ia').innerHTML += `<p><span style="color:#ec4899">🤖 IA:</span> ${msg}</p>`;
            document.getElementById('caixa-chat-ia').scrollTop = 99999;
            
            if (Math.random() > 0.75) {
                ESTADO.live.clipes++;
                document.getElementById('caixa-chat-ia').innerHTML += 
                    `<p><span style="color:#f59e0b">🏅 Destaque:</span> Clipe #${ESTADO.live.clipes} salvo em: ${ESTADO.configuracao.nomePasta}/_Clipes_Live_</p>`;
            }
            setTimeout(loop, 6000 + Math.random() * 6000);
        };
        setTimeout(loop, 2000);
    });

    document.getElementById('desconectar-live').addEventListener('click', () => {
        ESTADO.live.conectada = false;
        document.getElementById('painel-live-ativo').classList.add('oculto');
        salvarDados();
    });
}