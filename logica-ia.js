// ==================================================
// 🧠 IA EDITORA — FFmpeg FUNCIONANDO DE VERDADE
// ✅ Junta vídeos | ✅ Corta | ✅ Efeitos | ✅ Sem legenda | ✅ Sem música
// ✅ Corrigido: arquivos são lidos e escritos corretamente
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
function dataHoje() { return new Date().toISOString().slice(0,10).replace(/-/g,''); }
function nomeArq(pasta, nome, ext) { return `${nomePastaSalvamento}/${pasta}/${nome}_${dataHoje()}.${ext}`; }
function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ========== INICIALIZAR FFMPEG ==========
async function inicializarFFmpeg() {
  if(isFFmpegLoaded && ffmpeg) return true;
  try {
    if(!window.FFmpegWasm) {
      console.error('FFmpegWasm não encontrado. Verifique a linha <script> no HTML.');
      return false;
    }
    const { FFmpeg } = window.FFmpegWasm;
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message));
    ffmpeg.on('progress', ({ progress, time }) => {
      const pct = Math.round(progress * 100);
      const barra = document.getElementById('barra-principal');
      if(barra) barra.style.width = `${pct}%`;
    });

    await ffmpeg.load({
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm'
    });
    
    isFFmpegLoaded = true;
    console.log('✅ FFmpeg carregado com sucesso!');
    return true;
  } catch(e) {
    console.error('❌ Erro ao carregar FFmpeg:', e);
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
    const el = document.getElementById(id); if(el) el.textContent = nomePastaSalvamento;
  });
  alert(`✅ Pasta: ${nomePastaSalvamento}`);
});

// ========== GRAVAÇÃO ==========
document.getElementById('btn-iniciar-grav')?.addEventListener('click', async () => {
  try {
    const tela = document.getElementById('gravar-tela')?.checked;
    const stream = tela
      ? await navigator.mediaDevices.getDisplayMedia({ video: {}, audio: true })
      : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    const visor = document.getElementById('visualizacao');
    if(visor) visor.srcObject = stream;
    dadosGravacao = []; arquivoVideoGravado = null;
    
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => e.data.size && dadosGravacao.push(e.data);
    mediaRecorder.onstop = finalizarGravacao;
    mediaRecorder.start(500);
    
    gravacaoAtiva = true;
    document.getElementById('btn-iniciar-grav')?.classList.add('oculto');
    document.getElementById('btn-parar-grav')?.classList.remove('oculto');
    const st = document.getElementById('status-gravacao');
    if(st) st.textContent = '🔴 Gravando...';
  } catch(e) { alert('❌ ' + e.message); }
});

document.getElementById('btn-parar-grav')?.addEventListener('click', () => {
  if(mediaRecorder && gravacaoAtiva) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    gravacaoAtiva = false;
    const v = document.getElementById('visualizacao'); if(v) v.srcObject = null;
  }
});

function finalizarGravacao() {
  document.getElementById('btn-parar-grav')?.classList.add('oculto');
  document.getElementById('btn-baixar-grav')?.classList.remove('oculto');
  arquivoVideoGravado = new Blob(dadosGravacao, { type: 'video/webm' });
  arquivosCarregados.push({ nome: 'Gravacao.webm', blob: arquivoVideoGravado });
  
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

// ==================================================
// 🎬 PROCESSAMENTO CORRIGIDO — JUNÇÃO + CORTE + EFEITOS
// ==================================================

async function limparArquivosFFmpeg(nomes) {
  for(const n of nomes) {
    try { await ffmpeg.deleteFile(n); } catch {}
  }
}

async function gerarVersao(entradas, nomeSaida, duracao, filtro) {
  const nomesEntrada = [];
  
  // ✅ Escreve CADA arquivo no sistema de arquivos do FFmpeg
  for(let i = 0; i < entradas.length; i++) {
    const nomeArq = `entrada_${i}.webm`;
    const buffer = await entradas[i].blob.arrayBuffer();
    await ffmpeg.writeFile(nomeArq, new Uint8Array(buffer));
    nomesEntrada.push(nomeArq);
  }

  // ✅ Cria lista de junção
  const listaTxt = 'lista_juncao.txt';
  const conteudo = nomesEntrada.map(n => `file '${n}'`).join('\n');
  await ffmpeg.writeFile(listaTxt, conteudo);

  // ✅ Executa: junta → corta duração → aplica efeito
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', listaTxt,
    '-t', duracao.toString(),
    '-vf', filtro,
    '-c:v', 'libvpx',
    '-b:v', '2M',
    '-c:a', 'libvorbis',
    nomeSaida
  ]);

  // ✅ Lê resultado
  const dados = await ffmpeg.readFile(nomeSaida);
  const resultado = new Blob([dados], { type: 'video/webm' });

  // ✅ Limpa arquivos temporários
  await limparArquivosFFmpeg([...nomesEntrada, listaTxt, nomeSaida]);

  return resultado;
}

