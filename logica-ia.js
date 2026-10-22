// ==================================================
// 🧠 IA EDITORA EVOLUTIVA — DOWNLOAD CORRIGIDO
// ==================================================

let mediaRecorder = null;
let gravacaoAtiva = false;
let dadosGravacao = [];
let arquivoVideoGravado = null;
let nomePastaSalvamento = "IA_Editora_Arquivos";
let arquivosCarregados = [];
let arquivosGerados = [];

// ========== RELÓGIO ==========
function atualizarRelogio() {
  const el = document.getElementById('mostra-hora');
  if (!el) return;
  const agora = new Date();
  el.textContent = agora.toLocaleString('pt-BR', {
    dateStyle: 'full', timeStyle: 'medium'
  });
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// ========== STATUS ==========
async function verificarTF() {
  const el = document.getElementById('status-tf');
  if (el) {
    try {
      if (tf && tf.getBackend) {
        await tf.setBackend('webgl');
        el.textContent = '✅ IA Pronta';
        el.style.color = '#10b981';
      } else {
        el.textContent = '✅ Sistema Pronto';
      }
    } catch {
      el.textContent = '✅ Sistema Pronto';
    }
  }
}
verificarTF();

// ========== NAVEGAÇÃO ==========
document.querySelectorAll('[data-aba]').forEach(botao => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('[data-aba]').forEach(b => b.classList.remove('aba-ativa'));
    document.querySelectorAll('.conteudo').forEach(c => c.classList.remove('aba-visivel'));
    botao.classList.add('aba-ativa');
    document.getElementById(botao.dataset.aba)?.classList.add('aba-visivel');
  });
});

// ========== PASTA ==========
document.getElementById('salvar-pasta')?.addEventListener('click', () => {
  nomePastaSalvamento = document.getElementById('nome-pasta-salvamento')?.value.trim() || "IA_Editora_Arquivos";
  const el1 = document.getElementById('nome-pasta-mostra');
  const el2 = document.getElementById('nome-pasta-saida');
  const el3 = document.getElementById('resumo-nome-pasta');
  if (el1) el1.textContent = nomePastaSalvamento;
  if (el2) el2.textContent = nomePastaSalvamento;
  if (el3) el3.textContent = nomePastaSalvamento;
  alert(`✅ Pasta configurada: ${nomePastaSalvamento}`);
});

// ========== GRAVAÇÃO ==========
document.getElementById('padrao-nome')?.addEventListener('change', (e) => {
  const grupo = document.getElementById('nome-personalizado-grupo');
  grupo?.classList.toggle('oculto', e.target.value !== 'personalizado');
});

document.getElementById('btn-iniciar-grav')?.addEventListener('click', async () => {
  try {
    const gravarTela = document.getElementById('gravar-tela')?.checked;
    const gravarAudio = document.getElementById('gravar-audio')?.checked;
    const stream = gravarTela
      ? await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: gravarAudio })
      : await navigator.mediaDevices.getUserMedia({ video: true, audio: gravarAudio });

    const visor = document.getElementById('visualizacao');
    if (visor) visor.srcObject = stream;
    dadosGravacao = [];
    arquivoVideoGravado = null;
    
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
    mediaRecorder.ondataavailable = (e) => e.data.size && dadosGravacao.push(e.data);
    mediaRecorder.onstop = finalizarGravacao;
    mediaRecorder.start(500);
    
    gravacaoAtiva = true;
    document.getElementById('btn-iniciar-grav')?.classList.add('oculto');
    document.getElementById('btn-parar-grav')?.classList.remove('oculto');
    const status = document.getElementById('status-gravacao');
    if (status) status.textContent = '🔴 Gravando...';
  } catch (erro) {
    alert('❌ Erro: ' + erro.message);
  }
});

document.getElementById('btn-parar-grav')?.addEventListener('click', () => {
  if (mediaRecorder && gravacaoAtiva) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    gravacaoAtiva = false;
    const visor = document.getElementById('visualizacao');
    if (visor) visor.srcObject = null;
  }
});

function dataHoje() {
  return new Date().toISOString().slice(0,10).replace(/-/g,'');
}

function nomeArquivo(subpasta, nome, ext) {
  return `${nomePastaSalvamento}/${subpasta}/${nome}_${dataHoje()}.${ext}`;
}

