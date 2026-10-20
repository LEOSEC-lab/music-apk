// Referências do DOM
const audioPlayer = document.getElementById('audioPlayer');
const btnPlay = document.getElementById('btnPlay');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const fileInput = document.getElementById('fileInput');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const albumCover = document.getElementById('albumCover');
const btnInstalar = document.getElementById('btnInstalar');

let playlist = [];
let currentTrackIndex = 0;

// Carregar arquivos de áudio selecionados pelo usuário
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    playlist = files;
    currentTrackIndex = 0;
    loadTrack(currentTrackIndex);
    playTrack();
  }
});

// Carregar música na playlist
function loadTrack(index) {
  if (playlist[index]) {
    const file = playlist[index];
    audioPlayer.src = URL.createObjectURL(file);
    songTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
    artistName.textContent = `Música ${index + 1} de ${playlist.length}`;
  }
}

// Reproduzir áudio
function playTrack() {
  if (!audioPlayer.src) return;
  audioPlayer.play();
  btnPlay.textContent = '⏸️';
  albumCover.classList.add('playing');
}

// Pausar áudio
function pauseTrack() {
  audioPlayer.pause();
  btnPlay.textContent = '▶️';
  albumCover.classList.remove('playing');
}

// Alternar Play/Pause
btnPlay.addEventListener('click', () => {
  if (audioPlayer.paused && audioPlayer.src) {
    playTrack();
  } else {
    pauseTrack();
  }
});

// Avançar e Voltar música
btnNext.addEventListener('click', () => {
  if (playlist.length > 0) {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
  }
});

btnPrev.addEventListener('click', () => {
  if (playlist.length > 0) {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
  }
});

// Atualizar tempo e barra de progresso
audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    currentTimeEl.textContent = formatTime(currentTime);
    durationTimeEl.textContent = formatTime(duration);
  }
});

// Controlar o tempo ao clicar na barra
progressContainer.addEventListener('click', (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
  }
});

// Tocar a próxima música quando a atual terminar
audioPlayer.addEventListener('ended', () => {
  if (playlist.length > 0) {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
  }
});

// Formatação de minutos/segundos
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- LÓGICA DO PWA E INSTALAÇÃO ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registrado com sucesso!', reg))
      .catch((err) => console.error('Falha ao registrar Service Worker:', err));
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstalar.style.display = 'block';
});

btnInstalar.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      btnInstalar.style.display = 'none';
    }
    deferredPrompt = null;
  }
});