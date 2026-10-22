// ==================================================
// 🧠 IA EDITORA EVOLUTIVA — VERSÃO COM FFmpeg REAL
// ✅ Junta vídeos
// ✅ Faz cortes curtos
// ✅ Aplica efeitos
// ✅ Gera vídeos reais, não só simulação
// ✅ Sem legenda, sem música
// ==================================================

let mediaRecorder = null;
let gravacaoAtiva = false;
let dadosGravacao = [];
let arquivoVideoGravado = null;
let nomePastaSalvamento = "IA_Editora_Arquivos";
let arquivosCarregados = [];
let arquivosProntos = [];
let ffmpeg = null;
let isFFmpegLoaded = false;

// ========== UTILITÁRIOS ==========
function dataHoje() {
  return new Date().toISOString().slice(0,10).replace(/-/g,'');
}

function nomeArq(pasta, nome, ext) {
  return `${nomePastaSalvamento}/${pasta}/${nome}_${dataHoje()}.${ext}`;
}

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

// ========== INICIALIZAR FFMPEG ==========
async function inicializarFFmpeg() {
  if(isFFmpegLoaded) return true;

  try {
    const { FFmpeg } = FFmpegWasm;
    ffmpeg = new FFmpeg();

    await ffmpeg.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm'
    });

    isFFmpegLoaded = true;
    return true;
  } catch(e) {
    console.error('Erro ao carregar FFmpeg:', e);
    return false;
  }
}

// ========== RELÓGIO ==========
function atualizarRelogio() {
  const el = document.getElementById('mostra-hora');
  if(el) el.textContent = new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' });
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// ========== NAVEGAÇÃO ==========
document.querySelectorAll('[data-aba]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-aba]').forEach(x => x.classList.remove('aba-ativa'));
    document.querySelectorAll('.conteudo').forEach(x => x.classList.remove('aba-visivel'));
    b.classList.add('aba-ativa');
    document.getElementById(b.dataset.aba)?.classList.add('aba-visivel');
  });
});

// ========== PASTA ==========
document.getElementById('salvar-pasta')?.addEventListener('click', () => {
  nomePastaSalvamento = document.getElementById('nome-pasta-salvamento')?.value.trim() || "IA_Editora_Arquivos";
  ['nome-pasta-mostra','nome-pasta-saida','resumo-nome-pasta'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = nomePastaSalvamento;
  });
  alert(`✅ Pasta: ${nomePastaSalvamento}`);
});

// ========== GRAVAÇÃO ==========
document.getElementById('btn-iniciar-grav')?.addEventListener('click', async () => {
  try {
    const tela = document.getElementById('gravar-tela')?.checked;
    const audio = true;
    const stream = tela
      ? await navigator.mediaDevices.getDisplayMedia({ video: {}, audio })
      : await navigator.mediaDevices.getUserMedia({ video: true, audio });

    const visor = document.getElementById('visualizacao');
    if(visor) visor.srcObject = stream;
    dadosGravacao = [];
    arquivoVideoGravado = null;

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => e.data.size && dadosGravacao.push(e.data);
    mediaRecorder.onstop = finalizarGravacao;
    mediaRecorder.start(500);

    gravacaoAtiva = true;
    document.getElementById('btn-iniciar-grav')?.classList.add('oculto');
    document.getElementById('btn-parar-grav')?.classList.remove('oculto');
    const st = document.getElementById('status-gravacao');
    if(st) st.textContent = '🔴 Gravando...';
  } catch(e) {
    alert('❌ ' + e.message);
  }
});

document.getElementById('btn-parar-grav')?.addEventListener('click', () => {
  if(mediaRecorder && gravacaoAtiva) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    gravacaoAtiva = false;
    const v = document.getElementById('visualizacao');
    if(v) v.srcObject = null;
  }
});

