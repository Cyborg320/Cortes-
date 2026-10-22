// ==================================================
// 🧠 IA EDITORA EVOLUTIVA — VERSÃO DE ENGAJAMENTO
// ✅ Cortes curtos | ✅ Efeitos visuais | ✅ Texto chamativo
// ✅ Versões prontas para Redes | ✅ Tudo integrado
// ==================================================

let mediaRecorder = null;
let gravacaoAtiva = false;
let dadosGravacao = [];
let arquivoVideoGravado = null;
let nomePastaSalvamento = "IA_Editora_Arquivos";
let arquivosCarregados = [];
let arquivosProntos = [];

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
    const audio = true;
    const stream = tela
      ? await navigator.mediaDevices.getDisplayMedia({ video: {}, audio })
      : await navigator.mediaDevices.getUserMedia({ video: true, audio });
    
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
  l.innerHTML = arquivosCarregados.map((a, i) => `<p>📎 ${i+1}. ${a.nome}</p>`).join('');
}

// ==================================================
// 🎬 NÚCLEO DE EDIÇÃO — CORTES, EFEITOS, ENGAJAMENTO
// ==================================================

/**
 * Cria um vídeo EDITADO do zero:
 * - Corta para duração curta
 * - Aplica efeitos visuais
 * - Insere texto chamativo de engajamento
 * - Cada versão tem um estilo DIFERENTE
 */
async function criarVersaoEditada(blob, estilo) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const L = video.videoWidth || 1080;
      const A = video.videoHeight || 1920;
      const fps = 24;
      
      // ⏱️ Duração conforme estilo — CORTES CURTOS
      const duracoes = {
        destaque: 5,      // ⚡ Muito curto — impacto
        reels: 7,         // 📱 Ideal para Reels/TikTok
        historia: 10,     // 📖 Conta a história
        resumo: 8         // 📝 Resumo dinâmico
      };
      const duracao = duracoes[estilo] || 6;
      
      const canvas = document.createElement('canvas');
      canvas.width = L;
      canvas.height = A;
      const ctx = canvas.getContext('2d');
      
      const stream = canvas.captureStream(fps);
      const gravar = new MediaRecorder(stream, { 
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000
      });
      let quadros = [];
      
      gravar.ondataavailable = e => e.data.size && quadros.push(e.data);
      gravar.onstop = () => {
        resolve(new Blob(quadros, { type: 'video/webm' }));
        URL.revokeObjectURL(video.src);
      };
      gravar.start(100);
      
      video.currentTime = 0;
      let tempo = 0;
      
      // 🎨 Configurações por ESTILO — cada um com visual ÚNICO
      const estilos = {
        destaque: {
          corFundo: 'rgba(220,38,38,0.25)',
          corTexto: '#fef08a',
          titulo: '⚡ DESTAQUE',
          chamadas: [
            {t:0, tx: 'NÃO PARE AQUI! 👀'},
            {t:1.5, tx: 'ISSO VAI TE SURPREENDER 🤯'},
            {t:3, tx: 'COMPARTILHE COM ALGUÉM ✅'},
            {t:4.5, tx: 'SIGA PARA MAIS 🔥'}
          ],
          efeito: 'brilhoMaximo'
        },
        reels: {
          corFundo: 'rgba(59,130,246,0.25)',
          corTexto: '#fef08a',
          titulo: '📱 REEL PRONTO',
          chamadas: [
            {t:0, tx: 'VOCÊ PRECISA VER ISSO! 🎬'},
            {t:2, tx: 'Salve para não perder ⭐'},
            {t:4, tx: 'Curtiu? Deixe um like ❤️'},
            {t:6, tx: 'Comenta o que achou! 💬'}
          ],
          efeito: 'corViva'
        },
        historia: {
          corFundo: 'rgba(16,185,129,0.25)',
          corTexto: '#ffffff',
          titulo: '📖 HISTÓRIA',
          chamadas: [
            {t:0, tx: 'Assista até o final... 🎬'},
            {t:2.5, tx: 'Aqui acontece algo especial ✨'},
            {t:5, tx: 'E agora? O que vem por aí? 🤔'},
            {t:8, tx: 'Obrigado por acompanhar! 🙌'}
          ],
          efeito: 'suave'
        },
        resumo: {
          corFundo: 'rgba(139,92,246,0.25)',
          corTexto: '#fef08a',
          titulo: '📝 RESUMO RÁPIDO',
          chamadas: [
            {t:0, tx: 'Tudo o que você precisa saber! ⚡'},
            {t:2, tx: 'Ponto principal destacado ✅'},
            {t:4.5, tx: 'Direto ao ponto 🎯'},
            {t:7, tx: 'Salve para consultar depois 📌'}
          ],
          efeito: 'contraste'
        }
      };
      
      const cfg = estilos[estilo] || estilos.reels;
      
      function desenhar() {
        if(tempo >= duracao) {
          gravar.stop();
          return;
        }
        
        video.currentTime = tempo;
        ctx.drawImage(video, 0, 0, L, A);
        
        // ✨ EFEITOS VISUAIS
        const img = ctx.getImageData(0, 0, L, A);
        for(let i = 0; i < img.data.length; i += 4) {
          switch(cfg.efeito) {
            case 'brilhoMaximo':
              img.data[i] = Math.min(255, img.data[i] * 1.3);
              img.data[i+1] = Math.min(255, img.data[i+1] * 1.25);
              img.data[i+2] = Math.min(255, img.data[i+2] * 1.2);
              break;
            case 'corViva':
              img.data[i] = Math.min(255, img.data[i] * 1.1);
              img.data[i+1] = Math.min(255, img.data[i+1] * 1.15);
              img.data[i+2] = Math.min(255, img.data[i+2] * 1.35);
              break;
            case 'suave':
              img.data[i] = Math.min(255, img.data[i] * 1.08);
              img.data[i+1] = Math.min(255, img.data[i+1] * 1.08);
              img.data[i+2] = Math.min(255, img.data[i+2] * 1.08);
              break;
            case 'contraste':
              img.data[i] = img.data[i] < 128 
                ? Math.max(0, img.data[i] * 0.85) 
                : Math.min(255, img.data[i] * 1.25);
              img.data[i+1] = img.data[i+1] < 128 
                ? Math.max(0, img.data[i+1] * 0.85) 
                : Math.min(255, img.data[i+1] * 1.25);
              img.data[i+2] = img.data[i+2] < 128 
                ? Math.max(0, img.data[i+2] * 0.85) 
                : Math.min(255, img.data[i+2] * 1.25);
              break;
          }
        }
        ctx.putImageData(img, 0, 0);
        
        // 🔽 Camada de cor sobreposta
        ctx.fillStyle = cfg.corFundo;
        ctx.fillRect(0, 0, L, A);
        
        // 🏷️ Título fixo no topo
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, L, 90);
        ctx.fillStyle = cfg.corTexto;
        ctx.font = `bold 36px sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(cfg.titulo, L/2, 55);
        
        // 💬 Texto de engajamento que MUDA com o tempo
        const chamadaAtual = cfg.chamadas.find(c => tempo >= c.t && (!cfg.chamadas[cfg.chamadas.indexOf(c)+1] || tempo < cfg.chamadas[cfg.chamadas.indexOf(c)+1].t));
        if(chamadaAtual) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, A - 130, L, 130);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(chamadaAtual.tx, L/2, A - 55);
        }
        
        // ⏱️ Barra de progresso
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(20, A - 20, L - 40, 6);
        ctx.fillStyle = cfg.corTexto;
        ctx.fillRect(20, A - 20, (L - 40) * (tempo/duracao), 6);
        
        ctx.shadowBlur = 0;
        tempo += 1/fps;
        requestAnimationFrame(desenhar);
      }
      
      desenhar();
    };
  });
}

// 📄 Legendas para cada versão
function gerarLegendasParaEstilo(estilo) {
  const d = new Date().toLocaleString('pt-BR');
  const textos = {
    destaque: `WEBVTT