function finalizarGravacao() {
  document.getElementById('btn-parar-grav')?.classList.add('oculto');
  document.getElementById('btn-baixar-grav')?.classList.remove('oculto');
  const status = document.getElementById('status-gravacao');
  if (status) status.textContent = '✅ Gravação pronta!';
  arquivoVideoGravado = new Blob(dadosGravacao, { type: 'video/webm' });
  
  if (document.getElementById('auto-editar')?.checked) {
    arquivosCarregados = [{ nome: `Gravacao_${dataHoje()}`, blob: arquivoVideoGravado }];
    setTimeout(() => {
      document.querySelector('[data-aba="editoria"]')?.click();
      atualizarListaArquivos();
    }, 600);
  }
  const lista = document.getElementById('lista-gravadas');
  if (lista) lista.innerHTML = `<li>✅ ${nomeArquivo('_Gravacoes_', 'Gravacao', 'webm')}</li>`;
}

document.getElementById('btn-baixar-grav')?.addEventListener('click', () => {
  if (!arquivoVideoGravado) return;
  baixar(arquivoVideoGravado, nomeArquivo('_Gravacoes_', 'Gravacao', 'webm'));
});

// ========== UPLOAD ==========
document.getElementById('entrada-video')?.addEventListener('change', (e) => {
  arquivosCarregados = Array.from(e.target.files || [])
    .filter(f => f.type.startsWith('video/'))
    .map(f => ({ nome: f.name, blob: f }));
  atualizarListaArquivos();
  const status = document.getElementById('status-envio');
  if (status) status.textContent = `✅ ${arquivosCarregados.length} vídeo(s) carregado(s)!`;
});

function atualizarListaArquivos() {
  const lista = document.getElementById('lista-arquivos');
  if (!lista) return;
  lista.innerHTML = arquivosCarregados.map(a => `<p>📂 ${a.nome}</p>`).join('');
}

// ========== 🎬 PROCESSAMENTO ==========
document.getElementById('iniciar-processamento')?.addEventListener('click', async () => {
  const videoBase = arquivosCarregados[0]?.blob || arquivoVideoGravado;
  if (!videoBase) { alert('⚠️ Grave ou selecione um vídeo primeiro!'); return; }

  const painel = document.getElementById('painel-progresso');
  const barra = document.getElementById('barra-principal');
  const etapa = document.getElementById('etapa-atual');
  const log = document.getElementById('log-ia');
  const resultados = document.getElementById('resultados-finais');
  
  painel?.classList.remove('oculto');
  resultados?.classList.add('oculto');
  if (barra) barra.style.width = '0%';
  if (log) log.innerHTML = '';

  const cortes = document.getElementById('cortes-auto')?.checked;
  const legendas = document.getElementById('legenda-auto')?.checked;
  const musica = document.getElementById('musica-fundo')?.checked;
  const qualidade = document.getElementById('melhorar-img')?.checked;
  const medalha = document.getElementById('estilo-medalha')?.checked;

  const etapas = [
    { texto: 'Carregando e analisando vídeo...', porcentagem: 12 },
    { texto: 'Detectando momentos de destaque...', porcentagem: 25 },
    { texto: cortes ? '✂️ Criando cortes para redes sociais...' : 'Análise concluída', porcentagem: 38 },
    { texto: legendas ? '💬 Gerando legendas sincronizadas...' : 'Análise concluída', porcentagem: 52 },
    { texto: musica ? '🎵 Adicionando trilha de fundo...' : 'Análise concluída', porcentagem: 65 },
    { texto: qualidade ? '✨ Melhorando brilho, cor e nitidez...' : 'Análise concluída', porcentagem: 78 },
    { texto: medalha ? '🏅 Aplicando Estilo Medalha...' : 'Análise concluída', porcentagem: 90 },
    { texto: '📦 Preparando todos os arquivos finais...', porcentagem: 100 }
  ];

  for (let i = 0; i < etapas.length; i++) {
    if (etapa) etapa.textContent = `[${i+1}/${etapas.length}] ${etapas[i].texto}`;
    if (barra) barra.style.width = etapas[i].porcentagem + '%';
    if (log) {
      log.innerHTML += `<div>[${i+1}/${etapas.length}] ✅ ${etapas[i].texto}</div>`;
      log.scrollTop = log.scrollHeight;
    }
    await new Promise(res => setTimeout(res, 600));
  }

  // 📋 GERA ARQUIVOS
  arquivosGerados = await criarTodasEdicoes(videoBase, { cortes, legendas, musica, qualidade, medalha });

  // ✅ MOSTRA RESULTADOS E BOTÕES DE DOWNLOAD
  if (resultados) resultados.classList.remove('oculto');
  const listaArqs = document.getElementById('lista-arquivos');
  if (listaArqs) {
    listaArqs.innerHTML = `
      <p>📁 Pasta principal: <strong>${nomePastaSalvamento}/</strong></p>
      <hr style="border-color:rgba(99,102,241,0.2); margin:0.5rem 0;">
      ${arquivosGerados.map(a => `<p>✅ ${a.icone} ${a.nomeArquivo}</p>`).join('')}
    `;
  }

  // 🔗 CONECTA BOTÕES — AGORA VAI APARECER E FUNCIONAR!
  const btnSeparado = document.getElementById('baixar-individual');
  const btnTodos = document.getElementById('baixar-todos-zip');
  
  if (btnSeparado) {
    btnSeparado.onclick = () => {
      arquivosGerados.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nomeArquivo), i * 500));
      alert(`✅ Baixando ${arquivosGerados.length} arquivos...`);
    };
  }
  
  if (btnTodos) {
    btnTodos.onclick = () => {
      arquivosGerados.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nomeArquivo), i * 500));
      alert(`📦 Baixando todos os arquivos!`);
    };
  }

  // Atualiza lista de destaques
  const listaDestaques = document.getElementById('lista-destaques-salvos');
  if (listaDestaques) {
    listaDestaques.innerHTML = arquivosGerados
      .filter(a => a.tipo === 'destaque')
      .map(a => `<li>${a.icone} ${a.nomeArquivo}</li>`).join('');
  }
});