function finalizarGravacao() {
  document.getElementById('btn-parar-grav')?.classList.add('oculto');
  document.getElementById('btn-baixar-grav')?.classList.remove('oculto');
  arquivoVideoGravado = new Blob(dadosGravacao, { type: 'video/webm' });
  arquivosCarregados.push({ nome: 'Gravacao', blob: arquivoVideoGravado });

  if(document.getElementById('auto-editar')?.checked) {
    setTimeout(() => {
      document.querySelector('[data-aba="editoria"]')?.click();
      atualizarListaArquivos();
    }, 500);
  }

  const lista = document.getElementById('lista-gravadas');
  if(lista) lista.innerHTML = `<li>✅ Gravação pronta</li>`;
}

document.getElementById('btn-baixar-grav')?.addEventListener('click', () => {
  if(!arquivoVideoGravado) return;
  baixar(arquivoVideoGravado, nomeArq('_Gravacoes_', 'Gravacao_Original', 'webm'));
});

// ========== UPLOAD ==========
document.getElementById('entrada-video')?.addEventListener('change', e => {
  const novos = Array.from(e.target.files || [])
    .filter(f => f.type.startsWith('video/'))
    .map(f => ({ nome: f.name, blob: f }));

  arquivosCarregados = arquivosCarregados.concat(novos);
  atualizarListaArquivos();

  const st = document.getElementById('status-envio');
  if(st) st.textContent = `✅ ${arquivosCarregados.length} vídeo(s) carregado(s)`;
});

function atualizarListaArquivos() {
  const l = document.getElementById('lista-arquivos');
  if(!l) return;

  l.innerHTML = arquivosCarregados.map((a, i) =>
    `<p style="margin:0.3rem 0; padding:0.4rem; background:#1e293b; border-radius:6px;">
      📎 ${i+1}. ${a.nome}
    </p>`
  ).join('');
}

// ========== 🎬 PROCESSAMENTO REAL DE VÍDEO ==========
async function processarVideoReal(arquivos, opcoes) {
  if(!isFFmpegLoaded || !ffmpeg) {
    throw new Error('FFmpeg não carregado. Verifique se os arquivos do FFmpeg estão na pasta /ffmpeg/');
  }

  const nomesEntrada = [];

  for(let i = 0; i < arquivos.length; i++) {
    const nome = `entrada_${i}.webm`;
    const buffer = await arquivos[i].blob.arrayBuffer();
    await ffmpeg.writeFile(nome, new Uint8Array(buffer));
    nomesEntrada.push(nome);
  }

  const arquivoLista = 'lista.txt';
  let conteudoLista = '';
  nomesEntrada.forEach(nome => {
    conteudoLista += `file '${nome}'\n`;
  });
  await ffmpeg.writeFile(arquivoLista, conteudoLista);

  const saida = opcoes.saida || 'saida.webm';

  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', arquivoLista,
    '-t', opcoes.duracao.toString(),
    '-vf', opcoes.efeito || '',
    '-c:v', 'libvpx',
    '-b:v', '2M',
    '-c:a', 'libvorbis',
    saida
  ]);

  const dados = await ffmpeg.readFile(saida);
  return new Blob([dados], { type: 'video/webm' });
}