// ========== 🚀 BOTÃO PRINCIPAL ==========
document.getElementById('iniciar-processamento')?.addEventListener('click', async () => {
  if(arquivosCarregados.length === 0) {
    alert('⚠️ Envie ou grave pelo menos um vídeo!');
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

  // 🔧 Carrega FFmpeg
  if(etapa) etapa.textContent = '🔧 Carregando FFmpeg...';
  const ok = await inicializarFFmpeg();
  if(!ok) {
    alert('❌ Não foi possível carregar o FFmpeg. Verifique a linha <script> no HTML.');
    if(botao) botao.disabled = false;
    return;
  }

  // 📋 Lista de versões a gerar
  const versoes = [
    {
      id: 'completo',
      nome: '1_EDICAO_COMPLETA_12s',
      desc: 'Junta todos os vídeos — 12s — brilho e cor melhorados',
      duracao: 12,
      filtro: 'eq=brightness=0.10:contrast=1.10:saturation=1.20'
    },
    {
      id: 'curto',
      nome: '2_CORTE_CURTO_6s',
      desc: 'Corte rápido — 6s — cores vibrantes',
      duracao: 6,
      filtro: 'eq=brightness=0.12:contrast=1.15:saturation=1.30'
    },
    {
      id: 'reels',
      nome: '3_REELS_8s',
      desc: 'Otimizado para redes — 8s — chamativo',
      duracao: 8,
      filtro: 'eq=brightness=0.08:contrast=1.12:saturation=1.25'
    },
    {
      id: 'resumo',
      nome: '4_RESUMO_10s',
      desc: 'Resumo — 10s — equilíbrio visual',
      duracao: 10,
      filtro: 'eq=brightness=0.05:contrast=1.08:saturation=1.15'
    }
  ];

  // 🔄 Processa cada versão
  for(let i = 0; i < versoes.length; i++) {
    const v = versoes[i];
    
    if(etapa) etapa.textContent = `🎬 ${i+1}/${versoes.length} — ${v.nome}`;
    if(log) log.innerHTML += `<div>✅ Processando: ${v.desc}</div>`;

    try {
      const videoBlob = await gerarVersao(arquivosCarregados, `${v.nome}.webm`, v.duracao, v.filtro);
      
      arquivosProntos.push({
        nome: nomeArq('_Edicao_Final', v.nome, 'webm'),
        blob: videoBlob,
        desc: v.desc
      });
      
      if(barra) barra.style.width = `${((i+1)/versoes.length) * 100}%`;
    } catch(e) {
      console.error(`Erro em ${v.nome}:`, e);
      if(log) log.innerHTML += `<div style="color:#ef4444;">❌ ${v.nome}: ${e.message}</div>`;
    }
  }

  // ✅ Exibe resultado
  if(resultados) {
    resultados.classList.remove('oculto');
    resultados.innerHTML = `
      <h3 style="color:#10b981; margin:0 0 1rem 0; font-size:1.2rem;">
        ✅ ${arquivosProntos.length} Vídeos Gerados!
      </h3>
      <p style="margin:0 0 1rem 0; color:#94a3b8;">
        📁 Pasta: <strong>${nomePastaSalvamento}/</strong> |
        📎 Entradas: <strong>${arquivosCarregados.length}</strong>
      </p>
      <div style="background:#1e293b; padding:1rem; border-radius:10px; margin-bottom:1.5rem;">
        ${arquivosProntos.map((arq, i) => `
          <div style="padding:0.7rem 0; border-bottom:${i < arquivosProntos.length-1 ? '1px solid #334155' : 'none'};">
            <p style="margin:0; color:#e2e8f0; font-weight:bold;">📄 ${arq.nome}</p>
            <p style="margin:0.3rem 0 0 0; font-size:0.85rem; color:#10b981;">${arq.desc}</p>
          </div>
        `).join('')}
      </div>
      ${arquivosProntos.length > 0 ? `
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <button id="btn-todos" style="padding:0.9rem 1.8rem; background:linear-gradient(90deg,#6366f1,#ec4899); color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
            📦 Baixar Todos
          </button>
          <button id="btn-um" style="padding:0.9rem 1.8rem; background:#374151; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
            📄 Baixar um por um
          </button>
        </div>
      ` : '<p style="color:#ef4444;">Nenhum vídeo foi gerado. Verifique o console.</p>'}
    `;

    document.getElementById('btn-todos')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 400));
      alert(`✅ Baixando ${arquivosProntos.length} vídeos!\n\n✅ Junta trechos\n✅ Corta duração\n✅ Melhora brilho e cor\n✅ Sem legenda, sem música`);
    });

    document.getElementById('btn-um')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 400));
      alert(`✅ Baixando ${arquivosProntos.length} vídeos!`);
    });
  }

  if(botao) botao.disabled = false;
  console.log('✅ PROCESSAMENTO FINALIZADO');
});

console.log('✅ SISTEMA PRONTO — FFmpeg ATIVO E CORRIGIDO!');