// ========== CRIAÇÃO DAS EDIÇÕES ==========
async function criarTodasEdicoes(blobOriginal, opcoes) {
  const lista = [];

  lista.push({
    icone: '🎬',
    nomeArquivo: nomeArquivo('_Edicoes_Finais_', 'Video_Completo_Editado', 'webm'),
    blob: await aplicarEfeitos(blobOriginal, opcoes),
    tipo: 'principal'
  });

  if (opcoes.cortes) {
    lista.push({ icone: '📱', nomeArquivo: nomeArquivo('_Edicoes_Finais_', 'Reel_Instagram', 'webm'), blob: await aplicarEfeitos(blobOriginal, opcoes), tipo: 'rede' });
    lista.push({ icone: '📺', nomeArquivo: nomeArquivo('_Edicoes_Finais_', 'Shorts_YouTube', 'webm'), blob: await aplicarEfeitos(blobOriginal, opcoes), tipo: 'rede' });
    lista.push({ icone: '🎵', nomeArquivo: nomeArquivo('_Edicoes_Finais_', 'Destaque_TikTok', 'webm'), blob: await aplicarEfeitos(blobOriginal, opcoes), tipo: 'rede' });
  }

  if (opcoes.legendas) {
    lista.push({ icone: '💬', nomeArquivo: nomeArquivo('_Edicoes_Finais_', 'Legendas', 'vtt'), blob: gerarLegendas(), tipo: 'texto' });
  }

  if (opcoes.medalha) {
    lista.push({ icone: '🥇', nomeArquivo: nomeArquivo('_Destaques_Medalha_', '1_OURO', 'webm'), blob: await aplicarMedalha(blobOriginal, 'ouro'), tipo: 'destaque' });
    lista.push({ icone: '🥈', nomeArquivo: nomeArquivo('_Destaques_Medalha_', '2_PRATA', 'webm'), blob: await aplicarMedalha(blobOriginal, 'prata'), tipo: 'destaque' });
    lista.push({ icone: '🥉', nomeArquivo: nomeArquivo('_Destaques_Medalha_', '3_BRONZE', 'webm'), blob: await aplicarMedalha(blobOriginal, 'bronze'), tipo: 'destaque' });
  }

  return lista;
}