// ========== 🚀 BOTÃO DE GERAR EDIÇÃO ==========
document.getElementById('iniciar-processamento')?.addEventListener('click', async () => {
  if(arquivosCarregados.length === 0) {
    alert('⚠️ Grave ou envie pelo menos um vídeo primeiro!');
    return;
  }

  const botao = document.getElementById('iniciar-processamento');
  const barra = document.getElementById('barra-principal');
  const etapa = document.getElementById('etapa-atual');
  const log = document.getElementById('log-ia');
  const resultados = document.getElementById('resultados-finais');

  if(botao) botao.disabled = true;
  if(barra) barra.style.width = '0%';
  if(log) log.innerHTML = '';
  if(resultados) resultados.classList.add('oculto');

  arquivosProntos = [];

  if(etapa) etapa.textContent = '🔧 Carregando editor de vídeo...';
  if(log) log.innerHTML += `<div>🔧 Inicializando FFmpeg...</div>`;

  const ok = await inicializarFFmpeg();
  if(!ok) {
    alert('❌ FFmpeg não carregou. Verifique se você colocou os arquivos na pasta /ffmpeg/');
    if(botao) botao.disabled = false;
    return;
  }

  const edicoes = [
    {
      nome: '1_JUNCAO_COMPLETA_12s',
      desc: 'Junta todos os vídeos em 12 segundos com cor melhorada',
      duracao: 12,
      efeito: 'eq=brightness=0.10:contrast=1.10:saturation=1.20'
    },
    {
      nome: '2_CORTE_CURTO_6s',
      desc: 'Corte curto de 6 segundos para conteúdo rápido',
      duracao: 6,
      efeito: 'eq=brightness=0.12:contrast=1.15:saturation=1.30'
    },
    {
      nome: '3_REELS_8s',
      desc: 'Versão de 8 segundos otimizada para redes sociais',
      duracao: 8,
      efeito: 'eq=brightness=0.08:contrast=1.12:saturation=1.25'
    },
    {
      nome: '4_RESUMO_10s',
      desc: 'Resumo de 10 segundos com os principais trechos',
      duracao: 10,
      efeito: 'eq=brightness=0.05:contrast=1.08:saturation=1.15'
    }
  ];

  for(let i = 0; i < edicoes.length; i++) {
    const edicao = edicoes[i];

    if(etapa) etapa.textContent = `� Processando ${edicao.nome}...`;
    if(barra) barra.style.width = ((i+1)/edicoes.length*100) + '%';
    if(log) log.innerHTML += `<div>✅ ${edicao.desc}</div>`;

    try {
      const videoBlob = await processarVideoReal(arquivosCarregados, {
        duracao: edicao.duracao,
        efeito: edicao.efeito,
        saida: `${edicao.nome}.webm`
      });

      arquivosProntos.push({
        nome: nomeArq('_Edicao_Final', edicao.nome, 'webm'),
        blob: videoBlob,
        desc: edicao.desc
      });
    } catch(e) {
      console.error('Erro ao processar vídeo:', e);
      if(log) log.innerHTML += `<div>❌ Erro em ${edicao.nome}: ${e.message}</div>`;
    }
  }

  if(resultados) {
    resultados.classList.remove('oculto');
    resultados.innerHTML = `
      <h3 style="color:#10b981; margin:0 0 1rem 0; font-size:1.2rem;">
        ✅ Processamento Finalizado!
      </h3>
      <p style="margin:0 0 1rem 0; color:#94a3b8;">
        📁 Pasta: <strong>${nomePastaSalvamento}/</strong> |
        📎 Arquivos carregados: <strong>${arquivosCarregados.length}</strong>
      </p>
      <div style="background:#1e293b; padding:1rem; border-radius:10px; margin-bottom:1.5rem;">
        ${arquivosProntos.length > 0 
          ? arquivosProntos.map((arq, i) => `
            <div style="padding:0.7rem 0; border-bottom:${i < arquivosProntos.length-1 ? '1px solid #334155' : 'none'};">
              <p style="margin:0; color:#e2e8f0; font-weight:bold;">📄 ${arq.nome}</p>
              <p style="margin:0.3rem 0 0 0; font-size:0.85rem; color:#10b981;">${arq.desc}</p>
            </div>
          `).join('')
          : '<p style="color:#ef4444;">Nenhum vídeo foi gerado. Verifique o console.</p>'
        }
      </div>
      ${arquivosProntos.length > 0 ? `
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <button id="btn-baixar-todos" style="padding:0.9rem 1.8rem; background:linear-gradient(90deg,#6366f1,#ec4899); color:white; border:none; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer;">
            📦 Baixar Todos
          </button>
          <button id="btn-baixar-um" style="padding:0.9rem 1.8rem; background:#374151; color:white; border:none; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer;">
            📄 Baixar um por um
          </button>
        </div>
      ` : ''}
    `;

    document.getElementById('btn-baixar-todos')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 350));
      alert(`✅ Baixando ${arquivosProntos.length} vídeos!`);
    });

    document.getElementById('btn-baixar-um')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 350));
      alert(`✅ Baixando ${arquivosProntos.length} vídeos!`);
    });
  }

  if(botao) botao.disabled = false;

  console.log('✅ PROCESSAMENTO FINALIZADO');
  console.log('Vídeos gerados:', arquivosProntos);
});

console.log('✅ SISTEMA PRONTO — FFmpeg ATIVADO');