1
00:00:00.000 --> 00:00:01.500
⚡ Destaque — momento de impacto

2
00:00:01.500 --> 00:00:03.000
🤯 Algo incrível está acontecendo

3
00:00:03.000 --> 00:00:04.500
✅ Compartilhe com quem precisa ver

4
00:00:04.500 --> 00:00:05.000
🔥 Siga para mais conteúdo novo

Gerado em: ${d}`,

    reels: `WEBVTT

1
00:00:00.000 --> 00:00:02.000
🎬 Você não vai querer perder isso!

2
00:00:02.000 --> 00:00:04.000
⭐ Salve para assistir depois

3
00:00:04.000 --> 00:00:06.000
❤️ Deixe seu like e apoie

4
00:00:06.000 --> 00:00:07.000
💬 Comenta o que achou!

Gerado em: ${d}`,

    historia: `WEBVTT

1
00:00:00.000 --> 00:00:02.500
🎬 O começo de uma história...

2
00:00:02.500 --> 00:00:05.000
✨ Algo especial acontece aqui

3
00:00:05.000 --> 00:00:08.000
🤔 O que você acha que vem por aí?

4
00:00:08.000 --> 00:00:10.000
🙌 Obrigado por acompanhar!

Gerado em: ${d}`,

    resumo: `WEBVTT

1
00:00:00.000 --> 00:00:02.000
⚡ Tudo direto ao ponto

2
00:00:02.000 --> 00:00:04.500
✅ Ponto principal destacado

3
00:00:04.500 --> 00:00:07.000
🎯 Resumo prático e rápido

4
00:00:07.000 --> 00:00:08.000
📌 Salve para consultar depois