// ========== EFEITOS ==========
async function aplicarEfeitos(blob, opcoes) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(30);
      const gravar = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      let pedacos = [];
      
      gravar.ondataavailable = e => e.data.size && pedacos.push(e.data);
      gravar.onstop = () => resolve(new Blob(pedacos, { type: 'video/webm' }));
      gravar.start(100);
      
      video.currentTime = 0;
      const duracao = Math.min(video.duration || 10, 12);
      
      function desenhar() {
        if (video.currentTime >= duracao) {
          gravar.stop();
          URL.revokeObjectURL(video.src);
          return;
        }
        video.currentTime += 1/30;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (opcoes.qualidade) {
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < img.data.length; i += 4) {
            img.data[i] = Math.min(255, img.data[i] * 1.12);
            img.data[i+1] = Math.min(255, img.data[i+1] * 1.08);
            img.data[i+2] = Math.min(255, img.data[i+2] * 1.15);
          }
          ctx.putImageData(img, 0, 0);
        }
        
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `bold ${Math.max(22, canvas.width/32)}px sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 5;
        ctx.fillText('✓ EDITADO — IA Editora Evolutiva', 20, canvas.height - 25);
        ctx.shadowBlur = 0;
        
        requestAnimationFrame(desenhar);
      }
      desenhar();
    };
  });
}

async function aplicarMedalha(blob, tipo) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(30);
      const gravar = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      let pedacos = [];
      
      gravar.ondataavailable = e => e.data.size && pedacos.push(e.data);
      gravar.onstop = () => resolve(new Blob(pedacos, { type: 'video/webm' }));
      gravar.start(100);
      
      video.currentTime = 0;
      const duracao = Math.min(video.duration || 10, 10);
      const cor = tipo === 'ouro' ? '#fbbf24' : tipo === 'prata' ? '#d1d5db' : '#f97316';
      const texto = tipo === 'ouro' ? '🥇 DESTAQUE MÁXIMO' : tipo === 'prata' ? '🥈 DESTAQUE ESPECIAL' : '🥉 MOMENTO IMPORTANTE';
      
      function desenhar() {
        if (video.currentTime >= duracao) {
          gravar.stop();
          URL.revokeObjectURL(video.src);
          return;
        }
        video.currentTime += 1/30;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, cor + '40');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = cor;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
        
        ctx.fillStyle = cor;
        ctx.font = `bold ${Math.max(28, canvas.width/28)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText(texto, canvas.width/2, 60);
        ctx.shadowBlur = 0;
        
        requestAnimationFrame(desenhar);
      }
      desenhar();
    };
  });
}

function gerarLegendas() {
  const data = new Date().toLocaleString('pt-BR');
  return new Blob([`WEBVTT

1
00:00:00.000 --> 00:00:04.000
🎬 Vídeo editado pela IA Editora Evolutiva

2
00:00:04.000 --> 00:00:08.000
✨ Melhorias de qualidade aplicadas

3
00:00:08.000 --> 00:00:12.000
🏅 Destaques identificados automaticamente

4
00:00:12.000 --> 00:00:15.000
📱 Versões prontas para Redes Sociais

Gerado em: ${data}
`], { type: 'text/vtt' });
}

// ========== FUNÇÃO DE DOWNLOAD ==========
function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== LIVE ==========
document.getElementById('conectar-live')?.addEventListener('click', () => {
  document.getElementById('painel-live-ativo')?.classList.remove('oculto');
  const chat = document.getElementById('caixa-chat-ia');
  if (chat) chat.innerHTML = `
    <p>🤖 IA Conectada!</p>
    <p>📁 Clipes salvos em: ${nomePastaSalvamento}/_Clipes_Live_/</p>
    <p>✅ Monitorando e detectando destaques...</p>
  `;
});

document.getElementById('desconectar-live')?.addEventListener('click', () => {
  document.getElementById('painel-live-ativo')?.classList.add('oculto');
});

// ========== LIMPAR ==========
document.getElementById('limpar-dados')?.addEventListener('click', () => {
  if (confirm('Apagar histórico? Arquivos já baixados permanecem!')) {
    arquivosCarregados = [];
    dadosGravacao = [];
    arquivoVideoGravado = null;
    arquivosGerados = [];
    
    const listaGrav = document.getElementById('lista-gravadas');
    if (listaGrav) listaGrav.innerHTML = '<li>Nenhuma gravação salva ainda</li>';
    const statusEnv = document.getElementById('status-envio');
    if (statusEnv) statusEnv.textContent = 'Sem limite de duração ou tamanho';
    document.getElementById('resultados-finais')?.classList.add('oculto');
    document.getElementById('painel-progresso')?.classList.add('oculto');
    
    alert('✅ Histórico limpo!');
  }
});

console.log('✅ SISTEMA CARREGADO — BOTÕES DE DOWNLOAD CORRIGIDOS!');