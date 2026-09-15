// Fonte única de verdade da experiência de entrada (vídeo-manifesto).
// Alterar MANIFESTO_VERSION invalida a flag de "já assisti" de todos os visitantes.
export const MANIFESTO_VERSION = 'v1';
export const MANIFESTO_STORAGE_KEY = `lime_manifesto_seen_${MANIFESTO_VERSION}`;

// Arquivos servidos a partir de /public. Substituir pelos definitivos mantendo os nomes.
export const MANIFESTO_SOURCES = {
  webm: '/videos/manifesto-lime.webm',
  mp4: '/videos/manifesto-lime.mp4',
  poster: '/videos/manifesto-poster.svg',
} as const;

export type ManifestoState = 'intro' | 'playing' | 'transitioning' | 'completed';

// Classe aplicada em <html> enquanto o site precisa ficar travado atrás do manifesto.
export const MANIFESTO_ACTIVE_CLASS = 'manifesto-active';
// Disparado em document no instante em que a tela está coberta e a home pode ser revelada.
export const MANIFESTO_REVEAL_EVENT = 'lime:manifesto-reveal';
// Disparado em document quando a camada foi removida e o scroll liberado.
export const MANIFESTO_COMPLETE_EVENT = 'lime:manifesto-complete';

const STATES: readonly ManifestoState[] = ['intro', 'playing', 'transitioning', 'completed'];

export function getManifestoState(): ManifestoState | undefined {
  const value = document.documentElement.dataset.manifesto;
  return STATES.find((state) => state === value);
}

export function setManifestoState(state: ManifestoState) {
  document.documentElement.dataset.manifesto = state;
}

// A camada ainda existe na tela (intro, vídeo ou transição em andamento).
export function isManifestoActive() {
  const state = getManifestoState();
  return state !== undefined && state !== 'completed';
}

export function markManifestoRevealed() {
  document.documentElement.dataset.manifestoRevealed = 'true';
}

// A home ainda não pode animar: a revelação (lime:manifesto-reveal) ainda não aconteceu.
export function isManifestoGating() {
  if (document.documentElement.dataset.manifestoRevealed === 'true') return false;
  const state = getManifestoState();
  return state === 'intro' || state === 'playing' || state === 'transitioning';
}

export function hasSeenManifesto() {
  try {
    return window.localStorage.getItem(MANIFESTO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markManifestoSeen() {
  try {
    window.localStorage.setItem(MANIFESTO_STORAGE_KEY, 'true');
  } catch {
    // Armazenamento indisponível (modo privado, cota, políticas): a experiência segue sem persistir.
  }
}