Gerado em: ${d}`
  };
  return new Blob([textos[estilo] || textos.reels], { type: 'text/vtt' });
}

// ========== 🚀 PROCESSAMENTO PRINCIPAL ==========
document.getElementById('iniciar-processamento')?.addEventListener('click', async () => {
  if(arquivosCarregados.length === 0) { 
    alert('⚠️ Envie ou grave um vídeo primeiro!'); 
    return; 
  }

  const barra = document.getElementById('barra-principal');
  const etapa = document.getElementById('etapa-atual');
  const log = document.getElementById('log-ia');
  
  if(barra) barra.style.width = '0%';
  if(log) log.innerHTML = '';

  const videoBase = arquivosCarregados[0].blob;
  arquivosProntos = [];

  // 🔄 GERA 4 VERSÕES DIFERENTES — cada uma com seu estilo
  const versoes = [
    { id: 'destaque', nome: '1_DESTAQUE_IMPACTO', desc: '⚡ 5s — Cores fortes, chamada de atenção, para parar o scroll' },
    { id: 'reels', nome: '2_REELS_PRONTO_PARA_POSTAR', desc: '📱 7s — Estilo Instagram/TikTok, engajamento direto' },
    { id: 'historia', nome: '3_HISTORIA_COMPLETA', desc: '📖 10s — Narrativa completa, prende o espectador do início ao fim' },
    { id: 'resumo', nome: '4_RESUMO_RAPIDO', desc: '📝 8s — Direto ao ponto, destaque das informações principais' }
  ];

  for(let i = 0; i < versoes.length; i++) {
    const v = versoes[i];
    if(etapa) etapa.textContent = `🎬 Gerando ${v.nome}...`;
    if(barra) barra.style.width = ((i+1)/versoes.length*100) + '%';
    if(log) log.innerHTML += `<div>✅ ${v.desc}</div>`;
    
    const videoEditado = await criarVersaoEditada(videoBase, v.id);
    arquivosProntos.push({
      nome: nomeArq('_Versoes_Engajamento', v.nome, 'webm'),
      blob: videoEditado,
      desc: v.desc
    });
    
    // Legenda de cada versão
    arquivosProntos.push({
      nome: nomeArq('_Versoes_Engajamento', v.nome + '_LEGENDA', 'vtt'),
      blob: gerarLegendasParaEstilo(v.id),
      desc: '📄 Legendas sincronizadas para essa versão'
    });
  }

  // ✅ EXIBE TUDO NA TELA
  const resultados = document.getElementById('resultados-finais');
  if(resultados) {
    resultados.classList.remove('oculto');
    resultados.innerHTML = `
      <h3 style="color:#10b981; margin:0 0 1rem 0; font-size:1.2rem;">
        ✅ ${versoes.length} Versões de Engajamento Prontas!
      </h3>
      <p style="margin:0 0 1rem 0; color:#94a3b8;">
        📁 Pasta: <strong>${nomePastaSalvamento}/</strong><br>
        ✅ Cada arquivo é <strong>ÚNICO e EDITADO</strong> — com corte curto, efeito visual e texto de engajamento!
      </p>
      <div style="background:#1e293b; padding:1rem; border-radius:10px; margin-bottom:1.5rem;">
        ${arquivosProntos.map((arq, i) => `
          <div style="padding:0.6rem 0; border-bottom:${i < arquivosProntos.length-1 ? '1px solid #334155' : 'none'};">
            <p style="margin:0; color:#e2e8f0; font-weight:bold;">📄 ${arq.nome}</p>
            <p style="margin:0.3rem 0 0 0; font-size:0.85rem; color:#10b981;">${arq.desc}</p>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; gap:1rem; flex-wrap:wrap;">
        <button id="btn-todos" style="padding:0.9rem 1.8rem; background:linear-gradient(90deg,#6366f1,#ec4899); color:white; border:none; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer;">
          📦 Baixar Todos (${arquivosProntos.length} arquivos)
        </button>
        <button id="btn-um" style="padding:0.9rem 1.8rem; background:#374151; color:white; border:none; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer;">
          📄 Baixar um por um
        </button>
      </div>
    `;
    
    document.getElementById('btn-todos')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 350));
      alert(`✅ Baixando ${arquivosProntos.length} arquivos!\n\n⚡ 4 versões diferentes\n🎬 Cada uma com corte curto\n✨ Efeito visual exclusivo\n💬 Texto de engajamento\n📄 Legendas para cada uma\n\nAbra e veja a diferença entre elas!`);
    });
    
    document.getElementById('btn-um')?.addEventListener('click', () => {
      arquivosProntos.forEach((arq, i) => setTimeout(() => baixar(arq.blob, arq.nome), i * 350));
      alert(`✅ Baixando ${arquivosProntos.length} arquivos!`);
    });
  }
});

console.log('✅ SISTEMA PRONTO — 4 VERSÕES DE ENGAJAMENTO GERADAS!');
console.log('✅ CORTES CURTOS | ✅ EFEITOS DIFERENTES | ✅ TEXTO DE CHAMADA | ✅ LEGENDAS');