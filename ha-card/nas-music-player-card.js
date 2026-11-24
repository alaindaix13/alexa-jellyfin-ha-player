/**
 * NAS Music Player Card for Home Assistant (v1.1.0)
 * - Sleek dark UI inspired by "Gestion Playlists MP3"
 * - Speaker selection, volume slider & transport controls
 * - Robust album & playlist casting via Alexa skill
 * - Category browsing by Jellyfin Library Parent IDs (Compilations, International, Français, Classique)
 * - Live Radios tab
 * - Pagination & smooth scrolling
 * - "En lecture" page with synced .LRC lyrics & playback queue tracklist
 * - Auto-fallback & filtering to ensure 100% cover art and full tracklist display
 */

const JELLYFIN_URL = "https://jelly.alaindaix.fr";
const JELLYFIN_USER = "1b534563ad8e4886abe14ab4a29ed6bc";
const JELLYFIN_TOKEN = "a06ee992908547feb6d284458eb11493";
const AUTH_HEADER = `MediaBrowser Client="Alexa", Device="Echo", DeviceId="test", Version="0.3.1", Token="${JELLYFIN_TOKEN}"`;

const DEFAULT_SPEAKERS = [
  { id: "media_player.chambre", name: "Chambre (2 Echos)", zone: "Chambre", isAlexa: true, spotifyDevice: "Chambre", icon: "🛏️" },
  { id: "media_player.echo_chambre", name: "Echo Chambre", zone: "Chambre", isAlexa: true, spotifyDevice: "Echo Chambre", icon: "🔊" },
  { id: "media_player.echo_salle_a_manger", name: "Echo Salle à manger", zone: "Salle à manger", isAlexa: true, spotifyDevice: "Salle à manger", icon: "🍽️" },
  { id: "media_player.echo_salle_de_bain", name: "Echo Salle de Bain", zone: "Salle de Bain", isAlexa: true, spotifyDevice: "Echo Salle de bain", icon: "🚿" },
  { id: "media_player.echo_salle_de_bain_bas", name: "Echo Salle de Bain Bas", zone: "Salle de Bain Bas", isAlexa: true, spotifyDevice: null, icon: "🚿" },
  { id: "media_player.echo_dot_blanquet", name: "Salon", zone: "Salon", isAlexa: true, spotifyDevice: "Salon", icon: "🛋️" },
  { id: "media_player.sonoro_cuisine", name: "Sonoro Cuisine", zone: "Cuisine", isAlexa: false, isDlna: true, spotifyDevice: null, icon: "📻" },
  { id: "media_player.sonorostream_3058907873c4", name: "Sonoro Cuisine (DLNA direct)", zone: "Cuisine", isAlexa: false, isDlna: true, spotifyDevice: null, icon: "📻" },
  { id: "media_player.systeme_audio", name: "Système Audio (Cet appareil)", zone: "Système Audio", isLocalSystem: true, isAlexa: false, spotifyDevice: "Système Audio", icon: "💻" },
  { id: "media_player.partout", name: "Partout (Multi-room)", zone: "Partout", isAlexa: true, spotifyDevice: "partout", icon: "🌐" }
];

const FAVORITES = [
  { id: "68ac984f4dc4024af5eec619d5a6846b", name: "A Kind of Magic", artist: "Queen", cmd: "demande à mon nas de jouer l'album A Kind of Magic de Queen" },
  { id: "bc5b72b67aaacd5145cc1220344bbe65", name: "A Night at the Opera", artist: "Queen", cmd: "demande à mon nas de jouer l'album A Night at the Opera de Queen" },
  { id: "37c58af71c4ea15fa430691537fb17f3", name: "Dark Side Of The Moon", artist: "Pink Floyd", cmd: "demande à mon nas de jouer l'album Dark Side Of The Moon de Pink Floyd" },
  { id: "4b1bf21d8e029e0560cf1e3eb683775a", name: "Breakfast in America", artist: "Supertramp", cmd: "demande à mon nas de jouer l'album Breakfast in America de Supertramp" },
  { id: "2babc8d1d4483db2a350e363bccd0d47", name: "Blurryface", artist: "Twenty One Pilots", cmd: "demande à mon nas de jouer l'album Blurryface de Twenty One Pilots" },
  { id: "e693c72c3c62cb60e589bf8a0fd0f7a4", name: "Crime Of The Century", artist: "Supertramp", cmd: "demande à mon nas de jouer l'album Crime Of The Century de Supertramp" },
  { id: "6e12e0c6a47e303feb3106b23bbe9189", name: "25", artist: "Adele", cmd: "demande à mon nas de jouer l'album 25 de Adele" },
  { id: "0c83cad35385a496b533f7f86ccdb2e5", name: "Deezer Hits 2018", artist: "Compilations", cmd: "demande à mon nas de jouer l'album Deezer Hits 2018" }
];

const CATEGORIES = {
  favorites: { id: "favorites", label: "⭐ Favoris", type: "favorites" },
  compilations: {
    id: "compilations",
    label: "📁 Compilations",
    type: "jellyfin",
    parentId: "91dee17855cfbed5eaab9fd7aaed6566",
    itemTypes: "MusicAlbum"
  },
  international: {
    id: "international",
    label: "🌍 International",
    type: "jellyfin",
    parentId: "3ba5494bda5a2b42d7cb341bc2cb8f58",
    itemTypes: "MusicAlbum"
  },
  variete: {
    id: "variete",
    label: "🇫🇷 Français",
    type: "jellyfin",
    parentId: "7b119c236676d5b7fff4206fee589f8b",
    itemTypes: "MusicAlbum"
  },
  classique: {
    id: "classique",
    label: "🎻 Classique",
    type: "jellyfin",
    parentId: "f59fccdb979c9f8659af94f76dad3e85",
    itemTypes: "MusicAlbum"
  },
  radios: { id: "radios", label: "📻 Radios", type: "radios" },
  spotify: { id: "spotify", label: "🟢 Spotify", type: "spotify" },
  nowplaying: { id: "nowplaying", label: "▶ En lecture", type: "nowplaying" }
};

const DEFAULT_RADIOS = [
  { name: "RTL2", label: "RTL2", icon: "https://s2.googleusercontent.com/s2/favicons?domain=rtl2.fr&sz=256", streamUrl: "https://icecast.rtl2.fr/rtl2-1-44-128?listen=web", provider: "audioplayer" },
  { name: "Fun Radio", label: "Fun Radio", icon: "https://s2.googleusercontent.com/s2/favicons?domain=funradio.fr&sz=256", streamUrl: "https://icecast.funradio.fr/fun-1-44-128?listen=web", provider: "audioplayer" },
  { name: "NRJ", label: "NRJ", icon: "https://s2.googleusercontent.com/s2/favicons?domain=nrj.fr&sz=256", streamUrl: "https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3", provider: "audioplayer" },
  { name: "RFM Night Fever", label: "RFM Night Fever", icon: "https://cdn.rfm.fr/upload/players/6ab56be0e9d115.16116477.png", streamUrl: "https://rfm.lmn.fm/rfm-wr2.mp3", provider: "tunein" },
  { name: "Nostalgie", label: "Nostalgie", icon: "https://s2.googleusercontent.com/s2/favicons?domain=nostalgie.fr&sz=256", streamUrl: "https://streaming.nrjaudio.fm/oug7girb92oc?origine=fluxradios", provider: "audioplayer" },
  { name: "RMC", label: "RMC", icon: "https://s2.googleusercontent.com/s2/favicons?domain=rmc.bfmtv.com&sz=256", streamUrl: "https://audio.bfmtv.com/rmcradio_128.mp3", provider: "audioplayer" },
  { name: "France Inter", label: "France Inter", icon: "https://s2.googleusercontent.com/s2/favicons?domain=franceinter.fr&sz=256", streamUrl: "https://icecast.radiofrance.fr/franceinter-midfi.mp3", provider: "audioplayer" },
  { name: "Europe 2", label: "Europe 2", icon: "https://s2.googleusercontent.com/s2/favicons?domain=europe2.fr&sz=256", streamUrl: "https://europe2.lmn.fm/europe2.mp3", provider: "audioplayer" }
];

function normalizeLookalikes(str) {
  if (!str) return "";
  return str
    .replace(/\u041c/g, "M")
    .replace(/\u043c/g, "m")
    .replace(/\u0410/g, "A")
    .replace(/\u0430/g, "a")
    .replace(/\u0412/g, "B")
    .replace(/\u0415/g, "E")
    .replace(/\u0435/g, "e")
    .replace(/\u041e/g, "O")
    .replace(/\u043e/g, "o")
    .replace(/\u0420/g, "P")
    .replace(/\u0440/g, "p")
    .replace(/\u0421/g, "C")
    .replace(/\u0441/g, "c")
    .replace(/\u0422/g, "T")
    .replace(/\u0442/g, "t")
    .replace(/\u0443/g, "y")
    .replace(/\u0445/g, "x");
}

function buildVoiceCmd(item) {
  let title = (item.Name || item.name || "").trim();
  let artist = (item.AlbumArtist || item.artist || (item.Artists && item.Artists[0]) || "").trim();

  // Normalize Cyrillic lookalikes
  title = normalizeLookalikes(title);
  artist = normalizeLookalikes(artist);

  // If artist has multiple artists (e.g. "Miley Cyrus; Dua Lipa" or "Miley Cyrus, Dua Lipa" or "Miley Cyrus feat..."), keep only primary artist
  if (artist) {
    artist = artist.split(/[,;]|\bfeat\b|\bft\b/i)[0].trim();
  }

  // If "Artist - Album", extract both
  if (title.includes(" - ")) {
    const parts = title.split(" - ");
    if (parts.length >= 2) {
      if (!artist || /various|compilation|plusieurs/i.test(artist)) {
        artist = parts[0].trim();
      }
      title = parts.slice(1).join(" - ").trim();
    }
  }

  // Remove year prefix like "1975 - " or "2016 - "
  title = title.replace(/^\d{4}\s*-\s*/, "").trim();

  // Clean version suffixes in parentheses/brackets e.g. "(Deluxe Version)", "[Deluxe Edition]", "(Remastered 2011)"
  title = title.replace(/\s*[\(\[](?:deluxe|version\s+deluxe|edition\s+deluxe|remaster(?:ed)?|bonus|expanded|anniversary|collector).*?[\)\]]/gi, "").trim();

  // Clean brackets, colons, quotes and special chars
  title = title.replace(/[\[\]()":]/g, " ").replace(/\s+/g, " ").trim();
  artist = artist.replace(/[\[\]()":]/g, " ").replace(/\s+/g, " ").trim();

  // Clean ampersands so Alexa text/speech and SSML does not fail
  title = title.replace(/&/g, " et ").replace(/\s+/g, " ").trim();
  artist = artist.replace(/&/g, " et ").replace(/\s+/g, " ").trim();

  if (item.Type === "Playlist") {
    return `demande à mon nas de jouer la playlist ${title}`;
  }

  const isVarious = !artist || /various|compilation|plusieurs/i.test(artist);
  if (isVarious) {
    return `demande à mon nas de jouer l'album ${title}`;
  }
  return `demande à mon nas de jouer l'album ${title} de ${artist}`;
}

class NasMusicCard extends HTMLElement {
  _getDashboardUrlPath() {
    const path = window.location.pathname || "";
    const parts = path.split("/").filter(p => !!p);
    if (parts.length > 0 && parts[0] !== "lovelace") {
      return parts[0];
    }
    return null;
  }

  async syncRadiosToHA(radiosList) {
    if (!this._hass) return;
    try {
      const urlPath = this._getDashboardUrlPath();
      const config = await this._hass.callWS({
        type: "lovelace/config",
        url_path: urlPath
      });

      if (!config || !Array.isArray(config.views)) return;

      const cleanRadios = Array.isArray(radiosList) && radiosList.length > 0
        ? radiosList.map(r => ({
            name: r.name || "",
            label: r.label || r.name || "",
            icon: r.icon || "",
            streamUrl: r.streamUrl || "",
            provider: r.provider || ((r.name || "").toLowerCase().includes("rfm") || (r.name || "").toLowerCase().includes("jazz") ? "tunein" : "audioplayer")
          }))
        : null;

      let modified = false;
      const updateCard = (c) => {
        if (!c) return;
        if (c.type === "custom:nas-music-player-card" || c.type === "custom:nas-music-card") {
          if (cleanRadios && cleanRadios.length > 0) {
            c.radios = cleanRadios;
          } else {
            delete c.radios;
          }
          modified = true;
        }
        if (Array.isArray(c.cards)) {
          c.cards.forEach(updateCard);
        }
      };

      config.views.forEach(view => {
        if (Array.isArray(view.cards)) view.cards.forEach(updateCard);
        if (Array.isArray(view.sections)) {
          view.sections.forEach(s => {
            if (Array.isArray(s.cards)) s.cards.forEach(updateCard);
          });
        }
      });

      if (modified) {
        await this._hass.callWS({
          type: "lovelace/config/save",
          url_path: urlPath,
          config: config
        });
        if (this._config) {
          if (cleanRadios && cleanRadios.length > 0) {
            this._config.radios = cleanRadios;
          } else {
            delete this._config.radios;
          }
        }
        console.log("NAS Music: Radios synchronisées avec la configuration centrale Home Assistant");
        this.showToast("☁️ Radios synchronisées sur tous vos appareils !");
      }
    } catch (err) {
      console.warn("NAS Music: Impossible de sauvegarder dans Lovelace config:", err);
    }
  }

  async checkAndAutoSyncRadios() {
    if (this._hasCheckedAutoSync) return;
    this._hasCheckedAutoSync = true;
    try {
      const stored = localStorage.getItem("nas_music_radios");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Si la configuration serveur n'a pas encore de radios personnalisées, on synchronise automatiquement
          if (!Array.isArray(this._config?.radios) || this._config.radios.length === 0) {
            console.log("NAS Music: Radios locales détectées, synchronisation automatique vers Home Assistant...");
            await this.syncRadiosToHA(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("NAS Music: Erreur AutoSync radios:", e);
    }
  }

  getRadios() {
    let list = DEFAULT_RADIOS;
    if (Array.isArray(this._config?.radios) && this._config.radios.length > 0) {
      list = this._config.radios;
    } else {
      try {
        const stored = localStorage.getItem("nas_music_radios");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        }
      } catch (e) {
        console.warn("Could not parse stored radios", e);
      }
    }
    return list.map((r, i) => {
      const defaultProvider = (r.name || "").toLowerCase().includes("rfm") || (r.name || "").toLowerCase().includes("jazz") ? "tunein" : "audioplayer";
      return {
        ...r,
        provider: r.provider || defaultProvider,
        _id: r._id || `radio_${i}_${r.name || i}`
      };
    });
  }

  async saveCustomRadios(radiosList) {
    try {
      localStorage.setItem("nas_music_radios", JSON.stringify(radiosList));
      this.showToast("✅ Radios enregistrées !");
    } catch (e) {
      console.error("Failed to save radios", e);
      this.showToast("❌ Erreur lors de l'enregistrement");
    }
    this.render();
    await this.syncRadiosToHA(radiosList);
  }

  async resetDefaultRadios() {
    try {
      localStorage.removeItem("nas_music_radios");
      this.showToast("🔄 Radios par défaut restaurées !");
    } catch (e) {
      console.error(e);
    }
    if (this._config) {
      delete this._config.radios;
    }
    this.render();
    await this.syncRadiosToHA(null);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selectedSpeaker = localStorage.getItem("nas_music_speaker") || this.getSpeakers()[0].id;
    if (!DEFAULT_SPEAKERS.some(s => s.id === this.selectedSpeaker)) {
      this.selectedSpeaker = DEFAULT_SPEAKERS[0].id;
    }
    this.currentView = "favorites";
    this.previousView = "favorites";
    this.activeCategory = "favorites";
    this.searchResults = [];
    this.selectedAlbum = null;
    this.albumTracks = [];
    this.loading = false;
    this.searchQuery = "";
    this._searchDebounce = null;
    this.currentPage = 0;
    this.pageSize = 24;
    this.totalItems = 0;

    // Now playing state
    this.isShuffle = false;
    this.nowPlayingTab = "lyrics"; // "lyrics" or "queue"
    this.nowPlayingQueue = [];
    this.nowPlayingCurrentIndex = 0;
    this.currentLyrics = [];
    this.loadingLyrics = false;
    this.isPlayingLocal = false;
    this._localPlayStart = 0;
    this._localPlayOffset = 0;
    this._lastPlayedRadio = null;
    try {
      const savedRadio = localStorage.getItem("nas_music_last_radio");
      if (savedRadio) this._lastPlayedRadio = JSON.parse(savedRadio);
    } catch(e) {}
    this._lastPlayedTrack = null;
    this.currentNowPlaying = null;
    try {
      const storedMeta = localStorage.getItem("nas_music_active_meta");
      if (storedMeta) {
        const parsed = JSON.parse(storedMeta);
        if (parsed?.title) {
          this.currentNowPlaying = parsed;
          this.isPlayingLocal = true;
        }
      }
    } catch(e) {}
    // Spotify state & subtabs
    this.spotifySubTab = "playlists"; // "playlists", "albums", "artists", "top"
    this.spotifyPlaylists = [];
    this.spotifyAlbums = [];
    this.spotifyArtists = [];
    this.spotifyTopTracks = [];
    // Radio manager state
    this.showRadioManager = false;
    this.radioFormOpen = false;
    this.editingRadioId = null;
    this._lastTrackTitle = "";
    // Speaker manager state
    this.showSpeakerManager = false;
    this.selectedSpeakersMulti = new Set();
    try {
      const savedMulti = localStorage.getItem("nas_music_multi_speakers");
      if (savedMulti) {
        const arr = JSON.parse(savedMulti);
        if (Array.isArray(arr) && arr.length > 1) {
          this.selectedSpeakersMulti = new Set(arr);
        }
      }
    } catch(e) {}
    // Lyrics & duration sync offset (in seconds)
    this.syncOffset = parseFloat(localStorage.getItem("nas_music_sync_offset") || "0") || 0;
  }

  getSpeakers() {
    if (Array.isArray(this._config?.speakers) && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    return DEFAULT_SPEAKERS;
  }
  get jellyfinUrl() {
    return (this._config?.jellyfin_url || JELLYFIN_URL).replace(/\/+$/, "");
  }
  get jellyfinUser() {
    return this._config?.jellyfin_user || JELLYFIN_USER;
  }
  get jellyfinToken() {
    return this._config?.jellyfin_token || JELLYFIN_TOKEN;
  }
  get authHeader() {
    const token = this.jellyfinToken;
    return `MediaBrowser Client="Alexa", Device="Echo", DeviceId="test", Version="0.3.1", Token="${token}"`;
  }
  get spotifyPlayer() {
    return this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
  }
  get radioProvider() {
    return this._config?.radio_provider || "tunein";
  }


  set hass(hass) {
    this._hass = hass;
    const nasSensor = hass.states?.["sensor.nas_music_now_playing"];
    if (this.isAlexaSpeaker() && nasSensor?.attributes?.track_id && nasSensor.attributes.track_id !== this._loadedTrackId) {
      this.loadTrackDetailsAndQueue(nasSensor.attributes.track_id);
    }

    // Détection automatique : Si Spotify commence à jouer alors que le NAS ou le Système Audio tournait
    const spState = hass.states?.[this.spotifyPlayer];
    const speaker = hass.states?.[this.selectedSpeaker];
    const isSpotifyPlaying = (spState?.state === "playing") || (speaker?.state === "playing" && speaker?.attributes?.app_name === "Spotify");
    if (isSpotifyPlaying) {
      if (window._nasMusicLocalAudio && !window._nasMusicLocalAudio.paused) {
        this.stopNasPlayback();
      } else if (this.isPlayingLocal && (!nasSensor || nasSensor.state !== "playing")) {
        this.isPlayingLocal = false;
      }
    }

    this.updateSpeakerInfo();
    if (this.currentView === "nowplaying") {
      this.updateNowPlayingUI();
    }
    if (!this._hasCheckedAutoSync && this._hass) {
      this._hasCheckedAutoSync = true;
      this.checkAndAutoSyncRadios();
    }
  }

  connectedCallback() {
    if (!this._initialLoaded) {
      this._initialLoaded = true;
      this.loadCategory("favorites", 0);
    }
    if (!this._playbackTimer) {
      this._playbackTimer = setInterval(() => this.tickPlayback(), 1000);
    }
    if (this.isAlexaSpeaker()) {
      this.refreshNowPlayingFromSensor();
    }

    this._onLocalAudioEnded = () => {
      if (this.isLocalSystemSpeaker()) {
        this.controlNextTrack();
      }
    };
    window.addEventListener("nas-music-local-audio-ended", this._onLocalAudioEnded);

    this._onLocalAudioState = () => {
      if (this.isLocalSystemSpeaker()) {
        this.updateNowPlayingUI();
      }
    };
    window.addEventListener("nas-music-local-audio-state", this._onLocalAudioState);

    this._onRemoteNext = () => {
      this.controlNextTrack();
    };
    window.addEventListener("nas-music-remote-next", this._onRemoteNext);

    this._onRemotePrev = () => {
      this.controlPreviousTrack();
    };
    window.addEventListener("nas-music-remote-prev", this._onRemotePrev);

    this._onSpeakerChanged = (e) => {
      if (e.detail?.speaker && e.detail.speaker !== this.selectedSpeaker) {
        this.selectedSpeaker = e.detail.speaker;
        localStorage.setItem("nas_music_speaker", this.selectedSpeaker);
        this.render();
      }
    };
    window.addEventListener("nas-music-speaker-changed", this._onSpeakerChanged);
  }

  disconnectedCallback() {
    if (this._playbackTimer) {
      clearInterval(this._playbackTimer);
      this._playbackTimer = null;
    }
    window.removeEventListener("nas-music-local-audio-ended", this._onLocalAudioEnded);
    window.removeEventListener("nas-music-local-audio-state", this._onLocalAudioState);
    window.removeEventListener("nas-music-remote-next", this._onRemoteNext);
    window.removeEventListener("nas-music-remote-prev", this._onRemotePrev);
    window.removeEventListener("nas-music-speaker-changed", this._onSpeakerChanged);
  }

  tickPlayback() {
    if (!this._hass) return;
    const info = this.getNowPlayingInfo();
    if (!info.isPlaying) return;

    // Si on est sur une enceinte Alexa et qu'une erreur de skill est détectée, arrêter immédiatement la lecture locale
    if (this.isAlexaSpeaker() && this.isPlayingLocal) {
      const sp = this._hass.states?.[this.selectedSpeaker];
      if (sp) {
        const resp = (sp.attributes?.last_called_response || "").toLowerCase();
        if (resp && (resp.includes("pas fourni de réponse") || resp.includes("problème") || resp.includes("erreur"))) {
          this.isPlayingLocal = false;
          this._localPlayStart = 0;
          this.updateNowPlayingUI();
          this.render();
          return;
        }
      }
    }

    const curPos = this.getCurrentPlaybackPosition();
    const duration = info.duration || 0;

    // Si le morceau est terminé et qu'on joue sur une enceinte DLNA (Sonoro) ou localement (Système Audio), passer au morceau suivant
    // Sur Alexa, la skill gère elle-même l'enchaînement des pistes de l'album sans coupure
    if (this.isLocalSystemSpeaker() && !this.isSpotifyActive()) {
      const audio = this.getLocalAudio();
      const dur = duration > 0 ? duration : (audio.duration || 0);
      if (dur > 0 && !audio.paused && audio.currentTime >= (dur - 0.4) && !audio._endedHandled) {
        audio._endedHandled = true;
        this.controlNextTrack();
        return;
      }
    } else if (this.isDlnaSpeaker()) {
      if (duration > 0 && curPos >= duration && this.isPlayingLocal) {
        if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
          const nextIdx = (this.nowPlayingCurrentIndex || 0) + 1;
          if (nextIdx < this.nowPlayingQueue.length) {
            const nextTrack = this.nowPlayingQueue[nextIdx];
            const albumObj = this.selectedAlbum || {
              Name: this.currentNowPlaying?.album || "",
              AlbumArtist: this.currentNowPlaying?.artist || ""
            };
            this.castTrack(nextTrack, albumObj);
            return;
          }
        }
      }
    } else if (this.isAlexaSpeaker()) {
      if (duration > 0 && curPos >= (duration + 1) && this.isPlayingLocal && this.nowPlayingQueue?.length > 0) {
        const nextIdx = (this.nowPlayingCurrentIndex || 0) + 1;
        if (nextIdx < this.nowPlayingQueue.length) {
          const nextTrack = this.nowPlayingQueue[nextIdx];
          this.nowPlayingCurrentIndex = nextIdx;
          let trackArtist = (Array.isArray(nextTrack.Artists) ? (nextTrack.Artists[0]?.Name || nextTrack.Artists[0]) : null)
            || (nextTrack.ArtistItems && nextTrack.ArtistItems.length > 0 ? nextTrack.ArtistItems[0].Name : null)
            || nextTrack.AlbumArtist
            || "";
          this.currentNowPlaying = {
            title: nextTrack.Name || nextTrack.name,
            artist: trackArtist,
            album: this.selectedAlbum?.Name || this.currentNowPlaying?.album || "",
            cover: `${this.jellyfinUrl}/Items/${nextTrack.AlbumId || this.selectedAlbum?.Id || nextTrack.Id}/Images/Primary?maxWidth=300`,
            trackId: nextTrack.Id || nextTrack.id,
            duration: nextTrack.RunTimeTicks ? Math.floor(nextTrack.RunTimeTicks / 10000000) : 0
          };
          this._localPlayStart = Date.now();
          this._localPlayOffset = 0;
          this._loadedTrackId = nextTrack.Id || nextTrack.id;
          this._lastTrackTitle = nextTrack.Name || nextTrack.name;
          try {
            localStorage.setItem("nas_music_active_meta", JSON.stringify(this.currentNowPlaying));
          } catch(e) {}
          this.loadLyricsForCurrentTrack(this.currentNowPlaying.title, this.currentNowPlaying.artist, this.currentNowPlaying.trackId);
          this.updateNowPlayingUI();
          this.renderNowPlayingTab();
        }
      }
    }

    if (this.currentView === "nowplaying") {
      const root = this.shadowRoot;
      if (root) {
        const timeCur = root.getElementById("np-time-current");
        const slider = root.getElementById("np-progress-slider");
        if (timeCur) timeCur.textContent = this.formatSeconds(curPos);
        if (slider && root.activeElement !== slider) {
          slider.value = curPos;
          if (duration > 0) slider.max = duration;
        }
      }
      if (this.nowPlayingTab === "lyrics" && this.currentLyrics && this.currentLyrics.length > 0) {
        this.highlightActiveLyric(curPos);
      }
    }
  }

  setConfig(config) {
    this._config = config || {};
    if (this._config.default_speaker && !localStorage.getItem("nas_music_speaker")) {
      this.selectedSpeaker = this._config.default_speaker;
    }
    this.render();
    if (!this._initialLoaded) {
      this._initialLoaded = true;
      this.loadCategory("favorites", 0);
    }
  }

  getCardSize() {
    return 6;
  }

  updateSpeakerInfo() {
    if (!this.shadowRoot || !this._hass) return;
    const speaker = this._hass.states[this.selectedSpeaker];
    const info = this.getNowPlayingInfo();
    const nameEl = this.shadowRoot.getElementById("current-speaker-status");
    const volSlider = this.shadowRoot.getElementById("speaker-vol-slider");
    const playBtn = this.shadowRoot.getElementById("btn-speaker-playpause");
    const nowPlayingPill = this.shadowRoot.querySelector('.tab-pill[data-cat="nowplaying"]');

    if (this.isLocalSystemSpeaker()) {
      const audio = this.getLocalAudio();
      const vol = Math.round((audio.volume !== undefined ? audio.volume : 0.8) * 100);
      const spName = this.getSpeakers().find(s => s.id === this.selectedSpeaker)?.name || "Système Audio";
      if (nameEl) {
        if (info.isPlaying) {
          nameEl.textContent = `▶ ${info.mediaTitle} — ${info.mediaArtist}`;
        } else {
          nameEl.textContent = `⏹ ${spName} (Prêt)`;
        }
      }
      if (volSlider && (this.shadowRoot && this.shadowRoot.activeElement !== volSlider)) {
        volSlider.value = vol;
      }
      if (playBtn) {
        playBtn.textContent = info.isPlaying ? "⏸" : "▶";
      }
      if (nowPlayingPill) {
        nowPlayingPill.innerHTML = info.isPlaying ? `🟢 En lecture` : `▶ En lecture`;
      }
    } else if (speaker) {
      const vol = Math.round((speaker.attributes.volume_level || 0) * 100);
      const isMulti = this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1;
      const multiCount = isMulti ? this.selectedSpeakersMulti.size : 0;
      if (nameEl) {
        if (info.isPlaying) {
          nameEl.textContent = `▶ ${info.mediaTitle} — ${info.mediaArtist}${isMulti ? ` [📡 Multi (${multiCount})]` : ''}`;
        } else {
          nameEl.textContent = isMulti ? `⏹ Multi-diffusion (${multiCount} enc.)` : `⏹ ${speaker.attributes.friendly_name || "En attente"}`;
        }
      }
      if (volSlider && (this.shadowRoot && this.shadowRoot.activeElement !== volSlider)) {
        volSlider.value = vol;
      }
      if (playBtn) {
        playBtn.textContent = info.isPlaying ? "⏸" : "▶";
      }
      if (nowPlayingPill) {
        nowPlayingPill.innerHTML = info.isPlaying ? `🟢 En lecture` : `▶ En lecture`;
      }
    }
    if (this.showSpeakerManager) {
      this.updateSpeakerModalUI();
    }
  }

  updateNowPlayingUI() {
    if (!this._hass || !this.shadowRoot) return;
    const info = this.getNowPlayingInfo();
    const root = this.shadowRoot;

    const titleEl = root.getElementById("np-title-txt");
    const artistEl = root.getElementById("np-artist-txt");
    const albumEl = root.getElementById("np-album-txt");
    const coverEl = root.getElementById("np-cover-img");
    const playBtn = root.getElementById("btn-np-play");
    const timeDur = root.getElementById("np-time-duration");
    const slider = root.getElementById("np-progress-slider");

    if (titleEl && titleEl.textContent !== info.mediaTitle) {
      titleEl.textContent = info.mediaTitle;
      titleEl.title = info.mediaTitle;
    }
    if (artistEl) {
      artistEl.textContent = info.mediaArtist || "Artiste inconnu";
      artistEl.title = info.mediaArtist;
    }
    if (albumEl) {
      albumEl.textContent = info.mediaAlbum;
      albumEl.title = info.mediaAlbum;
      albumEl.style.display = info.mediaAlbum ? "block" : "none";
    }
    if (coverEl && coverEl.src !== info.coverUrl) {
      coverEl.src = info.coverUrl;
    }
    if (playBtn) {
      playBtn.textContent = info.isPlaying ? "⏸" : "▶";
      playBtn.title = info.isPlaying ? "Pause" : "Lecture";
    }
    const headerPlayBtn = root.getElementById("btn-speaker-playpause");
    if (headerPlayBtn) {
      headerPlayBtn.textContent = info.isPlaying ? "⏸" : "▶";
    }
    const miniPlayBtn = root.getElementById("btn-mini-play");
    if (miniPlayBtn) {
      miniPlayBtn.textContent = info.isPlaying ? "⏸" : "▶";
    }
    if (timeDur) {
      timeDur.textContent = this.formatSeconds(info.duration);
    }
    if (slider && info.duration > 0) {
      slider.max = info.duration;
    }

    this.checkNowPlayingUpdates();
  }

  async refreshNowPlayingFromSensor() {
    if (!this._hass || !this.isAlexaSpeaker()) return;
    try {
      const state = this._hass.states?.["sensor.nas_music_now_playing"];
      if (state?.attributes?.track_id) {
        this.loadTrackDetailsAndQueue(state.attributes.track_id);
        return;
      }
      if (this._hass.callApi) {
        const res = await this._hass.callApi("GET", "states/sensor.nas_music_now_playing");
        if (res?.attributes?.track_id) {
          this.loadTrackDetailsAndQueue(res.attributes.track_id);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  async loadTrackDetailsAndQueue(trackId) {
    if (!trackId || trackId === this._loadedTrackId) return;
    this._loadedTrackId = trackId;

    try {
      const url = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items/${trackId}`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      if (!res.ok) return;
      const track = await res.json();
      
      const title = track.Name || "";
      const artist = (Array.isArray(track.Artists) && track.Artists.length > 0 ? track.Artists.join(", ") : "") || track.AlbumArtist || "";
      const album = track.Album || "";
      const albumId = track.AlbumId || track.Id;
      const duration = track.RunTimeTicks ? Math.floor(track.RunTimeTicks / 10000000) : 0;
      const cover = `${this.jellyfinUrl}/Items/${albumId}/Images/Primary?maxWidth=300`;

      this.currentNowPlaying = {
        title,
        artist,
        album,
        cover,
        trackId: track.Id,
        duration
      };

      this.isPlayingLocal = true;
      const nasSensor = this._hass?.states?.["sensor.nas_music_now_playing"];
      let elapsed = 0;
      if (nasSensor?.last_updated && nasSensor.state === "playing" && nasSensor.attributes?.track_id === track.Id) {
        elapsed = Math.max(0, (Date.now() - new Date(nasSensor.last_updated).getTime()) / 1000);
        if (duration > 0 && elapsed > duration) elapsed = 0;
      }
      // Si la piste vient de démarrer (< 2s), appliquer un délai de démarrage pour le buffering de l'enceinte
      this._localPlayStart = (elapsed <= 2 && this.isAlexaSpeaker()) ? (Date.now() + 3000) : Date.now();
      this._localPlayOffset = elapsed;
      this._pausedPos = undefined;
      this._seekOverridePos = undefined;
      this._seekOverrideTime = 0;

      this.loadLyricsForCurrentTrack(title, artist, track.Id);

      if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
        const idx = this.nowPlayingQueue.findIndex(t => (t.Id || t.id) === track.Id);
        if (idx !== -1) {
          this.nowPlayingCurrentIndex = idx;
        }
      }

      if (track.AlbumId && (this.nowPlayingQueue.length === 0 || this._loadedAlbumId !== track.AlbumId)) {
        this._loadedAlbumId = track.AlbumId;
        const qUrl = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${track.AlbumId}&Fields=RunTimeTicks,AlbumArtist,Artists`;
        const qRes = await fetch(qUrl, { headers: { "Authorization": this.authHeader } });
        if (qRes.ok) {
          const qData = await qRes.json();
          this.nowPlayingQueue = qData.Items || [];
          const idx = this.nowPlayingQueue.findIndex(t => t.Id === track.Id);
          if (idx !== -1) {
            this.nowPlayingCurrentIndex = idx;
          }
        }
      }

      this.updateNowPlayingUI();
      this.renderNowPlayingTab();
    } catch (e) {
      console.warn("loadTrackDetailsAndQueue error:", e);
    }
  }

  checkNowPlayingUpdates() {
    if (!this._hass) return;
    const info = this.getNowPlayingInfo();

    if (this.isSpotifyActive()) {
      if (info.mediaTitle && info.mediaTitle !== "Aucun morceau en cours" && info.mediaTitle !== this._lastTrackTitle) {
        this._lastTrackTitle = info.mediaTitle;
        this.loadLyricsForCurrentTrack(info.mediaTitle, info.mediaArtist, null);
      }
    } else if (this.isAlexaSpeaker()) {
      if (info.trackId && info.trackId !== this._loadedTrackId) {
        this.loadTrackDetailsAndQueue(info.trackId);
      } else if (info.mediaTitle && info.mediaTitle !== "Aucun morceau en cours" && info.mediaTitle !== this._lastTrackTitle) {
        this._lastTrackTitle = info.mediaTitle;
        this.loadLyricsForCurrentTrack(info.mediaTitle, info.mediaArtist, info.trackId);
        if (this.nowPlayingQueue.length === 0 && (info.mediaAlbum || info.mediaTitle)) {
          this.loadQueueForCurrentAlbum(info.mediaAlbum || info.mediaTitle);
        }
      }
    }

    if (this.nowPlayingTab === "lyrics" && this.currentLyrics && this.currentLyrics.length > 0) {
      this.highlightActiveLyric(info.curPos);
    }
  }

  highlightActiveLyric(posSeconds, forceScroll = false) {
    const root = this.shadowRoot;
    if (!root) return;

    if (this.hasLrcSync) {
      const ticks = posSeconds * 10000000;
      let activeIdx = -1;
      for (let i = 0; i < this.currentLyrics.length; i++) {
        if (this.currentLyrics[i].Start !== undefined && this.currentLyrics[i].Start <= ticks) {
          activeIdx = i;
        } else if (this.currentLyrics[i].Start !== undefined) {
          break;
        }
      }

      const lines = root.querySelectorAll(".lyric-line");
      let activeLineEl = null;

      lines.forEach((l, idx) => {
        if (idx === activeIdx) {
          if (!l.classList.contains("active-lyric")) {
            l.classList.add("active-lyric");
            activeLineEl = l;
          } else if (forceScroll) {
            activeLineEl = l;
          }
        } else {
          l.classList.remove("active-lyric");
        }
      });

      if (activeLineEl) {
        const box = root.getElementById("lyrics-scroll-box");
        if (box) {
          const boxRect = box.getBoundingClientRect();
          const lineRect = activeLineEl.getBoundingClientRect();
          const lineTopInScroll = (lineRect.top - boxRect.top - (box.clientTop || 0)) + box.scrollTop;
          const targetScrollTop = lineTopInScroll - (box.clientHeight / 2) + (lineRect.height / 2);
          box.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "smooth"
          });
        }
      }
    } else {
      // Défilement automatique estimé basé sur la durée pour les paroles textuelles
      const info = this.getNowPlayingInfo();
      const dur = info.duration || 0;
      if (dur > 0 && this.currentLyrics && this.currentLyrics.length > 0) {
        const progress = Math.max(0, Math.min(1, posSeconds / dur));
        const estimatedIdx = Math.min(this.currentLyrics.length - 1, Math.floor(progress * this.currentLyrics.length));

        const lines = root.querySelectorAll(".lyric-line");
        let activeLineEl = null;

        lines.forEach((l, idx) => {
          if (idx === estimatedIdx) {
            if (!l.classList.contains("active-lyric")) {
              l.classList.add("active-lyric");
              activeLineEl = l;
            } else if (forceScroll) {
              activeLineEl = l;
            }
          } else {
            l.classList.remove("active-lyric");
          }
        });

        const box = root.getElementById("lyrics-scroll-box");
        if (box && (activeLineEl || forceScroll)) {
          const maxScroll = Math.max(0, box.scrollHeight - box.clientHeight);
          if (maxScroll > 0) {
            box.scrollTo({
              top: maxScroll * progress,
              behavior: "smooth"
            });
          }
        }
      }
    }
  }

  parseLrcString(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split("\n");
    const lyrics = [];
    const regex = /^\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/;
    for (const line of lines) {
      const match = line.trim().match(regex);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseFloat(match[2]);
        const totalSec = min * 60 + sec;
        const text = match[3].trim();
        lyrics.push({
          Text: text,
          Start: Math.round(totalSec * 10000000)
        });
      }
    }
    return lyrics;
  }

  async loadLyricsForCurrentTrack(title, artist, explicitTrackId = null) {
    if (!title || title === "Aucun morceau en cours") {
      this.currentLyrics = [];
      this.renderNowPlayingTab();
      return;
    }
    this.loadingLyrics = true;
    this.renderNowPlayingTab();

    try {
      let trackId = explicitTrackId || null;

      // 1. Chercher dans la file d attente locale si disponible
      if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
        const cleanT = title.toLowerCase().replace(/^\d+[\s.-]+/, "").trim();
        const found = this.nowPlayingQueue.find(t => {
          if (!t.Name) return false;
          const tClean = t.Name.toLowerCase().replace(/^\d+[\s.-]+/, "").trim();
          return tClean === cleanT || tClean.includes(cleanT) || cleanT.includes(tClean);
        });
        if (found) trackId = found.Id;
      }

      // 2. Si non trouve dans la file, chercher recursivement dans Jellyfin
      if (!trackId) {
        const cleanTitle = title.replace(/^\d+[\s.-]+/, "").trim();
        const searchUrl = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?searchTerm=${encodeURIComponent(cleanTitle)}&IncludeItemTypes=Audio&Limit=5&Recursive=true`;
        const sRes = await fetch(searchUrl, { headers: { "Authorization": this.authHeader } });
        if (sRes.ok) {
          const sData = await sRes.json();
          const items = sData.Items || [];
          if (items.length > 0) {
            trackId = items[0].Id;
          }
        }
      }

      // 3. Recuperer les paroles depuis Jellyfin
      if (trackId) {
        const lRes = await fetch(`${this.jellyfinUrl}/Audio/${trackId}/Lyrics`, { headers: { "Authorization": this.authHeader } });
        if (lRes.ok) {
          const lData = await lRes.json();
          this.currentLyrics = lData.Lyrics || [];
        } else {
          this.currentLyrics = [];
        }
      } else {
        this.currentLyrics = [];
      }

      // 3b. Si Jellyfin n'a pas de minutage synchronisé (.lrc), interroger lrclib.net (base mondiale de paroles synchronisées)
      const hasJellyfinTimedLrc = this.currentLyrics.length > 0 && this.currentLyrics.some(l => l && l.Start !== undefined);
      if (!hasJellyfinTimedLrc && title) {
        try {
          const cleanT = (title || "").replace(/^\d+[\s.-]+/, "").replace(/\s*\(.*?\)/g, "").trim();
          const cleanA = (artist || "").replace(/,.*$/, "").replace(/\s*feat\..*$/i, "").trim();
          const lrcUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanA)}&track_name=${encodeURIComponent(cleanT)}`;
          const lrcRes = await fetch(lrcUrl);
          if (lrcRes.ok) {
            const lrcData = await lrcRes.json();
            if (lrcData.syncedLyrics) {
              const parsed = this.parseLrcString(lrcData.syncedLyrics);
              if (parsed.length > 0) {
                this.currentLyrics = parsed;
              }
            } else if (this.currentLyrics.length === 0 && lrcData.plainLyrics) {
              this.currentLyrics = lrcData.plainLyrics.split("\n").map(line => ({ Text: line.trim() }));
            }
          }
        } catch (errLrc) {
          console.warn("Lrclib fetch error:", errLrc);
        }
      }

      // 4. Si aucune parole sur Jellyfin ni LRCLIB, tenter les paroles Genius via Home Assistant
      if (this.currentLyrics.length === 0 && this._hass) {
        const speakerKey = (this.selectedSpeaker || "").replace("media_player.", "");
        const lyricsSensors = [
          `sensor.${speakerKey}_lyrics`,
          "sensor.echo_chambre_lyrics",
          "sensor.genius_lyrics_lecteur_actif_lyrics",
          "sensor.chambre_lyrics"
        ];
        for (const sId of lyricsSensors) {
          const st = this._hass.states?.[sId];
          const rawLyrics = st?.attributes?.media_lyrics;
          if (rawLyrics && typeof rawLyrics === "string" && rawLyrics.trim().length > 0) {
            this.currentLyrics = rawLyrics.split("\n").map(line => ({ Text: line.trim() }));
            break;
          }
        }
      }
      this.hasLrcSync = this.currentLyrics.length > 0 && this.currentLyrics.some(l => l && l.Start !== undefined);
    } catch (e) {
      console.warn("Erreur chargement paroles:", e);
      this.currentLyrics = [];
    } finally {
      this.loadingLyrics = false;
      this.renderNowPlayingTab();
    }
  }

  async loadQueueForCurrentAlbum(albumQuery) {
    try {
      const clean = albumQuery.replace(/^\d{4}\s*-\s*/, "").trim();
      const url = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?searchTerm=${encodeURIComponent(clean)}&IncludeItemTypes=MusicAlbum,Playlist&Limit=2`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      const data = await res.json();
      const items = data.Items || [];
      const best = items.find(i => i.Type === "MusicAlbum") || items[0];
      if (best) {
        let tracksUrl = best.Type === "Playlist"
          ? `${this.jellyfinUrl}/Playlists/${best.Id}/Items?UserId=${this.jellyfinUser}`
          : `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${best.Id}&Fields=RunTimeTicks,AlbumArtist,Artists`;
        const tRes = await fetch(tracksUrl, { headers: { "Authorization": this.authHeader } });
        const tData = await tRes.json();
        this.nowPlayingQueue = tData.Items || [];
        if (this.nowPlayingQueue.length > 0) {
          const qIdx = this.nowPlayingCurrentIndex || 0;
          const currentTrack = this.nowPlayingQueue[qIdx] || this.nowPlayingQueue[0];
          const artist = (Array.isArray(currentTrack.Artists) ? currentTrack.Artists.join(", ") : currentTrack.Artists) || currentTrack.AlbumArtist || best.AlbumArtist || "";
          if (!this.currentNowPlaying || !this.currentNowPlaying.title || this.currentNowPlaying.title === "Aucun morceau en cours") {
            this.currentNowPlaying = {
              title: currentTrack.Name,
              artist: artist,
              album: best.Name || "",
              cover: `${this.jellyfinUrl}/Items/${best.Id}/Images/Primary?maxWidth=300`,
              trackId: currentTrack.Id,
              duration: currentTrack.RunTimeTicks ? Math.floor(currentTrack.RunTimeTicks / 10000000) : 0
            };
          }
          this.loadLyricsForCurrentTrack(currentTrack.Name, artist, currentTrack.Id);
        }
        this.updateNowPlayingUI();
        this.renderNowPlayingTab();
      }
    } catch (e) {
      console.warn("Could not load queue for album", e);
    }
  }

  async searchJellyfin(query, page = 0) {
    this.loading = true;
    this.currentPage = page;
    this.renderResults();
    try {
      const startIndex = page * this.pageSize;
      const url = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?searchTerm=${encodeURIComponent(query)}&IncludeItemTypes=MusicAlbum,Playlist&Recursive=True&SortBy=SortName&Limit=${this.pageSize}&StartIndex=${startIndex}&Fields=AlbumArtist,ChildCount,ImageTags`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      const data = await res.json();
      
      // Filter out empty playlists without children or duplicate broken .m3u files
      let rawItems = data.Items || [];
      let filtered = rawItems.filter(i => !(i.Type === "Playlist" && (i.ChildCount === 0 || (rawItems.some(other => other.Type === "MusicAlbum" && other.Name === i.Name)))));
      
      // Trier : mettre les albums studio MusicAlbum en priorité absolue devant les playlists
      filtered.sort((a, b) => {
        if (a.Type === "MusicAlbum" && b.Type !== "MusicAlbum") return -1;
        if (b.Type === "MusicAlbum" && a.Type !== "MusicAlbum") return 1;
        return (a.SortName || a.Name).localeCompare(b.SortName || b.Name);
      });

      this.searchResults = filtered;
      this.totalItems = data.TotalRecordCount || this.searchResults.length;
    } catch (e) {
      this.searchResults = [];
      this.totalItems = 0;
    } finally {
      this.loading = false;
      this.renderResults();
    }
  }

  async loadCategory(catId, page = 0) {
    const cat = CATEGORIES[catId];
    if (!cat) return;

    this.activeCategory = catId;
    this.currentPage = page;
    this.selectedAlbum = null;

    if (cat.type === "favorites") {
      this.currentView = "favorites";
      this.loading = true;
      this.render();

      try {
        const startIndex = page * this.pageSize;
        const url = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?Filters=IsFavorite&IncludeItemTypes=MusicAlbum,Playlist&Recursive=True&SortBy=SortName&Limit=${this.pageSize}&StartIndex=${startIndex}&Fields=AlbumArtist,ChildCount,ImageTags`;
        const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
        const data = await res.json();
        this.searchResults = data.Items || [];
        this.totalItems = data.TotalRecordCount !== undefined ? data.TotalRecordCount : this.searchResults.length;
      } catch (err) {
        console.error("Error loading Jellyfin favorites:", err);
        this.searchResults = [];
        this.totalItems = 0;
      } finally {
        this.loading = false;
        this.render();
      }
      return;
    }

    if (cat.type === "radios") {
      this.loading = false;
      this.currentView = "radios";
      this.searchResults = [];
      this.totalItems = this.getRadios().length;
      this.render();
      return;
    }

    if (cat.type === "spotify") {
      this.currentView = "spotify";
      await this.loadSpotifyContent(this.spotifySubTab || "playlists");
      return;
    }

    if (cat.type === "nowplaying") {
      this.loading = false;
      this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
      this.currentView = "nowplaying";
      this.render();
      if (this.isAlexaSpeaker()) {
        this.refreshNowPlayingFromSensor();
      }
      const info = this.getNowPlayingInfo();
      if (info.trackId) {
        if (this.isAlexaSpeaker()) {
          this.loadTrackDetailsAndQueue(info.trackId);
        }
      } else if (info.mediaTitle && info.mediaTitle !== "Aucun morceau en cours") {
        this.loadLyricsForCurrentTrack(info.mediaTitle, info.mediaArtist, info.trackId);
        if (this.nowPlayingQueue.length === 0 && (info.mediaAlbum || info.mediaTitle)) {
          this.loadQueueForCurrentAlbum(info.mediaAlbum || info.mediaTitle);
        }
      } else if (this.selectedAlbum) {
        this.loadQueueForCurrentAlbum(this.selectedAlbum.Name || this.selectedAlbum.name);
      }
      return;
    }

    this.currentView = "category";
    this.loading = true;
    this.render();

    try {
      const startIndex = page * this.pageSize;
      const url = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${cat.parentId}&IncludeItemTypes=${cat.itemTypes}&Recursive=True&SortBy=SortName&Limit=${this.pageSize}&StartIndex=${startIndex}&Fields=AlbumArtist,ChildCount,ImageTags`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      const data = await res.json();
      this.searchResults = data.Items || [];
      this.totalItems = data.TotalRecordCount || this.searchResults.length;
    } catch (e) {
      this.searchResults = [];
      this.totalItems = 0;
    } finally {
      this.loading = false;
      this.renderResults();
    }
  }

  async openAlbum(item) {
    this.selectedAlbum = item;
    this.previousView = this.currentView;
    this.currentView = "album";
    this.albumTracks = [];
    this.loading = true;
    this.render();

    try {
      const itemId = item.Id || item.id;
      const itemName = item.Name || item.name || "";
      let url = item.Type === "Playlist"
        ? `${this.jellyfinUrl}/Playlists/${itemId}/Items?UserId=${this.jellyfinUser}`
        : `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${itemId}&Fields=RunTimeTicks`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      const data = await res.json();
      this.albumTracks = data.Items || [];

      // Auto-fallback: If 0 tracks returned (e.g. empty .m3u playlist was clicked), look up corresponding MusicAlbum!
      if (this.albumTracks.length === 0 && itemName) {
        const fbUrl = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?searchTerm=${encodeURIComponent(itemName)}&IncludeItemTypes=MusicAlbum&Limit=1&Fields=ImageTags`;
        const fbRes = await fetch(fbUrl, { headers: { "Authorization": this.authHeader } });
        const fbData = await fbRes.json();
        if (fbData.Items && fbData.Items.length > 0) {
          const albumItem = fbData.Items[0];
          this.selectedAlbum = albumItem;
          const albumTracksUrl = `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${albumItem.Id}&Fields=RunTimeTicks`;
          const atRes = await fetch(albumTracksUrl, { headers: { "Authorization": this.authHeader } });
          const atData = await atRes.json();
          this.albumTracks = atData.Items || [];
        }
      }

      this.nowPlayingQueue = this.albumTracks;
    } catch (e) {
      console.error("Failed to load tracks", e);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async fetchSpotifyService(serviceName, serviceData = {}) {
    if (!this._hass) return null;
    const payload = {
      entity_id: this.spotifyPlayer,
      ...serviceData
    };

    if (typeof this._hass.callWS === "function") {
      try {
        const wsRes = await this._hass.callWS({
          type: "call_service",
          domain: "spotifyplus",
          service: serviceName,
          service_data: payload,
          return_response: true
        });
        if (wsRes) {
          if (wsRes.response) return wsRes.response;
          if (wsRes.result?.response) return wsRes.result.response;
          if (wsRes.result) return wsRes.result;
          return wsRes;
        }
      } catch (e) {
        console.warn(`callWS failed for ${serviceName}`, e);
      }
    }

    if (typeof this._hass.callApi === "function") {
      try {
        const apiRes = await this._hass.callApi(
          "POST",
          `services/spotifyplus/${serviceName}?return_response=true`,
          payload
        );
        if (apiRes?.service_response) return apiRes.service_response;
        if (apiRes?.response) return apiRes.response;
        return apiRes;
      } catch (e) {
        console.warn(`callApi failed for ${serviceName}`, e);
      }
    }
    return null;
  }

  async loadSpotifyPlaylists(page = 0) {
    return this.loadSpotifyContent("playlists");
  }

  getSpotifySubTabLabel() {
    if (this.searchQuery) return `Recherche : « ${this.searchQuery} »`;
    switch (this.spotifySubTab) {
      case "albums": return "Albums favoris Spotify";
      case "artists": return "Artistes suivis Spotify";
      case "top": return "Top Titres & Recommandations";
      case "playlists":
      default: return "Playlists Spotify";
    }
  }

  async loadSpotifyContent(subTab = "playlists") {
    this.loading = true;
    this.currentView = "spotify";
    this.activeCategory = "spotify";
    this.spotifySubTab = subTab;
    this.render();

    try {
      if (subTab === "playlists") {
        if (!this.spotifyPlaylists || this.spotifyPlaylists.length === 0) {
          const data = await this.fetchSpotifyService("get_playlist_favorites", { limit: 50 });
          const rawPlaylists = data?.result?.items || data?.items || [];
          this.spotifyPlaylists = rawPlaylists.map(p => ({
            Id: p.id,
            id: p.id,
            Name: p.name,
            displayName: p.name,
            AlbumArtist: `${p.tracks?.total || 0} titres • 🎶 Playlist Spotify`,
            tracksCount: p.tracks?.total || 0,
            coverUrl: p.image_url || (p.images && p.images[0]?.url) || "",
            image_url: p.image_url || (p.images && p.images[0]?.url) || "",
            uri: p.uri,
            Type: "SpotifyPlaylist"
          }));
        }
        this.searchResults = this.spotifyPlaylists;
      } else if (subTab === "albums") {
        if (!this.spotifyAlbums || this.spotifyAlbums.length === 0) {
          const data = await this.fetchSpotifyService("get_album_favorites", { limit: 50 });
          const rawAlbums = data?.result?.items || data?.items || [];
          this.spotifyAlbums = rawAlbums.map(it => {
            const alb = it.album || it;
            const artistName = alb.artists ? alb.artists.map(a => a.name).join(", ") : (alb.artist || "");
            return {
              Id: alb.id,
              id: alb.id,
              Name: alb.name,
              displayName: alb.name,
              AlbumArtist: artistName ? `${artistName} • 💿 Album Spotify` : "💿 Album Spotify",
              artist: artistName,
              tracksCount: alb.total_tracks || alb.tracks?.total || 0,
              coverUrl: alb.image_url || (alb.images && alb.images[0]?.url) || "",
              image_url: alb.image_url || (alb.images && alb.images[0]?.url) || "",
              uri: alb.uri,
              Type: "SpotifyAlbum"
            };
          });
        }
        this.searchResults = this.spotifyAlbums;
      } else if (subTab === "artists") {
        if (!this.spotifyArtists || this.spotifyArtists.length === 0) {
          const data = await this.fetchSpotifyService("get_artists_followed", { limit: 50 });
          const rawArtists = data?.result?.items || data?.items || [];
          this.spotifyArtists = rawArtists.map(art => ({
            Id: art.id,
            id: art.id,
            Name: art.name,
            displayName: art.name,
            AlbumArtist: `${art.followers?.total ? art.followers.total.toLocaleString('fr-FR') + ' fans • ' : ''}🎤 Artiste Spotify`,
            coverUrl: art.image_url || (art.images && art.images[0]?.url) || "",
            image_url: art.image_url || (art.images && art.images[0]?.url) || "",
            uri: art.uri,
            Type: "SpotifyArtist"
          }));
        }
        this.searchResults = this.spotifyArtists;
      } else if (subTab === "top") {
        if (!this.spotifyTopTracks || this.spotifyTopTracks.length === 0) {
          const data = await this.fetchSpotifyService("get_users_top_tracks", { limit: 50 });
          const rawTracks = data?.result?.items || data?.items || [];
          this.spotifyTopTracks = rawTracks.map((t, idx) => {
            const artistName = t.artists ? t.artists.map(a => a.name).join(", ") : "";
            const durSec = t.duration_ms ? Math.floor(t.duration_ms / 1000) : 0;
            return {
              Id: t.id,
              id: t.id,
              Name: t.name,
              displayName: t.name,
              IndexNumber: idx + 1,
              RunTimeTicks: t.duration_ms ? t.duration_ms * 10000 : 0,
              duration: durSec,
              AlbumArtist: artistName ? `${artistName} • 🎵 Titre Spotify` : "🎵 Titre Spotify",
              coverUrl: (t.album?.images && t.album.images[0]?.url) || "",
              image_url: (t.album?.images && t.album.images[0]?.url) || "",
              uri: t.uri,
              Type: "SpotifyTrack"
            };
          });
        }
        this.searchResults = this.spotifyTopTracks;
      }

      if (this.searchQuery && this.searchQuery.trim().length > 0) {
        const q = this.searchQuery.toLowerCase();
        this.searchResults = (this.searchResults || []).filter(item =>
          (item.Name || '').toLowerCase().includes(q) || (item.AlbumArtist || '').toLowerCase().includes(q)
        );
      }
      this.totalItems = this.searchResults.length;
    } catch (e) {
      console.warn("Erreur chargement Spotify:", e);
      this.searchResults = [];
      this.totalItems = 0;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async searchSpotify(query) {
    if (!query || query.trim().length < 2) {
      return this.loadSpotifyContent(this.spotifySubTab);
    }
    this.loading = true;
    this.currentView = "spotify";
    this.activeCategory = "spotify";
    this.render();

    try {
      const data = await this.fetchSpotifyService("search_all", {
        criteria: query.trim(),
        criteria_type: "album,playlist,artist,track",
        limit_total: 10
      });

      const resObj = data?.result || {};
      const playlists = (resObj.playlists?.items || []).map(p => ({
        Id: p.id,
        id: p.id,
        Name: p.name,
        displayName: p.name,
        AlbumArtist: `${p.tracks?.total || 0} titres • 🎶 Playlist Spotify`,
        tracksCount: p.tracks?.total || 0,
        coverUrl: p.image_url || (p.images && p.images[0]?.url) || "",
        image_url: p.image_url || (p.images && p.images[0]?.url) || "",
        uri: p.uri,
        Type: "SpotifyPlaylist"
      }));

      const albums = (resObj.albums?.items || []).map(a => {
        const artName = a.artists ? a.artists.map(art => art.name).join(", ") : "";
        return {
          Id: a.id,
          id: a.id,
          Name: a.name,
          displayName: a.name,
          AlbumArtist: artName ? `${artName} • 💿 Album Spotify` : "💿 Album Spotify",
          artist: artName,
          coverUrl: a.image_url || (a.images && a.images[0]?.url) || "",
          image_url: a.image_url || (a.images && a.images[0]?.url) || "",
          uri: a.uri,
          Type: "SpotifyAlbum"
        };
      });

      const artists = (resObj.artists?.items || []).map(art => ({
        Id: art.id,
        id: art.id,
        Name: art.name,
        displayName: art.name,
        AlbumArtist: `${art.followers?.total ? art.followers.total.toLocaleString('fr-FR') + ' fans • ' : ''}🎤 Artiste Spotify`,
        coverUrl: art.image_url || (art.images && art.images[0]?.url) || "",
        image_url: art.image_url || (art.images && art.images[0]?.url) || "",
        uri: art.uri,
        Type: "SpotifyArtist"
      }));

      const tracks = (resObj.tracks?.items || []).map((t, idx) => {
        const artName = t.artists ? t.artists.map(art => art.name).join(", ") : "";
        const durSec = t.duration_ms ? Math.floor(t.duration_ms / 1000) : 0;
        return {
          Id: t.id,
          id: t.id,
          Name: t.name,
          displayName: t.name,
          AlbumArtist: artName ? `${artName} • 🎵 Titre Spotify` : "🎵 Titre Spotify",
          duration: durSec,
          coverUrl: (t.album?.images && t.album.images[0]?.url) || "",
          image_url: (t.album?.images && t.album.images[0]?.url) || "",
          uri: t.uri,
          Type: "SpotifyTrack"
        };
      });

      this.searchResults = [...playlists, ...albums, ...artists, ...tracks];
      this.totalItems = this.searchResults.length;
    } catch (e) {
      console.warn("Erreur recherche Spotify:", e);
      this.searchResults = [];
      this.totalItems = 0;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async openSpotifyPlaylist(item) {
    this.selectedAlbum = {
      Id: item.Id || item.id,
      Name: item.Name || item.name,
      AlbumArtist: "Playlist Spotify",
      coverUrl: item.image_url || item.coverUrl,
      uri: item.uri,
      Type: "SpotifyPlaylist"
    };
    this.previousView = this.currentView !== "album" ? this.currentView : "spotify";
    this.currentView = "album";
    this.albumTracks = [];
    this.loading = true;
    this.render();

    try {
      const data = await this.fetchSpotifyService("get_playlist_items", {
        playlist_id: item.Id || item.id,
        limit: 100
      });
      const rawTracks = data?.result?.items || data?.items || [];
      this.albumTracks = rawTracks.map((it, idx) => {
        const t = it.track || it;
        const durSec = t.duration_ms ? Math.floor(t.duration_ms / 1000) : 0;
        return {
          Id: t.id || `sp_${idx}`,
          Name: t.name,
          IndexNumber: idx + 1,
          RunTimeTicks: t.duration_ms ? t.duration_ms * 10000 : 0,
          duration: durSec,
          Artists: t.artists ? t.artists.map(a => a.name) : [],
          AlbumArtist: t.artists && t.artists[0] ? t.artists[0].name : "",
          uri: t.uri
        };
      });
    } catch (e) {
      console.warn("Erreur chargement pistes Spotify:", e);
      this.albumTracks = [];
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async openSpotifyAlbum(item) {
    this.selectedAlbum = {
      Id: item.Id || item.id,
      Name: item.Name || item.name,
      AlbumArtist: item.AlbumArtist || "Album Spotify",
      coverUrl: item.image_url || item.coverUrl,
      uri: item.uri,
      Type: "SpotifyAlbum"
    };
    this.previousView = this.currentView !== "album" ? this.currentView : "spotify";
    this.currentView = "album";
    this.albumTracks = [];
    this.loading = true;
    this.render();

    try {
      const data = await this.fetchSpotifyService("get_album_tracks", {
        album_id: item.Id || item.id,
        limit: 50
      });
      const rawTracks = data?.result?.items || data?.items || [];
      this.albumTracks = rawTracks.map((t, idx) => {
        const durSec = t.duration_ms ? Math.floor(t.duration_ms / 1000) : 0;
        return {
          Id: t.id || `sp_alb_${idx}`,
          Name: t.name,
          IndexNumber: idx + 1,
          RunTimeTicks: t.duration_ms ? t.duration_ms * 10000 : 0,
          duration: durSec,
          Artists: t.artists ? t.artists.map(a => a.name) : [],
          AlbumArtist: t.artists && t.artists[0] ? t.artists[0].name : "",
          uri: t.uri
        };
      });
    } catch (e) {
      console.warn("Erreur chargement pistes album Spotify:", e);
      this.albumTracks = [];
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async openSpotifyArtist(item) {
    this.selectedAlbum = {
      Id: item.Id || item.id,
      Name: item.Name || item.name,
      AlbumArtist: "Artiste Spotify • Top Titres",
      coverUrl: item.image_url || item.coverUrl,
      uri: item.uri,
      Type: "SpotifyArtist"
    };
    this.previousView = this.currentView !== "album" ? this.currentView : "spotify";
    this.currentView = "album";
    this.albumTracks = [];
    this.loading = true;
    this.render();

    try {
      const data = await this.fetchSpotifyService("get_artist_top_tracks", {
        artist_id: item.Id || item.id
      });
      const rawTracks = Array.isArray(data?.result) ? data.result : (data?.result?.items || data?.items || []);
      this.albumTracks = rawTracks.map((t, idx) => {
        const durSec = t.duration_ms ? Math.floor(t.duration_ms / 1000) : 0;
        return {
          Id: t.id || `sp_art_${idx}`,
          Name: t.name,
          IndexNumber: idx + 1,
          RunTimeTicks: t.duration_ms ? t.duration_ms * 10000 : 0,
          duration: durSec,
          Artists: t.artists ? t.artists.map(a => a.name) : [],
          AlbumArtist: t.artists && t.artists[0] ? t.artists[0].name : "",
          uri: t.uri
        };
      });
    } catch (e) {
      console.warn("Erreur chargement top titres artiste Spotify:", e);
      this.albumTracks = [];
    } finally {
      this.loading = false;
      this.render();
    }
  }

  stopNasPlayback() {
    this.isPlayingLocal = false;
    this.currentNowPlaying = null;
    this._localPlayStart = null;
    this._localPlayOffset = 0;
    this._pausedPos = undefined;
    this._seekOverridePos = undefined;
    this._seekOverrideTime = 0;
    if (window._nasMusicLocalAudio) {
      try {
        window._nasMusicLocalAudio.pause();
        window._nasMusicLocalAudio.currentTime = 0;
        window._nasMusicLocalAudio.src = "";
      } catch (e) {}
    }
    if (this._hass && this.selectedSpeaker && !this.isLocalSystemSpeaker()) {
      this._hass.callService("media_player", "media_stop", { entity_id: this.selectedSpeaker }).catch(() => {});
      if (this.isAlexaSpeaker()) {
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: "stop"
        }).catch(() => {});
      }
    }
  }

  isSpotifyActive() {
    if (!this._hass) return false;
    const speaker = this._hass.states?.[this.selectedSpeaker];
    const spState = this._hass.states?.[this.spotifyPlayer];
    const nasSensor = this._hass.states?.["sensor.nas_music_now_playing"];
    const isLocalSystem = this.isLocalSystemSpeaker();
    const isLocalAudioPlaying = window._nasMusicLocalAudio && !window._nasMusicLocalAudio.paused;
    const isNasActivelyPlaying = (nasSensor && nasSensor.state === "playing") || isLocalAudioPlaying;

    // Si le NAS ou la lecture locale joue activement, Spotify n'est JAMAIS prioritaire
    if (isNasActivelyPlaying) {
      return false;
    }

    // Pour l'audio local ("Système Audio (Cet appareil)"), ne pas utiliser les attributs résiduels de l'entité Alexa
    if (isLocalSystem) {
      return this.currentView === "spotify";
    }

    // Pour les enceintes réseau (Alexa / DLNA)
    if (speaker?.state === "playing" && speaker?.attributes?.app_name === "Spotify") {
      return true;
    }

    // SpotifyPlus : actif si la source correspond à l'enceinte sélectionnée
    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    if (spState?.state === "playing" && speakerObj?.spotifyDevice) {
      const currentSource = (spState.attributes?.source || "").toLowerCase();
      if (currentSource === speakerObj.spotifyDevice.toLowerCase()) {
        return true;
      }
    }

    if (speaker?.state === "paused" && speaker?.attributes?.app_name === "Spotify") {
      return true;
    }
    return false;
  }

  async castSpotifyContext(item, offsetUri = null, shuffle = false) {
    if (!this._hass || !item) return;

    this.stopNasPlayback();
    if (shuffle) this.isShuffle = true;

    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    if (speakerObj && speakerObj.zone) {
      this._hass.callService("input_select", "select_option", {
        entity_id: "input_select.zone_ecoute_multimedia",
        option: speakerObj.zone
      });
    }

    const targetDevice = speakerObj?.spotifyDevice || speakerObj?.zone || "Chambre";

    // Si des pistes Spotify sont chargées (Top titres artiste, album, ou playlist), alimenter la file de lecture
    let clickedTrack = null;
    let startIdx = 0;
    if (this.albumTracks && this.albumTracks.length > 0 && this.albumTracks[0]?.uri?.startsWith('spotify:')) {
      this.nowPlayingQueue = [...this.albumTracks];
      if (offsetUri) {
        const foundIdx = this.albumTracks.findIndex(t => t.uri === offsetUri || t.Id === offsetUri);
        if (foundIdx !== -1) {
          startIdx = foundIdx;
          clickedTrack = this.albumTracks[foundIdx];
        }
      }
      this.nowPlayingCurrentIndex = startIdx;
    } else {
      this.nowPlayingQueue = [];
      this.nowPlayingCurrentIndex = 0;
    }

    if (shuffle) {
      try {
        await this._hass.callService("spotifyplus", "player_set_shuffle_mode", {
          entity_id: this.spotifyPlayer,
          state: true
        });
      } catch (err) {
        console.warn("player_set_shuffle_mode failed", err);
      }
    }

    // Cas particulier : Artiste Spotify (Top Titres)
    // Spotify Web API interdit offset_uri sur un context_uri de type artiste !
    // On lance donc la liste des morceaux directement avec player_media_play_tracks (uris = chaîne séparée par des virgules)
    if (item.Type === "SpotifyArtist" && this.albumTracks && this.albumTracks.length > 0) {
      const uris = startIdx > 0 ? this.albumTracks.slice(startIdx).map(t => t.uri) : this.albumTracks.map(t => t.uri);
      const urisStr = uris.slice(0, 50).join(',');
      try {
        await this._hass.callService("spotifyplus", "player_media_play_tracks", {
          entity_id: this.spotifyPlayer,
          uris: urisStr,
          device_id: targetDevice,
          shuffle: !!shuffle
        });
        const trackTxt = clickedTrack ? ` : ${clickedTrack.Name}` : ` (${item.Name || item.name})`;
        this.showToast(`🟢 Spotify${trackTxt} sur ${speakerObj?.name || targetDevice}${shuffle ? ' (Aléatoire 🔀)' : ''}`);
      } catch (e) {
        console.warn("player_media_play_tracks artist failed, falling back to Alexa voice", e);
        if (this.isAlexaSpeaker() && this.selectedSpeaker !== "media_player.systeme_audio") {
          const artistName = item.Name || item.name;
          const cmd = clickedTrack
            ? `joue le titre ${clickedTrack.Name} de ${artistName} sur Spotify`
            : (shuffle ? `joue de la musique de ${artistName} sur Spotify en aléatoire` : `joue les meilleurs titres de ${artistName} sur Spotify`);
          this._hass.callService("media_player", "play_media", {
            entity_id: this.selectedSpeaker,
            media_content_type: "custom",
            media_content_id: cmd
          });
        }
      }

      setTimeout(() => {
        this.currentView = "nowplaying";
        this.activeCategory = "nowplaying";
        this.render();
        this.updateNowPlayingUI();
      }, 1000);
      return;
    }

    const playData = {
      entity_id: this.spotifyPlayer,
      context_uri: item.uri,
      device_id: targetDevice
    };
    if (offsetUri) {
      playData.offset_uri = offsetUri;
    }

    try {
      await this._hass.callService("spotifyplus", "player_media_play_context", playData);
      const titleName = clickedTrack ? `${clickedTrack.Name} (${item.Name || item.name})` : (item.Name || item.name);
      this.showToast(`🟢 Spotify : ${titleName} sur ${speakerObj?.name || targetDevice}${shuffle ? ' (Aléatoire 🔀)' : ''}`);
    } catch (e) {
      console.warn("player_media_play_context failed, falling back to Alexa voice", e);
      if (this.isAlexaSpeaker() && this.selectedSpeaker !== "media_player.systeme_audio") {
        const typeFr = item.Type === "SpotifyAlbum" ? "l'album" : "la playlist";
        const artistName = item.AlbumArtist || item.artist || item.Name || item.name;
        const shTxt = shuffle ? " en aléatoire" : "";
        const cmd = clickedTrack
          ? `joue le titre ${clickedTrack.Name} de ${typeFr} ${item.Name || item.name} sur Spotify`
          : `joue ${typeFr} ${item.Name || item.name} de ${artistName} sur Spotify${shTxt}`;
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: cmd
        });
      }
    }

    setTimeout(() => {
      this.currentView = "nowplaying";
      this.activeCategory = "nowplaying";
      this.render();
      this.updateNowPlayingUI();
    }, 1000);
  }

  async castSpotifyPlaylist(playlist, offsetUri = null) {
    return this.castSpotifyContext(playlist, offsetUri, false);
  }

  async castSpotifyTrack(trackItem) {
    if (!this._hass || !trackItem) return;
    this.stopNasPlayback();
    this.nowPlayingQueue = [];
    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    const targetDevice = speakerObj?.spotifyDevice || speakerObj?.zone || "Chambre";

    try {
      await this._hass.callService("spotifyplus", "player_media_play_tracks", {
        entity_id: this.spotifyPlayer,
        uris: trackItem.uri,
        device_id: targetDevice
      });
      this.showToast(`🟢 Spotify : ${trackItem.Name} sur ${speakerObj?.name || targetDevice}`);
    } catch (e) {
      if (this.isAlexaSpeaker() && this.selectedSpeaker !== "media_player.systeme_audio") {
        const artistName = trackItem.Artists?.[0]?.Name || trackItem.Artists?.[0] || trackItem.AlbumArtist || "";
        const cmd = artistName ? `joue le titre ${trackItem.Name} de ${artistName} sur Spotify` : `joue le titre ${trackItem.Name} sur Spotify`;
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: cmd
        });
      }
    }

    setTimeout(() => {
      this.currentView = "nowplaying";
      this.activeCategory = "nowplaying";
      this.render();
      this.updateNowPlayingUI();
    }, 1000);
  }

  async toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.showToast(this.isShuffle ? "🔀 Lecture aléatoire activée" : "➡️ Lecture normale (aléatoire désactivé)");

    const isSpotifyActive = this.isSpotifyActive();

    if (isSpotifyActive) {
      try {
        await this._hass.callService("spotifyplus", "player_set_shuffle_mode", {
          entity_id: this.spotifyPlayer,
          state: this.isShuffle
        });
      } catch (e) {
        console.warn("player_set_shuffle_mode error:", e);
      }
      const btn = this.shadowRoot?.getElementById("btn-np-shuffle");
      if (btn) {
        btn.classList.toggle("active-control", this.isShuffle);
        btn.title = this.isShuffle ? "Désactiver le mode aléatoire" : "Activer le mode aléatoire";
      }
      return;
    } else if (this.isAlexaSpeaker()) {
      const cmd = this.isShuffle ? "active la lecture aléatoire" : "désactive la lecture aléatoire";
      this._hass.callService("media_player", "play_media", {
        entity_id: this.selectedSpeaker,
        media_content_type: "custom",
        media_content_id: cmd
      });
      this._hass.callService("media_player", "shuffle_set", {
        entity_id: this.selectedSpeaker,
        shuffle: this.isShuffle
      });
    } else {
      this._hass.callService("media_player", "shuffle_set", {
        entity_id: this.selectedSpeaker,
        shuffle: this.isShuffle
      });
    }

    if (this.isShuffle && this.nowPlayingQueue && this.nowPlayingQueue.length > 2) {
      const curIdx = this.nowPlayingCurrentIndex || 0;
      const played = this.nowPlayingQueue.slice(0, curIdx + 1);
      const remaining = this.nowPlayingQueue.slice(curIdx + 1);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      this.nowPlayingQueue = [...played, ...remaining];
      if (this.nowPlayingTab === "queue") {
        this.renderNowPlayingTab();
      }
    }

    const btn = this.shadowRoot?.getElementById("btn-np-shuffle");
    if (btn) {
      btn.classList.toggle("active-control", this.isShuffle);
      btn.title = this.isShuffle ? "Désactiver le mode aléatoire" : "Activer le mode aléatoire";
    }
  }

  isLocalSystemSpeaker(speakerId) {
    const id = speakerId || this.selectedSpeaker;
    if (!id) return false;
    if (id === "media_player.systeme_audio" || id === "local_device" || id === "systeme_audio" || id === "local_browser") return true;
    const sp = this.getSpeakers().find(s => s.id === id);
    return !!(sp && sp.isLocalSystem);
  }

  isDlnaSpeaker(speakerId) {
    const id = speakerId || this.selectedSpeaker;
    if (this.isLocalSystemSpeaker(id)) return false;
    const sp = this.getSpeakers().find(s => s.id === id);
    if (sp && sp.isAlexa !== undefined) return !sp.isAlexa;
    return id.includes("sonoro") || id.includes("dlna");
  }

  isAlexaSpeaker(speakerId) {
    if (this.isLocalSystemSpeaker(speakerId)) return false;
    return !this.isDlnaSpeaker(speakerId);
  }

  getLocalAudio() {
    if (!window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio = new Audio();
      window._nasMusicLocalAudio.preload = "auto";
      const savedVol = parseFloat(localStorage.getItem("nas_music_local_volume") || "0.8");
      window._nasMusicLocalAudio.volume = isNaN(savedVol) ? 0.8 : Math.max(0, Math.min(1, savedVol));

      window._nasMusicLocalAudio.addEventListener("ended", () => {
        window.dispatchEvent(new CustomEvent("nas-music-local-audio-ended"));
      });
      window._nasMusicLocalAudio.addEventListener("play", () => {
        window.dispatchEvent(new CustomEvent("nas-music-local-audio-state", { detail: { state: "playing" } }));
      });
      window._nasMusicLocalAudio.addEventListener("pause", () => {
        window.dispatchEvent(new CustomEvent("nas-music-local-audio-state", { detail: { state: "paused" } }));
      });
      window._nasMusicLocalAudio.addEventListener("error", (e) => {
        console.warn("NasMusic local audio error:", e);
      });
      window._nasMusicLocalAudio.addEventListener("timeupdate", () => {
        const audio = window._nasMusicLocalAudio;
        if (audio && audio.duration > 0 && isFinite(audio.duration)) {
          if (audio.currentTime >= (audio.duration - 0.35) && !audio._endedHandled && !audio.paused) {
            audio._endedHandled = true;
            window.dispatchEvent(new CustomEvent("nas-music-local-audio-ended"));
          }
        }
      });
    }
    return window._nasMusicLocalAudio;
  }

  setupMediaSession(meta) {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta?.title || "Musique du NAS",
        artist: meta?.artist || "",
        album: meta?.album || "",
        artwork: meta?.cover ? [{ src: meta.cover, sizes: "300x300", type: "image/jpeg" }] : []
      });
      navigator.mediaSession.setActionHandler("play", () => this.controlPlayPause());
      navigator.mediaSession.setActionHandler("pause", () => this.controlPlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => this.controlPreviousTrack());
      navigator.mediaSession.setActionHandler("nexttrack", () => this.controlNextTrack());
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          this.controlSeekAbsolute(details.seekTime);
        }
      });
    } catch(e) {}
  }

  controlPlayPause() {
    if (!this._hass) return;

    if (this.isSpotifyActive()) {
      this._hass.callService("media_player", "media_play_pause", {
        entity_id: this.spotifyPlayer
      });
      return;
    }

    if (this.isLocalSystemSpeaker()) {
      const audio = this.getLocalAudio();
      if (audio.paused) {
        audio.play().then(() => {
          this.isPlayingLocal = true;
          this.updateNowPlayingUI();
        }).catch(() => {});
      } else {
        audio.pause();
        this.isPlayingLocal = false;
        this.updateNowPlayingUI();
      }
      return;
    }

    const info = this.getNowPlayingInfo();
    const isPlaying = info.isPlaying;

    this.isPlayingLocal = !isPlaying;

    if (!this.isPlayingLocal) {
      // Mise en pause : mémoriser la position courante
      this._pausedPos = this.getCurrentPlaybackPosition();
    } else {
      // Reprise de la lecture
      if (this._pausedPos !== undefined) {
        this._localPlayStart = Date.now();
        this._localPlayOffset = this._pausedPos;
        this._pausedPos = undefined;
      }
    }

    this.updateNowPlayingUI();

    if (this.isAlexaSpeaker()) {
      const cmd = isPlaying ? "pause" : "reprends";
      this._hass.callService("media_player", "play_media", {
        entity_id: this.selectedSpeaker,
        media_content_type: "custom",
        media_content_id: cmd
      });
      this._hass.callService("media_player", isPlaying ? "media_pause" : "media_play", {
        entity_id: this.selectedSpeaker
      });
    } else {
      this._hass.callService("media_player", "media_play_pause", {
        entity_id: this.selectedSpeaker
      });
    }
  }

  controlNextTrack() {
    if (!this._hass) return;

    if (this.isSpotifyActive()) {
      this._hass.callService("media_player", "media_next_track", {
        entity_id: this.spotifyPlayer
      });
      return;
    }

    // 1. Si lecture locale NAS / Radio active ou Système Audio local
    if (this.isPlayingLocal || (this.currentNowPlaying && this.currentNowPlaying.title) || this.isLocalSystemSpeaker()) {
      if (this.isAlexaSpeaker()) {
        const spPlus = this._hass.states?.[this.spotifyPlayer];
        if (spPlus && spPlus.state === "playing") {
          this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer });
        }
        if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
          const curIdx = this.nowPlayingCurrentIndex || 0;
          const nextIdx = curIdx + 1;
          if (nextIdx < this.nowPlayingQueue.length) {
            this.nowPlayingCurrentIndex = nextIdx;
            const nextTrack = this.nowPlayingQueue[nextIdx];
            const artist = (Array.isArray(nextTrack.Artists) ? nextTrack.Artists.join(", ") : nextTrack.Artists) || nextTrack.AlbumArtist || "";
            this.currentNowPlaying.title = nextTrack.Name;
            this.currentNowPlaying.artist = artist;
            this.currentNowPlaying.trackId = nextTrack.Id;
            if (nextTrack.RunTimeTicks) {
              this.currentNowPlaying.duration = Math.floor(nextTrack.RunTimeTicks / 10000000);
            }
            this._localPlayStart = Date.now();
            this._localPlayOffset = 0;
            this.loadLyricsForCurrentTrack(nextTrack.Name, artist, nextTrack.Id);
            this.updateNowPlayingUI();
          }
        }
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: "suivant"
        });
        return;
      }

      // DLNA ou Système Audio (Cet appareil)
      if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
        const curIdx = this.nowPlayingCurrentIndex || 0;
        const nextIdx = curIdx + 1;
        if (nextIdx < this.nowPlayingQueue.length) {
          this.nowPlayingCurrentIndex = nextIdx;
          const nextTrack = this.nowPlayingQueue[nextIdx];
          const albumObj = this.selectedAlbum || {
            Id: nextTrack.AlbumId || this.currentNowPlaying?.albumId,
            Name: nextTrack.Album || this.currentNowPlaying?.album || "",
            AlbumArtist: nextTrack.AlbumArtist || ""
          };
          this.castTrack(nextTrack, albumObj);
          return;
        } else {
          this.showToast("🏁 Fin de la file de lecture");
          return;
        }
      }

      if (this._hass && this.selectedSpeaker && !this.isLocalSystemSpeaker()) {
        this._hass.callService("media_player", "media_next_track", {
          entity_id: this.selectedSpeaker
        });
      }
      return;
    }

    if (this._hass && this.selectedSpeaker && !this.isLocalSystemSpeaker()) {
      this._hass.callService("media_player", "media_next_track", {
        entity_id: this.selectedSpeaker
      });
    }
  }

  controlPreviousTrack() {
    if (!this._hass) return;

    if (this.isSpotifyActive()) {
      this._hass.callService("media_player", "media_previous_track", {
        entity_id: this.spotifyPlayer
      });
      return;
    }

    // 1. Si lecture locale NAS / Radio active ou Système Audio local
    if (this.isPlayingLocal || (this.currentNowPlaying && this.currentNowPlaying.title) || this.isLocalSystemSpeaker()) {
      if (this.isAlexaSpeaker()) {
        const spPlus = this._hass.states?.[this.spotifyPlayer];
        if (spPlus && spPlus.state === "playing") {
          this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer });
        }
        if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
          const curIdx = this.nowPlayingCurrentIndex || 0;
          const prevIdx = curIdx - 1;
          if (prevIdx >= 0) {
            this.nowPlayingCurrentIndex = prevIdx;
            const prevTrack = this.nowPlayingQueue[prevIdx];
            const artist = (Array.isArray(prevTrack.Artists) ? prevTrack.Artists.join(", ") : prevTrack.Artists) || prevTrack.AlbumArtist || "";
            this.currentNowPlaying.title = prevTrack.Name;
            this.currentNowPlaying.artist = artist;
            this.currentNowPlaying.trackId = prevTrack.Id;
            if (prevTrack.RunTimeTicks) {
              this.currentNowPlaying.duration = Math.floor(prevTrack.RunTimeTicks / 10000000);
            }
            this._localPlayStart = Date.now();
            this._localPlayOffset = 0;
            this.loadLyricsForCurrentTrack(prevTrack.Name, artist, prevTrack.Id);
            this.updateNowPlayingUI();
          }
        }
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: "précédent"
        });
        return;
      }

      // DLNA ou Système Audio (Cet appareil)
      if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
        const curIdx = this.nowPlayingCurrentIndex || 0;
        const prevIdx = curIdx - 1;
        if (prevIdx >= 0) {
          this.nowPlayingCurrentIndex = prevIdx;
          const prevTrack = this.nowPlayingQueue[prevIdx];
          const albumObj = this.selectedAlbum || {
            Id: prevTrack.AlbumId || this.currentNowPlaying?.albumId,
            Name: prevTrack.Album || this.currentNowPlaying?.album || "",
            AlbumArtist: prevTrack.AlbumArtist || ""
          };
          this.castTrack(prevTrack, albumObj);
          return;
        }
      }

      if (this._hass && this.selectedSpeaker && !this.isLocalSystemSpeaker()) {
        this._hass.callService("media_player", "media_previous_track", {
          entity_id: this.selectedSpeaker
        });
      }
      return;
    }

    this._hass.callService("media_player", "media_previous_track", {
      entity_id: this.selectedSpeaker
    });
  }

  controlSeekRelative(seconds) {
    if (!this._hass) return;
    const isSpotifyActive = this.isSpotifyActive();

    if (isSpotifyActive) {
      const pos = this.getCurrentPlaybackPosition();
      const spState = this._hass.states?.[this.spotifyPlayer];
      const dur = spState?.attributes?.media_duration || 9999;
      const newPos = Math.max(0, Math.min(dur, pos + seconds));
      this._hass.callService("media_player", "media_seek", {
        entity_id: this.spotifyPlayer,
        seek_position: newPos
      });
      return;
    }

    const speaker = this._hass.states?.[this.selectedSpeaker];
    const pos = this.getCurrentPlaybackPosition();
    const dur = this.currentNowPlaying?.duration || speaker?.attributes?.media_duration || 9999;
    const newPos = Math.max(0, Math.min(dur, pos + seconds));

    this._localPlayOffset = newPos;
    this._localPlayStart = Date.now();
    this._seekOverridePos = newPos;
    this._seekOverrideTime = Date.now();
    if (this._pausedPos !== undefined) {
      this._pausedPos = newPos;
    }
    this.tickPlayback();

    if (this.isLocalSystemSpeaker()) {
      const audio = this.getLocalAudio();
      const maxDur = (audio && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0)
        ? audio.duration
        : (this.currentNowPlaying?.duration || 0);
      if (audio) {
        audio.currentTime = maxDur > 0 ? Math.max(0, Math.min(maxDur, newPos)) : Math.max(0, newPos);
      }
      return;
    }

    if (this.isAlexaSpeaker()) {
      const cmd = seconds > 0 
        ? `avance de ${Math.abs(seconds)} secondes`
        : `recule de ${Math.abs(seconds)} secondes`;
      this._hass.callService("media_player", "play_media", {
        entity_id: this.selectedSpeaker,
        media_content_type: "custom",
        media_content_id: cmd
      });
    } else {
      this._hass.callService("media_player", "media_seek", {
        entity_id: this.selectedSpeaker,
        seek_position: newPos
      });
    }
  }

  controlSeekAbsolute(seekSec) {
    if (!this._hass) return;
    const isSpotifyActive = this.isSpotifyActive();

    if (isSpotifyActive) {
      this._hass.callService("media_player", "media_seek", {
        entity_id: this.spotifyPlayer,
        seek_position: seekSec
      });
      return;
    }

    this._localPlayStart = Date.now();
    this._localPlayOffset = seekSec;
    this._seekOverridePos = seekSec;
    this._seekOverrideTime = Date.now();
    if (this._pausedPos !== undefined) {
      this._pausedPos = seekSec;
    }
    this.tickPlayback();

    if (this.isLocalSystemSpeaker()) {
      const audio = this.getLocalAudio();
      const maxDur = (audio && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0)
        ? audio.duration
        : (this.currentNowPlaying?.duration || 0);
      if (audio) {
        audio.currentTime = maxDur > 0 ? Math.max(0, Math.min(maxDur, seekSec)) : Math.max(0, seekSec);
      }
      return;
    }

    if (this.isAlexaSpeaker()) {
      // Alexa skill ne supporte pas media_seek, le suivi local est garanti
    } else {
      this._hass.callService("media_player", "media_seek", {
        entity_id: this.selectedSpeaker,
        seek_position: seekSec
      });
    }
  }

  async castAlbum(item, shuffle = false) {
    if (!this._hass || !item) return;
    this._lastPlayedAlbum = item;

    if (shuffle) this.isShuffle = true;

    const itemId = item.Id || item.id;
    const itemName = item.Name || item.name || "";
    let itemArtist = item.AlbumArtist || item.artist || (item.Artists && item.Artists[0]) || "";
    if (typeof itemArtist === "string" && (itemArtist.includes(";") || itemArtist.includes(","))) {
      itemArtist = itemArtist.split(/[,;]/)[0].trim();
    }
    const coverUrl = item.coverUrl || `${this.jellyfinUrl}/Items/${itemId}/Images/Primary?maxWidth=300`;

    this.currentNowPlaying = {
      title: itemName,
      artist: itemArtist,
      album: itemName,
      cover: coverUrl,
      trackId: itemId,
      duration: 0
    };

    this.isPlayingLocal = true;
    this._localPlayStart = this.isAlexaSpeaker() ? (Date.now() + 5500) : (Date.now() + 1500);
    this._localPlayOffset = 0;

    // Reset queue if playing a new album so stale tracks from previous album don't persist
    const currentAlbId = this.selectedAlbum?.Id || this.selectedAlbum?.id;
    if (currentAlbId !== itemId) {
      this.nowPlayingQueue = [];
      this.albumTracks = [];
    }
    this.selectedAlbum = item;

    // Charger les pistes et paroles en arrière-plan pour peupler la file et les paroles
    if ((this.selectedAlbum?.Id === itemId || this.selectedAlbum?.id === itemId) && this.albumTracks && this.albumTracks.length > 0) {
      this.nowPlayingQueue = [...this.albumTracks];
      if (shuffle && this.nowPlayingQueue.length > 1) {
        for (let i = this.nowPlayingQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.nowPlayingQueue[i], this.nowPlayingQueue[j]] = [this.nowPlayingQueue[j], this.nowPlayingQueue[i]];
        }
      }
      this.nowPlayingCurrentIndex = 0;
      const first = this.nowPlayingQueue[0];
      let artist = (Array.isArray(first.Artists) ? (first.Artists[0].Name || first.Artists[0]) : null)
        || (first.ArtistItems && first.ArtistItems.length > 0 ? first.ArtistItems[0].Name : null)
        || (first.AlbumArtist && first.AlbumArtist !== "Various Artists" ? first.AlbumArtist : null)
        || (first.artist && first.artist !== "Various Artists" ? first.artist : null)
        || itemArtist
        || "";
      if (typeof artist === "string" && (artist.includes(";") || artist.includes(","))) {
        artist = artist.split(/[,;]/)[0].trim();
      }
      this.currentNowPlaying.title = first.Name || first.name;
      this.currentNowPlaying.artist = artist;
      this.currentNowPlaying.trackId = first.Id || first.id;
      if (first.RunTimeTicks) {
        this.currentNowPlaying.duration = Math.floor(first.RunTimeTicks / 10000000);
      }
      this._loadedTrackId = first.Id || first.id;
      this._lastTrackTitle = first.Name || first.name;
      try {
        localStorage.setItem("nas_music_active_meta", JSON.stringify(this.currentNowPlaying));
      } catch(e) {}
      this.loadLyricsForCurrentTrack(first.Name || first.name, artist, first.Id || first.id);
    } else {
      await this.fetchAlbumTracksAndLyrics(item, shuffle);
    }

    this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
    this.currentView = "nowplaying";
    this.activeCategory = "nowplaying";
    this.render();

    if (this.isLocalSystemSpeaker()) {
      if ((this.selectedAlbum?.Id === itemId || this.selectedAlbum?.id === itemId) && this.albumTracks && this.albumTracks.length > 0) {
        this.nowPlayingQueue = [...this.albumTracks];
        if (shuffle && this.nowPlayingQueue.length > 1) {
          for (let i = this.nowPlayingQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.nowPlayingQueue[i], this.nowPlayingQueue[j]] = [this.nowPlayingQueue[j], this.nowPlayingQueue[i]];
          }
        }
        this.nowPlayingCurrentIndex = 0;
        this.castTrack(this.nowPlayingQueue[0], item);
      } else {
        await this.fetchAlbumTracksAndLyrics(item, shuffle);
        if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
          this.castTrack(this.nowPlayingQueue[0], item);
        }
      }
      this.showToast(`🎶 Lecture sur cet appareil : ${itemName}${shuffle ? ' (Aléatoire 🔀)' : ''}`);
      return;
    }

    if (window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio.pause();
    }

    if (this.isDlnaSpeaker()) {
      this._hass.callService("media_player", "media_stop", {
        entity_id: this.selectedSpeaker
      });

      setTimeout(() => {
        if (this.selectedSpeaker === "media_player.sonoro_cuisine") {
          const isPlaylist = item.Type === "Playlist";
          const uri = item.Id ? `jellyfin--GRvzKL7Q://${isPlaylist ? "playlist" : "album"}/${item.Id}` : `library://album/${encodeURIComponent(item.Name)}`;
          this._hass.callService("mass", "play_media", {
            entity_id: this.selectedSpeaker,
            media_id: [uri],
            enqueue: "replace"
          });
        } else {
          this._hass.callService("media_player", "play_media", {
            entity_id: this.selectedSpeaker,
            media_content_type: "music",
            media_content_id: `${this.jellyfinUrl}/Audio/${item.Id}/stream.mp3?static=true&api_key=${this.jellyfinToken}`,
            extra: {
              title: item.Name,
              thumb: `${this.jellyfinUrl}/Items/${item.Id}/Images/Primary?maxWidth=300`
            }
          });
        }
        if (shuffle) {
          this._hass.callService("media_player", "shuffle_set", {
            entity_id: this.selectedSpeaker,
            shuffle: true
          });
        }
      }, 250);

      this.showToast(`🎶 Diffusion DLNA sur Sonoro Cuisine : ${item.Name}${shuffle ? ' (Aléatoire 🔀)' : ''}`);
      return;
    }

    // --- ENCEINTE ALEXA ---
    const cmd = item.cmd || item.customCmd || buildVoiceCmd(item);
    this.castAlexa(cmd);
    if (shuffle) {
      setTimeout(() => {
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "custom",
          media_content_id: "active la lecture aléatoire"
        });
        this._hass.callService("media_player", "shuffle_set", {
          entity_id: this.selectedSpeaker,
          shuffle: true
        });
      }, 1500);
    }
  }

  castTrack(trackItem, albumItem) {
    if (!this._hass || !trackItem) return;
    this._lastPlayedTrack = trackItem;
    this._lastPlayedAlbum = albumItem;

    const trackName = trackItem.Name || trackItem.name || "";
    const trackId = trackItem.Id || trackItem.id;
    const albumId = albumItem?.Id || albumItem?.id || trackItem.AlbumId || trackId;
    const coverUrl = `${this.jellyfinUrl}/Items/${albumId}/Images/Primary?maxWidth=300`;
    const trackArtist = (trackItem.Artists && trackItem.Artists.length > 0 ? (trackItem.Artists[0].Name || trackItem.Artists[0]) : null)
      || (trackItem.ArtistItems && trackItem.ArtistItems.length > 0 ? trackItem.ArtistItems[0].Name : null)
      || (trackItem.AlbumArtist && trackItem.AlbumArtist !== "Various Artists" ? trackItem.AlbumArtist : null)
      || (trackItem.artist && trackItem.artist !== "Various Artists" ? trackItem.artist : null)
      || (albumItem?.AlbumArtist && albumItem.AlbumArtist !== "Various Artists" ? albumItem.AlbumArtist : "")
      || (albumItem?.artist && albumItem.artist !== "Various Artists" ? albumItem.artist : "")
      || "";

    this.currentNowPlaying = {
      title: trackName,
      artist: trackArtist,
      album: albumItem?.Name || albumItem?.name || "",
      cover: coverUrl,
      trackId: trackId,
      duration: trackItem.RunTimeTicks ? Math.floor(trackItem.RunTimeTicks / 10000000) : 0
    };

    this.isPlayingLocal = true;
    this._loadedTrackId = trackId;
    this._lastTrackTitle = trackName;
    this._localPlayStart = this.isAlexaSpeaker() ? (Date.now() + 5500) : (Date.now() + 1500);
    this._localPlayOffset = 0;
    this._pausedPos = undefined;

    if ((!this.nowPlayingQueue || this.nowPlayingQueue.length === 0) && this.albumTracks && this.albumTracks.length > 0) {
      this.nowPlayingQueue = [...this.albumTracks];
    }
    if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
      const idx = this.nowPlayingQueue.findIndex(t => (t.Id || t.id) === trackId);
      if (idx !== -1) this.nowPlayingCurrentIndex = idx;
    }

    try {
      localStorage.setItem("nas_music_active_meta", JSON.stringify(this.currentNowPlaying));
    } catch(e) {}
    window.dispatchEvent(new CustomEvent("nas-music-track-changed", { detail: this.currentNowPlaying }));

    this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
    this.currentView = "nowplaying";
    this.activeCategory = "nowplaying";
    this.render();
    this.loadLyricsForCurrentTrack(trackName, trackArtist, trackId);

    if (this.isLocalSystemSpeaker()) {
      const spPlus = this._hass?.states?.[this.spotifyPlayer];
      const spOfficial = this._hass?.states?.["media_player.spotify_alaindaix"];
      if (spPlus?.state === "playing") {
        this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer }).catch(() => {});
      }
      if (spOfficial?.state === "playing") {
        this._hass.callService("media_player", "media_pause", { entity_id: "media_player.spotify_alaindaix" }).catch(() => {});
      }
      if (this._hass?.states?.["media_player.systeme_audio"]?.state === "playing") {
        this._hass.callService("media_player", "media_pause", { entity_id: "media_player.systeme_audio" }).catch(() => {});
      }

      const audio = this.getLocalAudio();
      audio._endedHandled = false;
      const streamUrl = `${this.jellyfinUrl}/Audio/${trackId}/stream.mp3?static=true&api_key=${this.jellyfinToken}`;
      audio.src = streamUrl;
      audio.play().then(() => {
        this.isPlayingLocal = true;
        this.updateNowPlayingUI();
      }).catch(e => {
        console.warn("Local audio autoplay prevented:", e);
        this.showToast("⚠️ Cliquez sur ▶ pour autoriser la lecture");
      });
      this.setupMediaSession(this.currentNowPlaying);
      this.showToast(`🎶 Lecture sur cet appareil : ${trackName}`);
      return;
    }

    if (window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio.pause();
    }

    if (this.isDlnaSpeaker()) {
      this._hass.callService("media_player", "media_stop", {
        entity_id: this.selectedSpeaker
      });

      setTimeout(() => {
        const trackId = trackItem.Id;
        const albumId = albumItem?.Id || trackId;
        const streamUrl = `${this.jellyfinUrl}/Audio/${trackId}/stream.mp3?static=true&api_key=${this.jellyfinToken}`;
        
        this._hass.callService("media_player", "play_media", {
          entity_id: this.selectedSpeaker,
          media_content_type: "music",
          media_content_id: streamUrl,
          extra: {
            title: trackItem.Name,
            thumb: `${this.jellyfinUrl}/Items/${albumId}/Images/Primary?maxWidth=300`,
            media_metadata: {
              artist: trackArtist
            }
          }
        });
      }, 250);

      this.showToast(`🎶 Lecture DLNA : ${trackItem.Name}`);
    } else {
      const trackName = normalizeLookalikes(trackItem.Name || trackItem.name || "")
        .replace(/^\d+[\s.-]+/, "")
        .replace(/[\[\]()":/]/g, " ")
        .replace(/&/g, " et ")
        .replace(/\s+/g, " ")
        .trim();
      const validArtist = (trackArtist && !/various|compilation|plusieurs|inconnu/i.test(trackArtist))
        ? normalizeLookalikes(trackArtist).replace(/[\[\]()":/]/g, " ").replace(/&/g, " et ").replace(/\s+/g, " ").trim()
        : "";
      const cmd = `demande à mon nas de jouer le titre ${trackName}${validArtist ? " de " + validArtist : ""}`;
      this.castAlexa(cmd);
    }
  }

  castAlexa(cmd) {
    if (!this._hass) return;
    if (this._lastCastTime && Date.now() - this._lastCastTime < 800) {
      console.warn("Ignored rapid duplicate cast command:", cmd);
      return;
    }
    this._lastCastTime = Date.now();
    this.isPlayingLocal = true;
    this._localPlayStart = Date.now() + 5500;
    this._localPlayOffset = 0;
    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    if (speakerObj && speakerObj.zone) {
      this._hass.callService("input_select", "select_option", {
        entity_id: "input_select.zone_ecoute_multimedia",
        option: speakerObj.zone
      });
    }

    // Libérer complètement l'enceinte Echo et stopper Spotify Connect
    const spState = this._hass.states?.[this.selectedSpeaker];
    if (spState && (spState.state === "playing" || spState.attributes?.app_name === "Spotify")) {
      this._hass.callService("media_player", "media_stop", { entity_id: this.selectedSpeaker });
    }
    if (this.selectedSpeaker !== "media_player.partout") {
      const partoutState = this._hass.states?.["media_player.partout"];
      if (partoutState && (partoutState.state === "playing" || partoutState.state === "paused")) {
        this._hass.callService("media_player", "media_stop", { entity_id: "media_player.partout" });
      }
    }
    if (spState?.attributes?.is_volume_muted) {
      this._hass.callService("media_player", "volume_mute", { entity_id: this.selectedSpeaker, is_volume_muted: false });
    }
    if (spState?.attributes?.volume_level !== undefined && spState.attributes.volume_level <= 0.05) {
      this._hass.callService("media_player", "volume_set", { entity_id: this.selectedSpeaker, volume_level: 0.25 });
    }
    const spAlain = this._hass.states?.["media_player.spotify_alaindaix"];
    if (spAlain && spAlain.state === "playing") {
      this._hass.callService("media_player", "media_pause", { entity_id: "media_player.spotify_alaindaix" });
    }
    const spPlus = this._hass.states?.[this.spotifyPlayer];
    if (spPlus && spPlus.state === "playing") {
      this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer });
    }

    if (window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio.pause();
    }

    setTimeout(() => {
      this._hass.callService("media_player", "play_media", {
        entity_id: this.selectedSpeaker,
        media_content_type: "custom",
        media_content_id: cmd
      });
    }, 450);

    // Vérification de la réponse Alexa : si Alexa renvoie une erreur, annuler la lecture locale et les paroles
    if (this._alexaCheckTimer) clearTimeout(this._alexaCheckTimer);
    const targetSpeaker = this.selectedSpeaker;
    const castTime = Date.now();
    this._alexaCheckTimer = setTimeout(() => {
      if (!this._hass) return;
      const sp = this._hass.states?.[targetSpeaker];
      const resp = sp?.attributes?.last_called_response;
      const ts = sp?.attributes?.last_called_timestamp || 0;
      if (resp && ts >= castTime - 1000) {
        const lower = resp.toLowerCase();
        if (lower.includes("pas fourni de réponse") || lower.includes("problème") || lower.includes("désolé") || lower.includes("erreur")) {
          this.isPlayingLocal = false;
          this._localPlayStart = 0;
          this.showToast(`⚠️ Alexa : ${resp}`);
          this.updateNowPlayingUI();
          this.render();
        }
      }
    }, 7000);

    this.showToast(`🎶 Diffusion Alexa : ${cmd}`);
  }

  castRadio(radioItem) {
    if (!this._hass || !radioItem) return;
    this._lastPlayedRadio = radioItem;
    try {
      localStorage.setItem("nas_music_last_radio", JSON.stringify(radioItem));
    } catch(e) {}

    this.currentNowPlaying = {
      title: radioItem.label || radioItem.name,
      artist: "Radio en direct",
      album: "Radios Françaises",
      cover: radioItem.icon,
      trackId: null,
      duration: 0
    };
    try {
      localStorage.setItem("nas_music_active_meta", JSON.stringify(this.currentNowPlaying));
    } catch(e) {}
    window.dispatchEvent(new CustomEvent("nas-music-track-changed", { detail: this.currentNowPlaying }));

    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    if (speakerObj && speakerObj.zone) {
      this._hass.callService("input_select", "select_option", {
        entity_id: "input_select.zone_ecoute_multimedia",
        option: speakerObj.zone
      });
    }

    // Basculer sur la vue en lecture pour afficher immédiatement la radio et ses contrôles
    this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
    this.currentView = "nowplaying";
    this.activeCategory = "nowplaying";
    this.render();

    if (this.isLocalSystemSpeaker()) {
      const audio = this.getLocalAudio();
      audio.src = radioItem.streamUrl;
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn("Local audio autoplay prevented:", e);
        this.showToast("⚠️ Cliquez sur ▶ pour autoriser la lecture");
      });
      this.setupMediaSession(this.currentNowPlaying);
      this.showToast(`📻 Radio en direct sur cet appareil : ${radioItem.label || radioItem.name}`);
      return;
    }

    if (window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio.pause();
    }

    if (this.isDlnaSpeaker()) {
      // Diffusion DLNA pour Sonoro Cuisine
      this._hass.callService("media_player", "media_stop", {
        entity_id: this.selectedSpeaker
      });

      setTimeout(() => {
        if (this.selectedSpeaker === "media_player.sonoro_cuisine") {
          // Music Assistant résout la radio TuneIn en direct
          this._hass.callService("media_player", "play_media", {
            entity_id: this.selectedSpeaker,
            media_content_type: "radio",
            media_content_id: radioItem.name,
            extra: {
              title: radioItem.label || radioItem.name,
              thumb: radioItem.icon
            }
          });
        } else {
          // Stream direct MP3 pour DLNA DMR
          this._hass.callService("media_player", "play_media", {
            entity_id: this.selectedSpeaker,
            media_content_type: "music",
            media_content_id: radioItem.streamUrl,
            extra: {
              title: radioItem.label || radioItem.name,
              thumb: radioItem.icon
            }
          });
        }
      }, 250);

      this.showToast(`📻 Radio DLNA en direct : ${radioItem.label || radioItem.name}`);
    } else {
      // Diffusion Amazon Echo (par provider configuré pour cette radio : tunein, audioplayer ou radioplayer)
      const prov = radioItem.provider || ((radioItem.name || "").toLowerCase().includes("rfm") || (radioItem.name || "").toLowerCase().includes("jazz") ? "tunein" : (this.radioProvider || "audioplayer"));
      let radioCmd = "";
      let providerLabel = "Radioplayer";
      if (prov === "tunein") {
        radioCmd = `joue la radio ${radioItem.name} sur TuneIn`;
        providerLabel = "TuneIn";
      } else if (prov === "audioplayer") {
        radioCmd = `demande à Audio Player de jouer ${radioItem.name}`;
        providerLabel = "Audio Player";
      } else {
        radioCmd = `demande à Radioplayer de jouer ${radioItem.name}`;
        providerLabel = "Radioplayer";
      }

      this.isPlayingLocal = true;
      this._localPlayStart = Date.now() + 5500;
      this._localPlayOffset = 0;

      // Stopper Spotify si actif pour libérer l'enceinte Echo
      const spAlain = this._hass.states?.["media_player.spotify_alaindaix"];
      if (spAlain && spAlain.state === "playing") {
        this._hass.callService("media_player", "media_pause", { entity_id: "media_player.spotify_alaindaix" });
      }
      const spPlus = this._hass.states?.[this.spotifyPlayer];
      if (spPlus && spPlus.state === "playing") {
        this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer });
      }

      if (this.selectedSpeaker !== "media_player.partout") {
        const partoutState = this._hass.states?.["media_player.partout"];
        if (partoutState && (partoutState.state === "playing" || partoutState.state === "paused")) {
          this._hass.callService("media_player", "media_stop", { entity_id: "media_player.partout" });
        }
      }

      const spState = this._hass.states?.[this.selectedSpeaker];
      if (spState?.attributes?.is_volume_muted) {
        this._hass.callService("media_player", "volume_mute", { entity_id: this.selectedSpeaker, is_volume_muted: false });
      }
      if (spState?.attributes?.volume_level !== undefined && spState.attributes.volume_level <= 0.05) {
        this._hass.callService("media_player", "volume_set", { entity_id: this.selectedSpeaker, volume_level: 0.25 });
      }

      if (window._nasMusicLocalAudio) {
        window._nasMusicLocalAudio.pause();
      }

      this._hass.callService("media_player", "play_media", {
        entity_id: this.selectedSpeaker,
        media_content_type: "custom",
        media_content_id: radioCmd
      });

      this.showToast(`📻 Radio en direct (${providerLabel}) : ${radioItem.label || radioItem.name}`);
    }
  }

  showToast(msg) {
    if (!this.shadowRoot) return;
    const toast = this.shadowRoot.getElementById("card-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      const t = this.shadowRoot?.getElementById("card-toast");
      if (t) t.classList.remove("show");
      this._toastTimer = null;
    }, 2800);
  }

  formatSeconds(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const sec = Math.floor(seconds);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  getNowPlayingInfo() {
    const speaker = this._hass?.states[this.selectedSpeaker];
    const nasSensor = this._hass?.states["sensor.nas_music_now_playing"];
    const spState = this._hass?.states[this.spotifyPlayer];

    const isSpotifyActive = this.isSpotifyActive();
    const isLocalSystem = this.isLocalSystemSpeaker();

    let isLocalPlaying = false;
    let localDuration = 0;
    if (isLocalSystem && !isSpotifyActive) {
      const audio = this.getLocalAudio();
      isLocalPlaying = !audio.paused && (audio.currentTime > 0 || audio.readyState > 0);
      if (this.currentNowPlaying?.duration) {
        localDuration = this.currentNowPlaying.duration;
      } else if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        localDuration = Math.floor(audio.duration);
      }
    }

    // Si sensor.nas_music_now_playing joue ou audio local joue, la session NAS est active
    if (nasSensor?.state === "playing" || isLocalPlaying) {
      this.isPlayingLocal = true;
    } else if (isSpotifyActive) {
      this.isPlayingLocal = false;
    } else if (!isLocalSystem && speaker && (speaker.state === "idle" || speaker.state === "off" || speaker.state === "standby")) {
      this.isPlayingLocal = false;
    }

    // 0. Ensure active metadata is restored from localStorage if memory state is empty
    if (!this.currentNowPlaying?.title) {
      try {
        const stored = localStorage.getItem("nas_music_active_meta");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.title) {
            this.currentNowPlaying = parsed;
            this.isPlayingLocal = true;
          }
        }
      } catch(e) {}
    }

    const hasNasMeta = !!(this.currentNowPlaying?.title && this.currentNowPlaying.artist !== "Radio en direct");
    const isNasSensorPlaying = nasSensor && nasSensor.state === "playing";
    const isNasPlaying = !isSpotifyActive && (isNasSensorPlaying || isLocalPlaying || (this.isPlayingLocal && speaker?.state !== "off" && speaker?.state !== "standby"));

    let isRadioResidual = false;
    let isPlaying = isSpotifyActive ? (spState?.state === "playing" || speaker?.state === "playing") : (isLocalPlaying || isNasPlaying || speaker?.state === "playing");
    let mediaTitle = null;
    let mediaArtist = null;
    let mediaAlbum = null;
    let coverUrl = null;
    let duration = localDuration || 0;
    let curPos = 0;
    let trackId = null;

    // 1. SI SPOTIFY EST ACTIF : Priorité absolue aux métadonnées Spotify
    if (isSpotifyActive) {
      const activeState = (spState?.state === "playing" || !speaker?.attributes?.media_title) ? spState : speaker;
      mediaTitle = activeState?.attributes?.media_title || speaker?.attributes?.media_title;
      mediaArtist = activeState?.attributes?.media_artist || speaker?.attributes?.media_artist || "";
      mediaAlbum = activeState?.attributes?.media_album_name || speaker?.attributes?.media_album_name || "";
      coverUrl = activeState?.attributes?.sp_nowplaying_image_url || speaker?.attributes?.entity_picture || activeState?.attributes?.entity_picture;
      duration = activeState?.attributes?.media_duration || speaker?.attributes?.media_duration || 0;
      curPos = this.getCurrentPlaybackPosition();
    } else if (isLocalSystem) {
      // 2. SI SYSTÈME AUDIO (CET APPAREIL) EST SÉLECTIONNÉ : Priorité absolue aux métadonnées locales NAS/Radio !
      // JAMAIS de fallback sur speaker.attributes.media_title (qui contient de vieilles métadonnées résiduelles de l'entité Alexa)
      if (this.currentNowPlaying?.title) {
        mediaTitle = this.currentNowPlaying.title;
        mediaArtist = this.currentNowPlaying.artist || "";
        mediaAlbum = this.currentNowPlaying.album || "";
        coverUrl = this.currentNowPlaying.cover;
        trackId = this.currentNowPlaying.trackId;
        if (!duration && this.currentNowPlaying.duration) duration = this.currentNowPlaying.duration;
      }

      if (!mediaTitle && this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
        const qIdx = this.nowPlayingCurrentIndex || 0;
        const qItem = this.nowPlayingQueue[qIdx] || this.nowPlayingQueue[0];
        if (qItem) {
          mediaTitle = qItem.Name || qItem.name;
          mediaArtist = (Array.isArray(qItem.Artists) ? qItem.Artists.join(", ") : qItem.Artists) || qItem.AlbumArtist || qItem.artist || "";
          mediaAlbum = qItem.Album || this.selectedAlbum?.Name || this.selectedAlbum?.name || "";
          trackId = qItem.Id || qItem.id;
          if (!duration && qItem.RunTimeTicks) duration = Math.floor(qItem.RunTimeTicks / 10000000);
          if (!coverUrl) {
            const albId = qItem.AlbumId || this.selectedAlbum?.Id || this.selectedAlbum?.id || trackId;
            coverUrl = `${this.jellyfinUrl}/Items/${albId}/Images/Primary?maxWidth=300`;
          }
        }
      }

      if (!mediaTitle) {
        try {
          const stored = localStorage.getItem("nas_music_active_meta");
          if (stored) {
            const meta = JSON.parse(stored);
            if (meta?.title) {
              mediaTitle = meta.title;
              mediaArtist = meta.artist || "";
              mediaAlbum = meta.album || "";
              if (meta.cover) coverUrl = meta.cover;
              if (meta.duration && !duration) duration = meta.duration;
              if (meta.trackId) trackId = meta.trackId;
            }
          }
        } catch(e) {}
      }

      curPos = this.getCurrentPlaybackPosition();
    } else {
      // 3. SI ENCEINTE RÉSEAU / ALEXA / DLNA
      const spTitle = speaker?.attributes?.media_title;
      const spArtist = speaker?.attributes?.media_artist;
      const spAlbum = speaker?.attributes?.media_album_name;
      const spPic = speaker?.attributes?.entity_picture;
      const spDuration = speaker?.attributes?.media_duration;

      // Détecter si le titre rapporté par Home Assistant est une radio (ex: RTL, RFM, etc.)
      const isReportedRadio = spTitle && this.getRadios().some(r =>
        (r.name && r.name.toLowerCase() === spTitle.toLowerCase()) ||
        (r.label && r.label.toLowerCase() === spTitle.toLowerCase())
      );

      // Si l'enceinte rapporte une radio mais qu'elle est en état "paused", ou si l'utilisateur écoute du NAS :
      // C'est un artefact résiduel de session radio antérieure (ex: RTL en pause depuis 1h sur l'Echo) !
      isRadioResidual = isReportedRadio && (speaker?.state === "paused" || hasNasMeta || this.isPlayingLocal);

      // Le média rapporté par l'enceinte n'est considéré actif que s'il joue réellement et n'est pas un résidu radio
      const spIsPlaying = speaker?.state === "playing";
      const spIsActiveReal = spTitle && spTitle !== "None" && spTitle !== "idle" && spTitle !== "Aucun morceau en cours" && (spIsPlaying ? !isRadioResidual : (!isReportedRadio && speaker?.state === "paused"));

      if (this.isAlexaSpeaker() && nasSensor && nasSensor.state === "playing" && nasSensor.attributes?.title) {
        mediaTitle = nasSensor.attributes.title;
        mediaArtist = nasSensor.attributes.artist || "";
        if (nasSensor.attributes.track_id) trackId = nasSensor.attributes.track_id;
      } else if (spIsActiveReal && !hasNasMeta) {
        // Priorité : l'enceinte rapporte un titre réel en cours de lecture
        mediaTitle = spTitle;
        mediaArtist = spArtist || "";
        mediaAlbum = spAlbum || "";
        coverUrl = spPic;
        duration = spDuration || 0;
      } else if (hasNasMeta || this.isPlayingLocal || (this.currentNowPlaying && this.currentNowPlaying.title)) {
        // Métadonnées NAS prioritaires !
        if (this.currentNowPlaying?.title) {
          mediaTitle = this.currentNowPlaying.title;
          mediaArtist = this.currentNowPlaying.artist || "";
          mediaAlbum = this.currentNowPlaying.album || "";
          coverUrl = this.currentNowPlaying.cover;
          trackId = this.currentNowPlaying.trackId;
          duration = this.currentNowPlaying.duration || 0;
        }

        if (!mediaTitle && this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
          const qIdx = this.nowPlayingCurrentIndex || 0;
          const qItem = this.nowPlayingQueue[qIdx] || this.nowPlayingQueue[0];
          if (qItem) {
            mediaTitle = qItem.Name || qItem.name;
            mediaArtist = (Array.isArray(qItem.Artists) ? qItem.Artists.join(", ") : qItem.Artists) || qItem.AlbumArtist || qItem.artist || "";
            mediaAlbum = qItem.Album || this.selectedAlbum?.Name || this.selectedAlbum?.name || "";
            trackId = qItem.Id || qItem.id;
            if (qItem.RunTimeTicks) duration = Math.floor(qItem.RunTimeTicks / 10000000);
          }
        }
      } else if (spTitle && spTitle !== "None" && spTitle !== "idle" && spTitle !== "Aucun morceau en cours" && !isRadioResidual) {
        mediaTitle = spTitle;
        mediaArtist = spArtist || "";
        mediaAlbum = spAlbum || "";
        coverUrl = spPic;
        duration = spDuration || 0;
      }

      // Si le média est une radio connue, enrichir les labels et logo si nécessaire
      if (mediaTitle) {
        const cleanT = mediaTitle.toLowerCase().trim();
        const matchedRadio = this.getRadios().find(r =>
          (r.name && cleanT.includes(r.name.toLowerCase().trim())) ||
          (r.label && cleanT.includes(r.label.toLowerCase().trim()))
        );
        if (matchedRadio) {
          if (!mediaAlbum) mediaAlbum = "Radios Françaises";
          if (!mediaArtist || mediaArtist === cleanT) mediaArtist = "Radio en direct";
          if (!coverUrl) coverUrl = matchedRadio.icon;
        }
      }

      // Synchronize queue index and track metadata ONLY for NAS queue
      if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0 && mediaTitle && mediaTitle !== "Aucun morceau en cours") {
        const cleanT = mediaTitle.toLowerCase().replace(/^\d+[\s.-]+/, "").trim();
        const foundIdx = this.nowPlayingQueue.findIndex(t => {
          const name = t.Name || t.name;
          if (!name) return false;
          const tClean = name.toLowerCase().replace(/^\d+[\s.-]+/, "").trim();
          return tClean === cleanT || tClean.includes(cleanT) || cleanT.includes(tClean);
        });
        if (foundIdx !== -1) {
          this.nowPlayingCurrentIndex = foundIdx;
          const t = this.nowPlayingQueue[foundIdx];
          if (!trackId) trackId = t.Id || t.id;
          if (!duration && t.RunTimeTicks) duration = Math.floor(t.RunTimeTicks / 10000000);
          if (!coverUrl) coverUrl = `${this.jellyfinUrl}/Items/${t.AlbumId || t.Id || t.id}/Images/Primary?maxWidth=300`;
          if (!mediaArtist || mediaArtist === "Artiste inconnu") {
            mediaArtist = (Array.isArray(t.Artists) ? t.Artists.join(", ") : t.Artists) || t.AlbumArtist || t.artist || mediaArtist;
          }
        }
      }

      curPos = this.getCurrentPlaybackPosition();
    }

    if (!coverUrl && this.currentNowPlaying?.cover) {
      coverUrl = this.currentNowPlaying.cover;
    }
    if (!coverUrl && trackId) {
      coverUrl = `${this.jellyfinUrl}/Items/${trackId}/Images/Primary?maxWidth=300`;
    }
    if (!coverUrl) {
      coverUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'><path d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>`;
    } else if (!coverUrl.startsWith("http") && !coverUrl.startsWith("data:") && !coverUrl.startsWith("/")) {
      coverUrl = `/${coverUrl}`;
    }

    return {
      isPlaying,
      isRadioResidual,
      mediaTitle: mediaTitle || "Aucun morceau en cours",
      mediaArtist: mediaArtist || "Artiste inconnu",
      mediaAlbum: mediaAlbum || "",
      coverUrl,
      duration,
      curPos,
      trackId
    };
  }

  async fetchAlbumTracksAndLyrics(item, shuffle = false) {
    try {
      const isPlaylist = item.Type === "Playlist";
      const itemId = item.Id || item.id;
      const itemName = item.Name || item.name || "";
      let itemArtist = item.AlbumArtist || item.artist || (item.Artists && item.Artists[0]) || "";
      if (typeof itemArtist === "string" && (itemArtist.includes(";") || itemArtist.includes(","))) {
        itemArtist = itemArtist.split(/[,;]/)[0].trim();
      }
      const url = isPlaylist
        ? `${this.jellyfinUrl}/Playlists/${itemId}/Items?UserId=${this.jellyfinUser}`
        : `${this.jellyfinUrl}/Users/${this.jellyfinUser}/Items?ParentId=${itemId}&IncludeItemTypes=Audio&Fields=RunTimeTicks,AlbumArtist,Artists`;
      const res = await fetch(url, { headers: { "Authorization": this.authHeader } });
      if (res.ok) {
        const data = await res.json();
        const tracks = data.Items || [];
        if (tracks.length > 0) {
          if (shuffle && tracks.length > 1) {
            for (let i = tracks.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }
          }
          this.nowPlayingQueue = tracks;
          this.albumTracks = tracks;
          this.nowPlayingCurrentIndex = 0;
          const first = tracks[0];
          let artist = (Array.isArray(first.Artists) ? (first.Artists[0].Name || first.Artists[0]) : null)
            || (first.ArtistItems && first.ArtistItems.length > 0 ? first.ArtistItems[0].Name : null)
            || (first.AlbumArtist && first.AlbumArtist !== "Various Artists" ? first.AlbumArtist : null)
            || (first.artist && first.artist !== "Various Artists" ? first.artist : null)
            || itemArtist
            || "";
          if (typeof artist === "string" && (artist.includes(";") || artist.includes(","))) {
            artist = artist.split(/[,;]/)[0].trim();
          }
          this.currentNowPlaying = {
            title: first.Name || first.name,
            artist: artist,
            album: itemName,
            cover: `${this.jellyfinUrl}/Items/${itemId}/Images/Primary?maxWidth=300`,
            trackId: first.Id || first.id,
            duration: first.RunTimeTicks ? Math.floor(first.RunTimeTicks / 10000000) : 0
          };
          this._loadedTrackId = first.Id || first.id;
          this._lastTrackTitle = first.Name || first.name;
          try {
            localStorage.setItem("nas_music_active_meta", JSON.stringify(this.currentNowPlaying));
          } catch(e) {}
          this.loadLyricsForCurrentTrack(first.Name || first.name, artist, first.Id || first.id);
          this.updateNowPlayingUI();
          this.renderNowPlayingTab();
        }
      }
    } catch (e) {
      console.warn("fetchAlbumTracksAndLyrics error:", e);
    }
  }

  getCurrentPlaybackPosition() {
    const syncOffset = this.syncOffset || 0;
    const isSpotifyActive = this.isSpotifyActive();

    // 1. Si Spotify est actif : calculer la position depuis SpotifyPlus ou l'enceinte active
    if (isSpotifyActive) {
      const spState = this._hass?.states?.[this.spotifyPlayer];
      const speaker = this._hass?.states?.[this.selectedSpeaker];
      const targetState = (spState?.state === "playing" || !speaker?.attributes?.media_position) ? spState : speaker;
      if (targetState && typeof targetState.attributes?.media_position === "number") {
        const basePos = targetState.attributes.media_position;
        const updated = targetState.attributes.media_position_updated_at;
        const elapsed = (targetState.state === "playing" && updated) ? Math.max(0, (Date.now() - new Date(updated).getTime()) / 1000) : 0;
        const pos = Math.max(0, basePos + elapsed + syncOffset);
        const dur = targetState.attributes.media_duration || 0;
        return dur > 0 ? Math.min(dur, pos) : pos;
      }
    }

    // 2. Si Système Audio local et PAS Spotify : audio HTML5
    if (this.isLocalSystemSpeaker() && !isSpotifyActive) {
      const audio = this.getLocalAudio();
      if (audio && !isNaN(audio.currentTime)) {
        return Math.max(0, audio.currentTime + syncOffset);
      }
    }

    const speaker = this._hass?.states[this.selectedSpeaker];
    const dur = this.currentNowPlaying?.duration || speaker?.attributes?.media_duration || 0;

    let pos = 0;

    const spTitle = (speaker?.attributes?.media_title || "").toLowerCase().trim();
    const isPlayingNas = this.isPlayingLocal && !this.isSpotifyActive();
    const curTitle = (this.currentNowPlaying?.title || "").toLowerCase().trim();
    const curAlbum = (this.currentNowPlaying?.album || "").toLowerCase().trim();
    const matchesCurrent = !isPlayingNas || !spTitle || spTitle === curTitle || spTitle === curAlbum || (this.nowPlayingQueue && this.nowPlayingQueue.some(t => (t.Name || t.name || "").toLowerCase().trim() === spTitle));

    // 1. Priorité absolue : position matérielle rapportée directement par l'enceinte (Alexa, DLNA ou Spotify) SI le média correspond
    if (matchesCurrent && speaker && (speaker.state === "playing" || speaker.state === "paused") && typeof speaker.attributes?.media_position === "number" && speaker.attributes?.media_position > 0) {
      const basePos = speaker.attributes.media_position;
      const updated = speaker.attributes.media_position_updated_at;
      const elapsed = (speaker.state === "playing" && updated) ? Math.max(0, (Date.now() - new Date(updated).getTime()) / 1000) : 0;
      pos = basePos + elapsed;
    } else if (this._pausedPos !== undefined) {
      pos = this._pausedPos;
    } else if (this._seekOverridePos !== undefined && this._seekOverrideTime && (Date.now() - this._seekOverrideTime < 6000)) {
      pos = this._seekOverridePos + ((Date.now() - this._seekOverrideTime) / 1000);
    } else if (this._localPlayStart) {
      const rawElapsed = (Date.now() - this._localPlayStart) / 1000;
      pos = Math.max(0, rawElapsed) + (this._localPlayOffset || 0);
    } else {
      pos = this._localPlayOffset || 0;
    }

    pos = Math.max(0, pos + syncOffset);
    if (dur > 0) {
      return Math.min(dur, pos);
    }
    return pos;
  }

  formatTicks(ticks) {
    if (!ticks) return "";
    const sec = Math.floor(ticks / 10000000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  render() {
    const isAlbumView = this.currentView === "album" && this.selectedAlbum;
    const isNowPlaying = this.currentView === "nowplaying";
    const speakerList = this.getSpeakers();
    const info = this.getNowPlayingInfo();
    const speaker = this._hass?.states[this.selectedSpeaker];
    const isPlaying = info.isPlaying;
    const isSpeakerActive = info.isPlaying || (speaker && (speaker.state === "playing" || (speaker.state === "paused" && !info.isRadioResidual && info.mediaTitle !== "Aucun morceau en cours")));
    const mediaTitle = info.mediaTitle;
    const mediaArtist = info.mediaArtist;
    const coverUrl = info.coverUrl;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #f3f4f6;
        }
        .nas-card {
          background: #18181b;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        /* HEADER */
        .nas-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 12px 16px !important;
          background: #1f1f23 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          gap: 12px !important;
          flex-wrap: wrap !important;
          min-height: 52px !important;
          box-sizing: border-box !important;
          width: 100% !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .nas-header-title {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          color: #fff !important;
          white-space: nowrap !important;
        }
        .nas-header-title svg {
          width: 20px !important;
          height: 20px !important;
          fill: #3b82f6 !important;
          flex-shrink: 0 !important;
        }
        .speaker-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .speaker-select {
          background: transparent;
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }
        .speaker-select option {
          background: #222;
          color: #fff;
        }
        .vol-slider {
          width: 70px;
          accent-color: #3b82f6;
          cursor: pointer;
        }
        .speaker-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 16px;
          background: #121214;
          font-size: 12px;
          color: #9ca3af;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: background 0.15s;
        }
        .speaker-status-bar:hover {
          background: #1e1e24;
          color: #f3f4f6;
        }
        .status-txt {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
        }
        .status-btns {
          display: flex;
          gap: 6px;
        }
        .icon-btn {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #fff;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.15s;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* SEARCH & FILTER BAR */
        .search-area {
          padding: 12px 16px 8px;
        }
        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-input-wrap span {
          position: absolute;
          left: 12px;
          font-size: 14px;
          color: #6b7280;
        }
        .search-input {
          width: 100%;
          background: #27272a;
          border: 1px solid #3f3f46;
          color: #fff;
          border-radius: 10px;
          padding: 9px 36px 9px 34px;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: #3b82f6;
          background: #2a2a2e;
        }
        .search-clear {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 14px;
        }

        /* PILLS / TABS */
        .tabs-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px 16px 12px;
        }
        .tab-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #d1d5db;
          padding: 5px 11px;
          border-radius: 14px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-pill:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
        .tab-pill.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
          font-weight: 600;
        }
        .tab-pill[data-cat="radios"].active {
          background: #e11d48;
          border-color: #e11d48;
        }
        .tab-pill[data-cat="spotify"].active {
          background: #1db954;
          border-color: #1db954;
        }
        .tab-pill[data-cat="nowplaying"].active {
          background: #10b981;
          border-color: #10b981;
        }

        /* SPOTIFY SUBTABS */
        .spotify-subtabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 2px 10px;
          margin-bottom: 6px;
          scrollbar-width: none;
        }
        .spotify-subtabs::-webkit-scrollbar {
          display: none;
        }
        .sp-subtab-pill {
          padding: 5px 13px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #d1d5db;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .sp-subtab-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }
        .sp-subtab-pill.active {
          background: #1db954;
          color: #fff;
          border-color: #1db954;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(29, 185, 84, 0.4);
        }

        /* CONTENT AREA & SCROLLBAR */
        .content-area {
          padding: 4px 16px 16px;
          min-height: 220px;
          max-height: 520px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .content-area.np-content-area {
          max-height: none;
          overflow: visible;
        }
        .content-area::-webkit-scrollbar {
          width: 6px;
        }
        .content-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .content-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        /* ALBUM GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .card-item {
          background: #222226;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .cover-box {
          width: 100%;
          aspect-ratio: 1/1;
          background: #18181b;
          overflow: hidden;
          position: relative;
        }
        .cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .card-info {
          padding: 8px 10px;
        }
        .card-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-sub {
          font-size: 11px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .play-overlay {
          position: absolute;
          right: 8px;
          bottom: 8px;
          background: #eab308;
          color: #000;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.2s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }
        .card-item:hover .play-overlay {
          opacity: 1;
          transform: scale(1);
        }

        /* RADIO CARD SPECIFICS */
        .radio-box {
          width: 100%;
          aspect-ratio: 1/1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .radio-logo {
          width: 65%;
          height: 65%;
          object-fit: contain;
        }

        /* PAGINATION */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 14px;
        }
        .page-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .page-info {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }

        /* DETAIL VIEW (ALBUM) */
        .album-view {
          padding: 8px 0;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .album-hero {
          display: flex;
          gap: 16px;
          align-items: center;
          background: #222226;
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .album-hero-img {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .album-hero-meta {
          flex: 1;
        }
        .album-hero-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }
        .album-hero-artist {
          font-size: 13px;
          color: #9ca3af;
          margin: 4px 0 10px;
        }
        .cast-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eab308;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
        }
        .cast-btn:hover {
          background: #facc15;
          transform: scale(1.02);
        }
        .track-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 240px;
          overflow-y: auto;
        }
        .track-item {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          font-size: 13px;
          cursor: pointer;
          gap: 8px;
        }
        .track-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .track-item.current-track {
          background: rgba(59, 130, 246, 0.18);
          border-left: 3px solid #3b82f6;
        }
        .track-num {
          width: 24px;
          color: #6b7280;
          font-size: 12px;
        }
        .track-title {
          flex: 1;
          color: #f3f4f6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .track-time {
          color: #6b7280;
          font-size: 12px;
        }

        /* NOW PLAYING VIEW */
        .nowplaying-view {
          padding: 4px 0;
        }
        .nowplaying-hero {
          display: flex;
          gap: 16px;
          background: #222226;
          padding: 16px;
          border-radius: 14px;
          align-items: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .np-cover {
          width: 95px;
          height: 95px;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 6px 16px rgba(0,0,0,0.5);
          background: #111;
        }
        .np-info {
          flex: 1;
          overflow: hidden;
        }
        .np-title {
          font-size: 16.5px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .np-artist {
          font-size: 13.5px;
          color: #fbbf24;
          font-weight: 500;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .np-album {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .np-speaker-badge {
          display: inline-block;
          font-size: 11px;
          background: rgba(255,255,255,0.08);
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 6px;
          color: #d1d5db;
        }
        .np-controls-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 12px 0 8px;
        }
        .np-main-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #eab308;
          color: #000;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
        }
        .np-main-btn:hover {
          background: #facc15;
          transform: scale(1.05);
        }
        .np-sec-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
        }
        .np-sec-btn:hover {
          background: rgba(255,255,255,0.18);
        }
        .np-sec-btn.active-control {
          background: rgba(234, 179, 8, 0.25);
          color: #facc15;
          border: 1px solid rgba(234, 179, 8, 0.6);
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
        }

        /* SUB-TABS: PAROLES & QUEUE */
        .np-subtabs {
          display: flex;
          gap: 8px;
          margin: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 8px;
        }
        .np-subtab-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .np-subtab-btn.active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        /* LYRICS BOX */
        .lyrics-box {
          position: relative;
          height: 220px;
          max-height: 220px;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 95px 14px;
          background: #141416;
          border-radius: 12px;
          text-align: center;
          line-height: 1.8;
          border: 1px solid rgba(255,255,255,0.04);
          scroll-behavior: smooth;
        }
        .lyrics-box::-webkit-scrollbar {
          width: 4px;
        }
        .lyrics-box::-webkit-scrollbar-track {
          background: transparent;
        }
        .lyrics-box::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        .lyric-line {
          font-size: 13.5px;
          color: #9ca3af;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .lyric-line.active-lyric {
          color: #fbbf24;
          font-weight: 700;
          font-size: 15.5px;
          background: rgba(251, 191, 36, 0.1);
        }
        .lyrics-empty {
          text-align: center;
          color: #6b7280;
          padding: 30px 10px;
          font-size: 13px;
        }

                /* PROGRESS BAR & ADVANCE/REWIND */
        .np-progress-section {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px 4px;
        }
        .np-time-label {
          font-size: 11px;
          color: #9ca3af;
          font-variant-numeric: tabular-nums;
          min-width: 32px;
          text-align: center;
        }
        .np-progress-bar {
          flex: 1;
          height: 6px;
          accent-color: #fbbf24;
          cursor: pointer;
          border-radius: 3px;
        }
        .np-skip-btn {
          font-size: 11px;
          font-weight: 700;
          color: #fbbf24;
          width: auto;
          padding: 0 10px;
          border-radius: 14px;
        }

        /* MINI PLAYER BAR */
        .mini-player-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: #1e1e24;
          border-top: 1px solid rgba(251, 191, 36, 0.35);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .mini-player-bar:hover {
          background: #272730;
        }
        .mini-cover {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          object-fit: cover;
          background: #111;
        }
        .mini-info {
          flex: 1;
          overflow: hidden;
        }
        .mini-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mini-artist {
          font-size: 11px;
          color: #fbbf24;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mini-controls {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .mini-btn {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #e4e4e7;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .mini-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .mini-btn-play {
          background: #fbbf24;
          color: #000;
          font-size: 12px;
          font-weight: 700;
        }
        .mini-lyrics-btn {
          border-radius: 12px;
          padding: 4px 8px;
          width: auto;
          font-size: 11px;
          font-weight: 600;
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        /* RADIO MANAGER HEADER BUTTON */
        .radio-mgr-header-btn {
          background: #27272a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e4e4e7;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .radio-mgr-header-btn:hover {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }

        /* MODAL OVERLAY & DIALOG */
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 95;
          padding: 14px;
          box-sizing: border-box;
          border-radius: 16px;
          animation: fadeInModal 0.2s ease-out;
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-dialog {
          background: #18181b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          width: 100%;
          max-width: 480px;
          max-height: 94%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #1f1f23;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .modal-title {
          font-weight: 700;
          font-size: 13.5px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1;
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .modal-body {
          padding: 14px 16px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 72vh;
        }
        .modal-toolbar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-modal-action {
          background: #27272a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f3f4f6;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-modal-action:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .btn-modal-primary {
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
        }
        .btn-modal-primary:hover {
          background: #1d4ed8;
        }
        .btn-modal-danger {
          background: #dc2626;
          border-color: #dc2626;
          color: #fff;
        }
        .btn-modal-danger:hover {
          background: #b91c1c;
        }

        /* RADIO LIST IN MODAL */
        .modal-radio-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }
        .modal-radio-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #202024;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 8px 12px;
          border-radius: 10px;
          transition: background 0.15s;
        }
        .modal-radio-item:hover {
          background: #27272a;
          border-color: rgba(255, 255, 255, 0.12);
        }
        .modal-radio-thumb {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #fff;
          object-fit: contain;
          padding: 2px;
          flex-shrink: 0;
        }
        .modal-radio-details {
          flex: 1;
          min-width: 0;
        }
        .modal-radio-name {
          font-weight: 600;
          font-size: 13px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .modal-radio-sub {
          font-size: 11px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .provider-badge {
          display: inline-block;
          font-size: 9.5px;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .provider-badge-radioplayer {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }
        .provider-badge-tunein {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .provider-badge-audioplayer {
          background: rgba(168, 85, 247, 0.2);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.4);
        }
        .modal-radio-actions {
          display: flex;
          gap: 6px;
        }
        .modal-icon-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d1d5db;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.15s;
        }
        .modal-icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .modal-icon-btn.delete:hover {
          background: #dc2626;
          border-color: #dc2626;
          color: #fff;
        }

        /* FORM IN MODAL */
        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .modal-form-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #9ca3af;
        }
        .modal-form-input {
          background: #202024;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .modal-form-input:focus {
          border-color: #3b82f6;
        }
        .modal-form-hint {
          font-size: 10.5px;
          color: #6b7280;
          line-height: 1.3;
        }

        .speaker-mgr-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 4px 8px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .speaker-mgr-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* SPEAKER MODAL */
        .modal-speaker-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 4px;
        }
        .modal-speaker-card {
          background: #202024;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.15s, background 0.15s;
        }
        .modal-speaker-card.active-speaker-card {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
        }
        .modal-speaker-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .speaker-checkbox-wrap {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .speaker-checkbox-wrap input {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }
        .speaker-main-info {
          flex: 1;
          min-width: 0;
        }
        .modal-speaker-name {
          font-weight: 600;
          font-size: 13.5px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .current-speaker-badge {
          font-size: 9px;
          background: #2563eb;
          color: #fff;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .modal-speaker-sub {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .state-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .state-playing { background: #10b981; box-shadow: 0 0 6px #10b981; }
        .state-paused { background: #f59e0b; }
        .state-idle { background: #6b7280; }
        .state-off { background: #ef4444; }

        .modal-speaker-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .btn-select-active {
          background: #10b981 !important;
          border-color: #10b981 !important;
          color: #fff !important;
        }
        .btn-speaker-power.is-off {
          color: #9ca3af;
          border-color: rgba(156, 163, 175, 0.4);
        }
        .btn-speaker-power.is-on {
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.12);
        }

        .modal-speaker-vol-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 10px;
          border-radius: 8px;
        }
        .speaker-mute-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #9ca3af;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .speaker-mute-btn:hover {
          color: #fff;
        }
        .modal-vol-slider {
          flex: 1;
          height: 5px;
          accent-color: #3b82f6;
          cursor: pointer;
        }
        .speaker-vol-val {
          font-size: 11px;
          font-weight: 600;
          color: #d1d5db;
          min-width: 32px;
          text-align: right;
        }

        /* TOAST */
        .toast {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: #10b981;
          color: #fff;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
          pointer-events: auto;
          cursor: pointer;
          user-select: none;
          z-index: 100;
        }
        .toast.show {
          transform: translateX(-50%) translateY(0);
        }
      </style>

      <ha-card class="nas-card">
        <!-- HEADER -->
        <div class="nas-header">
          <div class="nas-header-title">
            <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            Musique du NAS
          </div>
          <div class="speaker-box">
            <button id="btn-open-speaker-mgr" class="speaker-mgr-btn" title="Gérer les enceintes : volumes, On/Off, multi-diffusion" style="${this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1 ? 'background:rgba(16,185,129,0.2);border-color:#10b981;color:#10b981;' : ''}">
              <span>${this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1 ? '📡' : '🔊'}</span>
              <span>${this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1 ? `Multi (${this.selectedSpeakersMulti.size})` : 'Enceintes'}</span>
            </button>
            <select id="speaker-dropdown" class="speaker-select">
              ${this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1 ? `<option value="__multi__" selected>📡 Multi-diffusion (${this.selectedSpeakersMulti.size} enc.)</option>` : ''}
              ${speakerList.map(s => `<option value="${s.id}" ${(!this.selectedSpeakersMulti || this.selectedSpeakersMulti.size <= 1) && s.id === this.selectedSpeaker ? 'selected' : ''}>${s.name}</option>`).join("")}
            </select>
            <input type="range" id="speaker-vol-slider" class="vol-slider" min="0" max="100" value="50" title="Volume enceinte active">
          </div>
        </div>

        <!-- SPEAKER LIVE STATUS (Clickable to switch to Now Playing) -->
        <div id="speaker-status-bar" class="speaker-status-bar" title="Cliquer pour afficher la musique en cours et les paroles">
          <div id="current-speaker-status" class="status-txt">Initialisation...</div>
          <div class="status-btns">
            <button id="btn-speaker-prev" class="icon-btn" title="Précédent">⏮</button>
            <button id="btn-speaker-playpause" class="icon-btn" title="Lecture / Pause">▶</button>
            <button id="btn-speaker-next" class="icon-btn" title="Suivant">⏭</button>
          </div>
        </div>

        <!-- SEARCH BAR (visible in catalogue views) -->
        ${!isNowPlaying && !isAlbumView ? `
          <div class="search-area">
            <div class="search-input-wrap">
              <span>🔍</span>
              <input type="text" id="nas-search-input" class="search-input" placeholder="${this.activeCategory === 'spotify' ? 'Rechercher sur Spotify (artiste, album, playlist, titre)...' : 'Rechercher un album, un artiste, une playlist...'}" value="${this.searchQuery}">
              ${this.searchQuery ? `<button id="btn-clear-search" class="search-clear">✕</button>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- CATEGORY PILLS -->
        <div class="tabs-wrap">
          ${Object.values(CATEGORIES).map(cat => `
            <button class="tab-pill ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
              ${cat.label}
            </button>
          `).join("")}
        </div>

        <!-- DYNAMIC CONTENT AREA -->
        <div id="content-container" class="content-area ${isNowPlaying ? 'np-content-area' : ''}">
          ${isNowPlaying ? this.renderNowPlayingView() : (isAlbumView ? this.renderAlbumView() : this.renderGridContent())}
        </div>

                ${!isNowPlaying && isSpeakerActive ? `
          <div class="mini-player-bar" id="mini-player-bar" title="Cliquer pour afficher la pochette, les paroles et les contrôles">
            <img class="mini-cover" src="${coverUrl}">
            <div class="mini-info">
              <div class="mini-title">${mediaTitle}</div>
              <div class="mini-artist">${mediaArtist || "Lecture en cours"}</div>
            </div>
            <div class="mini-controls">
              <button class="mini-btn" id="btn-mini-prev" title="Précédent">⏮</button>
              <button class="mini-btn" id="btn-mini-rw" title="Reculer 15s">⏪</button>
              <button class="mini-btn mini-btn-play" id="btn-mini-play" title="${isPlaying ? 'Pause' : 'Lecture'}">${isPlaying ? '⏸' : '▶'}</button>
              <button class="mini-btn" id="btn-mini-ff" title="Avancer 15s">⏩</button>
              <button class="mini-btn" id="btn-mini-next" title="Suivant">⏭</button>
              <button class="mini-btn mini-lyrics-btn" id="btn-mini-lyrics" title="Afficher les paroles">📜 Paroles</button>
            </div>
          </div>
        ` : ''}
        ${this.renderRadioModal()}
        ${this.renderSpeakerModal()}
        <div id="card-toast" class="toast"></div>
      </ha-card>
    `;

    this.attachEventListeners();
    this.updateSpeakerInfo();
  }

  renderRadioModal() {
    if (!this.showRadioManager) return "";
    const radios = this.getRadios();

    if (this.radioFormOpen) {
      const isEdit = this.editingRadioId !== null && radios.some(rad => rad._id === this.editingRadioId);
      const r = isEdit ? radios.find(rad => rad._id === this.editingRadioId) : { name: "", label: "", icon: "", streamUrl: "", provider: "audioplayer" };
      const currentProvider = r.provider || ((r.name || "").toLowerCase().includes("rfm") || (r.name || "").toLowerCase().includes("jazz") ? "tunein" : "audioplayer");
      return `
        <div class="modal-overlay" id="radio-modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <div class="modal-title">
                ${isEdit ? "✏️ Modifier la station de radio" : "➕ Ajouter une station de radio"}
              </div>
              <button class="modal-close-btn" id="btn-close-radio-modal">✕</button>
            </div>
            <div class="modal-body">
              <div class="modal-form-group">
                <label class="modal-form-label">Titre affiché *</label>
                <input id="input-radio-label" class="modal-form-input" type="text" value="${r.label || ''}" placeholder="Ex: RTL2, Nostalgie 80s, Chérie FM">
                <div class="modal-form-hint">Nom visible sous la pochette sur la carte</div>
              </div>

              <div class="modal-form-group">
                <label class="modal-form-label">Nom pour Alexa *</label>
                <input id="input-radio-name" class="modal-form-input" type="text" value="${r.name || ''}" placeholder="Ex: RTL, RTL2, RFM Night Fever">
                <div class="modal-form-hint">Identifiant vocal utilisé par Alexa pour lancer la station</div>
              </div>

              <div class="modal-form-group">
                <label class="modal-form-label">Fournisseur Alexa (Enceintes Echo) *</label>
                <select id="input-radio-provider" class="modal-form-input">
                  <option value="audioplayer" ${currentProvider === 'audioplayer' ? 'selected' : ''}>Audio Player (ex: "Demande à Audio Player de jouer...")</option>
                  <option value="tunein" ${currentProvider === 'tunein' ? 'selected' : ''}>TuneIn (ex: "Joue la radio ... sur TuneIn" — Recommandé RFM Night Fever & Jazz Radio)</option>
                  <option value="radioplayer" ${currentProvider === 'radioplayer' ? 'selected' : ''}>Radioplayer (ex: "Demande à Radioplayer de jouer...")</option>
                </select>
                <div class="modal-form-hint">Service vocal utilisé par Alexa pour diffuser cette radio sur vos enceintes Echo</div>
              </div>

              <div class="modal-form-group">
                <label class="modal-form-label">URL du logo / icône</label>
                <div style="display:flex;gap:10px;align-items:center;">
                  <img id="form-radio-logo-preview" src="${r.icon || ''}" style="width:38px;height:38px;border-radius:6px;background:#fff;object-fit:contain;padding:2px;border:1px solid rgba(255,255,255,0.1);" onerror="this.style.display='none'" onload="this.style.display='block'">
                  <input id="input-radio-icon" class="modal-form-input" style="flex:1;" type="text" value="${r.icon || ''}" placeholder="https://s2.googleusercontent.com/s2/favicons?domain=...&sz=256">
                </div>
                <div class="modal-form-hint">Lien direct vers l'image PNG/JPG/SVG du logo</div>
              </div>

              <div class="modal-form-group">
                <label class="modal-form-label">URL du flux direct MP3/AAC (Sonoro / DLNA)</label>
                <input id="input-radio-stream" class="modal-form-input" type="text" value="${r.streamUrl || ''}" placeholder="https://icecast.rtl2.fr/rtl2-1-44-128?listen=web">
                <div class="modal-form-hint">Adresse du flux MP3 direct (utilisé pour les enceintes DLNA comme Sonoro Cuisine)</div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
                <button class="btn-modal-action" id="btn-cancel-radio-form">Annuler</button>
                <button class="btn-modal-action btn-modal-primary" id="btn-save-radio-form">💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="modal-overlay" id="radio-modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">
              <span>📻 Gestion des Radios (${radios.length})</span>
            </div>
            <button class="modal-close-btn" id="btn-close-radio-modal">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-toolbar">
              <button class="btn-modal-action btn-modal-primary" id="btn-modal-add-radio">➕ Ajouter une radio</button>
              <button class="btn-modal-action" id="btn-modal-sync-ha" title="Synchroniser la liste des radios avec Home Assistant (tous vos appareils : iPhone, iPad, Mac...)">☁️ Synchroniser tous les appareils</button>
              <button class="btn-modal-action" id="btn-modal-reset-radios" title="Restaurer la liste par défaut des 8 radios">🔄 Réinitialiser</button>
              <button class="btn-modal-action" id="btn-modal-export-yaml" title="Copier la liste au format YAML pour dashboard Lovelace">📋 Copier YAML</button>
            </div>

            <div class="modal-radio-list">
              ${radios.map((r, idx) => `
                <div class="modal-radio-item">
                  <img class="modal-radio-thumb" src="${r.icon}" alt="${r.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 fill=%22%23666%22 viewBox=%220 0 24 24%22><path d=%22M12 3v9.28a4.39 4.39 0 0 0-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z%22/></svg>'">
                  <div class="modal-radio-details">
                    <div class="modal-radio-name" style="display:flex;align-items:center;gap:6px;">
                      <span>${r.label}</span>
                      <span class="provider-badge provider-badge-${r.provider || 'radioplayer'}">${r.provider === 'tunein' ? 'TuneIn' : (r.provider === 'audioplayer' ? 'Audio Player' : 'Radioplayer')}</span>
                    </div>
                    <div class="modal-radio-sub">Alexa: "${r.name}" (${r.provider === 'tunein' ? 'TuneIn' : (r.provider === 'audioplayer' ? 'Audio Player' : 'Radioplayer')})</div>
                    <div class="modal-radio-sub" style="font-size:10px;color:#6b7280;">Flux: ${r.streamUrl ? r.streamUrl.replace(/^https?:\/\//, "").substring(0, 32) + "..." : "Aucun flux direct"}</div>
                  </div>
                  <div class="modal-radio-actions">
                    <button class="modal-icon-btn modal-radio-up" data-index="${idx}" title="Monter d'une position" ${idx === 0 ? "disabled style=\"opacity:0.25;cursor:not-allowed;\"" : ""}>⬆️</button>
                    <button class="modal-icon-btn modal-radio-down" data-index="${idx}" title="Descendre d'une position" ${idx === radios.length - 1 ? "disabled style=\"opacity:0.25;cursor:not-allowed;\"" : ""}>⬇️</button>
                    <button class="modal-icon-btn modal-radio-edit" data-radio-id="${r._id}" data-index="${idx}" title="Modifier">✏️</button>
                    <button class="modal-icon-btn delete modal-radio-delete" data-radio-id="${r._id}" data-index="${idx}" title="Supprimer">🗑️</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSpeakerModal() {
    if (!this.showSpeakerManager) return "";
    const speakers = this.getSpeakers();
    const activeSpeakerId = this.selectedSpeaker;

    return `
      <div class="modal-overlay" id="speaker-modal-backdrop">
        <div class="modal-dialog" style="max-width:540px;">
          <div class="modal-header">
            <div class="modal-title" style="display:flex;align-items:center;gap:8px;">
              <span>🔊</span>
              <span>Gestion des Enceintes & Multi-room</span>
            </div>
            <button class="modal-close-btn" id="btn-close-speaker-modal">✕</button>
          </div>
          <div class="modal-body">
            <!-- QUICK MULTI-ROOM / ACTIONS -->
            <div style="font-size:11.5px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
              Multi-room & Raccourcis
            </div>
            <div class="modal-toolbar" style="margin-bottom:14px;">
              <button class="btn-modal-action ${activeSpeakerId === 'media_player.partout' ? 'btn-modal-primary' : ''}" id="btn-quick-partout" title="Diffuser partout dans la maison">
                🌐 Diffuser Partout
              </button>
              <button class="btn-modal-action ${activeSpeakerId === 'media_player.chambre' ? 'btn-modal-primary' : ''}" id="btn-quick-chambre" title="Diffuser sur le groupe Chambre (2 Echos)">
                🛏️ Chambre (2 Echos)
              </button>
              <button class="btn-modal-action btn-modal-danger" id="btn-quick-stop-all" title="Arrêter toutes les enceintes">
                ⏹ Tout éteindre
              </button>
            </div>

            <!-- MULTI-DIFFUSION BUTTON -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div style="font-size:11.5px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
                Enceintes (${speakers.length})
              </div>
              <button class="btn-modal-action" id="btn-multi-cast" style="font-size:11px;padding:4px 10px;background:#10b981;border-color:#10b981;color:#fff;" title="Diffuser la musique ou radio en cours sur toutes les enceintes cochées">
                ▶ Diffuser sur la sélection (${this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 0 ? this.selectedSpeakersMulti.size : 1})
              </button>
            </div>

            <!-- SPEAKERS LIST -->
            <div class="modal-speaker-list">
              ${speakers.map(s => {
                const isLocal = this.isLocalSystemSpeaker(s.id);
                const localAudio = isLocal ? this.getLocalAudio() : null;
                const stateObj = this._hass?.states?.[s.id];
                const rawState = isLocal ? (!localAudio.paused && localAudio.currentTime > 0 ? "playing" : "idle") : (stateObj?.state || "inconnu");
                const isCurrent = s.id === activeSpeakerId;
                const isNasActiveHere = isCurrent && this.isPlayingLocal && this.currentNowPlaying?.title && this.currentNowPlaying.title !== "Aucun morceau en cours";
                const isPlaying = rawState === "playing" || isNasActiveHere;
                const isPaused = isLocal ? (localAudio.paused && localAudio.currentTime > 0) : (rawState === "paused");
                const isOff = isLocal ? (!isPlaying && !isPaused) : (rawState === "off" || rawState === "unavailable" || (!isPlaying && !isPaused));
                const vol = isLocal ? Math.round((localAudio.volume !== undefined ? localAudio.volume : 0.8) * 100) : (stateObj?.attributes?.volume_level !== undefined ? Math.round(stateObj.attributes.volume_level * 100) : null);
                const isMuted = isLocal ? localAudio.muted : (stateObj?.attributes?.is_volume_muted || false);
                const isChecked = this.selectedSpeakersMulti?.has(s.id);
                let mediaTitle = isLocal && isPlaying ? (this.currentNowPlaying?.title || "En direct") : (stateObj?.attributes?.media_title || "");
                if (isNasActiveHere && this.currentNowPlaying?.title) {
                  mediaTitle = this.currentNowPlaying.title + (this.currentNowPlaying.artist ? ` - ${this.currentNowPlaying.artist}` : "");
                }
                const sidClean = s.id.replace(/\./g, "_");

                return `
                  <div class="modal-speaker-card ${isCurrent ? 'active-speaker-card' : ''}" data-speaker-id="${s.id}">
                    <div class="modal-speaker-top">
                      <label class="speaker-checkbox-wrap" title="Cocher pour la multi-diffusion">
                        <input type="checkbox" class="speaker-multi-check" data-speaker-id="${s.id}" ${isChecked ? 'checked' : ''}>
                      </label>
                      <div class="speaker-main-info">
                        <div class="modal-speaker-name">
                          <span>${s.icon || '🔊'}</span>
                          <span>${s.name}</span>
                          ${isCurrent ? '<span class="current-speaker-badge">Sélectionnée</span>' : ''}
                        </div>
                        <div class="modal-speaker-sub">
                          <span class="state-dot ${isPlaying ? 'state-playing' : (isPaused ? 'state-paused' : (isOff ? 'state-off' : 'state-idle'))}"></span>
                          ${isPlaying ? `Lecture : ${mediaTitle || 'En cours'}` : (isPaused ? 'En pause' : (isOff ? 'Prête (éteinte)' : 'Prête'))}
                        </div>
                      </div>

                      <div class="modal-speaker-actions">
                        <button class="modal-icon-btn ${isCurrent ? 'btn-select-active' : ''} btn-speaker-select" data-speaker-id="${s.id}" title="${isCurrent ? 'Enceinte principale active' : 'Sélectionner cette enceinte'}">
                          ${isCurrent ? '✓ Active' : '🎯 Choisir'}
                        </button>
                        <button class="modal-icon-btn btn-speaker-power ${isOff ? 'is-off' : 'is-on'}" data-speaker-id="${s.id}" title="${isOff ? 'Allumer / Réactiver cette enceinte' : 'Éteindre / Arrêter cette enceinte'}">
                          ⏻
                        </button>
                        <button class="modal-icon-btn btn-speaker-toggle-play" data-speaker-id="${s.id}" title="${isPlaying ? 'Pause' : 'Lecture'}">
                          ${isPlaying ? '⏸' : '▶'}
                        </button>
                      </div>
                    </div>

                    <div class="modal-speaker-vol-row">
                      <button class="speaker-mute-btn btn-speaker-mute" data-speaker-id="${s.id}" title="${isMuted ? 'Rétablir le son' : 'Couper le son'}">
                        ${isMuted || vol === 0 ? '🔇' : (vol && vol < 40 ? '🔉' : '🔊')}
                      </button>
                      <input type="range" class="speaker-vol-slider modal-vol-slider" data-speaker-id="${s.id}" min="0" max="100" value="${vol !== null ? vol : 30}" ${isOff ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                      <span class="speaker-vol-val" id="vol-val-${sidClean}">${vol !== null ? `${vol}%` : '--'}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setSpeakerVolume(speakerId, volumePercent) {
    const vol = Math.max(0, Math.min(100, volumePercent)) / 100;
    if (this.isLocalSystemSpeaker(speakerId)) {
      const audio = this.getLocalAudio();
      audio.volume = vol;
      localStorage.setItem("nas_music_local_volume", String(vol));
      if (this._hass?.states?.[speakerId]) {
        this._hass.callService("media_player", "volume_set", { entity_id: speakerId, volume_level: vol }).catch(() => {});
      }
      return;
    }
    if (!this._hass || !speakerId) return;
    this._hass.callService("media_player", "volume_set", {
      entity_id: speakerId,
      volume_level: vol
    });
  }

  toggleSpeakerPower(speakerId) {
    if (!speakerId) return;
    const speakerObj = this.getSpeakers().find(s => s.id === speakerId);
    const speakerName = speakerObj?.name || speakerId;

    if (this.isLocalSystemSpeaker(speakerId)) {
      const audio = this.getLocalAudio();
      if (!audio.paused && audio.currentTime > 0) {
        audio.pause();
        audio.currentTime = 0;
        this.isPlayingLocal = false;
        this.showToast(`⏹ ${speakerName} arrêtée`);
      } else {
        audio.play().catch(() => {});
        this.isPlayingLocal = true;
        this.showToast(`⚡ ${speakerName} activée`);
      }
      this.updateNowPlayingUI();
      this.render();
      return;
    }

    if (!this._hass) return;
    const stateObj = this._hass.states?.[speakerId];
    const rawState = stateObj?.state || "idle";
    const isCurrent = speakerId === this.selectedSpeaker;
    const isOff = rawState === "off";

    if (isOff) {
      // Allumage / Réveil si l'enceinte est explicitement éteinte
      const supported = stateObj?.attributes?.supported_features || 0;
      if (supported & 128) {
        this._hass.callService("media_player", "turn_on", { entity_id: speakerId }).catch(() => {});
      }
      this.showToast(`⚡ ${speakerName} allumée`);
    } else {
      // Arrêt / Extinction complète de l'enceinte
      this._hass.callService("media_player", "media_stop", { entity_id: speakerId }).catch(() => {});
      if (this.isAlexaSpeaker(speakerId)) {
        this._hass.callService("media_player", "play_media", {
          entity_id: speakerId,
          media_content_type: "custom",
          media_content_id: "arrête"
        }).catch(() => {});
      }
      const supported = stateObj?.attributes?.supported_features || 0;
      if (supported & 256) {
        this._hass.callService("media_player", "turn_off", { entity_id: speakerId }).catch(() => {});
      }

      if (isCurrent) {
        this.isPlayingLocal = false;
        this.currentNowPlaying = null;
        try { localStorage.removeItem("nas_music_active_meta"); } catch(e) {}
      }

      this.showToast(`⏹ ${speakerName} arrêtée`);
    }

    setTimeout(() => {
      this.updateNowPlayingUI();
      this.render();
    }, 400);
  }

  toggleSpeakerPlayPause(speakerId) {
    if (!speakerId) return;
    const speakerObj = this.getSpeakers().find(s => s.id === speakerId);
    const speakerName = speakerObj?.name || speakerId;

    if (this.isLocalSystemSpeaker(speakerId)) {
      const audio = this.getLocalAudio();
      if (audio.paused) {
        audio.play().catch(() => {});
        this.isPlayingLocal = true;
      } else {
        audio.pause();
        this.isPlayingLocal = false;
      }
      this.updateNowPlayingUI();
      this.render();
      return;
    }

    if (!this._hass) return;
    const stateObj = this._hass.states?.[speakerId];
    const rawState = stateObj?.state || "idle";
    const isCurrent = speakerId === this.selectedSpeaker;
    const isPlaying = rawState === "playing" || (isCurrent && this.isPlayingLocal);

    if (this.isAlexaSpeaker(speakerId)) {
      if (isPlaying) {
        this._hass.callService("media_player", "media_pause", { entity_id: speakerId }).catch(() => {});
        this._hass.callService("media_player", "play_media", {
          entity_id: speakerId,
          media_content_type: "custom",
          media_content_id: "pause"
        }).catch(() => {});
        if (isCurrent) this.isPlayingLocal = false;
      } else {
        this._hass.callService("media_player", "media_play", { entity_id: speakerId }).catch(() => {});
        this._hass.callService("media_player", "play_media", {
          entity_id: speakerId,
          media_content_type: "custom",
          media_content_id: "reprends"
        }).catch(() => {});
        if (isCurrent) this.isPlayingLocal = true;
      }
    } else {
      this._hass.callService("media_player", "media_play_pause", { entity_id: speakerId }).catch(() => {});
      if (isCurrent) this.isPlayingLocal = !this.isPlayingLocal;
    }

    setTimeout(() => {
      this.updateNowPlayingUI();
      this.render();
    }, 400);
  }

  toggleSpeakerMute(speakerId) {
    if (this.isLocalSystemSpeaker(speakerId)) {
      const audio = this.getLocalAudio();
      audio.muted = !audio.muted;
      this.updateSpeakerModalUI();
      return;
    }
    if (!this._hass || !speakerId) return;
    const isMuted = this._hass.states?.[speakerId]?.attributes?.is_volume_muted || false;
    this._hass.callService("media_player", "volume_mute", {
      entity_id: speakerId,
      is_volume_muted: !isMuted
    });
  }

  stopAllSpeakers() {
    if (window._nasMusicLocalAudio) {
      window._nasMusicLocalAudio.pause();
      window._nasMusicLocalAudio.currentTime = 0;
    }
    if (!this._hass) return;
    const speakers = this.getSpeakers();
    speakers.forEach(s => {
      this._hass.callService("media_player", "media_stop", { entity_id: s.id }).catch(() => {});
      if (this.isAlexaSpeaker(s.id)) {
        this._hass.callService("media_player", "play_media", {
          entity_id: s.id,
          media_content_type: "custom",
          media_content_id: "arrête"
        }).catch(() => {});
      }
      const stateObj = this._hass.states?.[s.id];
      const supported = stateObj?.attributes?.supported_features || 0;
      if (supported & 256) {
        this._hass.callService("media_player", "turn_off", { entity_id: s.id }).catch(() => {});
      }
    });

    const spState = this._hass.states?.[this.spotifyPlayer];
    if (spState && spState.state === "playing") {
      this._hass.callService("media_player", "media_pause", { entity_id: this.spotifyPlayer }).catch(() => {});
    }

    this.isPlayingLocal = false;
    this.currentNowPlaying = null;
    try { localStorage.removeItem("nas_music_active_meta"); } catch(e) {}
    this.showToast("⏹ Toutes les enceintes ont été arrêtées");
    setTimeout(() => {
      this.updateNowPlayingUI();
      this.render();
    }, 400);
  }

  broadcastToSelection() {
    if (!this._hass) return;
    let selected = Array.from(this.selectedSpeakersMulti || []);
    if (selected.length === 0) {
      if (this.selectedSpeaker) {
        selected = [this.selectedSpeaker];
      } else {
        alert("Veuillez cocher au moins une enceinte dans la liste pour la multi-diffusion.");
        return;
      }
    } else if (this.selectedSpeaker && !selected.includes(this.selectedSpeaker)) {
      // Si l'utilisateur coche une enceinte additionnelle alors qu'il écoutait sur l'enceinte active, inclure l'enceinte active pour faire du vrai multi-room
      selected.unshift(this.selectedSpeaker);
    }

    if (selected.length > 1) {
      this.selectedSpeakersMulti = new Set(selected);
      try {
        localStorage.setItem("nas_music_multi_speakers", JSON.stringify(selected));
      } catch(e) {}
    }
    this.showSpeakerManager = false;

    // 1. Détecter la source en cours de lecture :
    // Priorité absolue : ce qui est actuellement sélectionné ou affiché dans la carte !
    const currentInfo = this.getNowPlayingInfo();
    let radio = null;

    if (this.currentNowPlaying?.artist === "Radio en direct" && this.currentNowPlaying.title) {
      const cleanTitle = this.currentNowPlaying.title.toLowerCase().trim();
      radio = this.getRadios().find(r =>
        (r.name && cleanTitle.includes(r.name.toLowerCase().trim())) ||
        (r.label && cleanTitle.includes(r.label.toLowerCase().trim())) ||
        (r.name && r.name.toLowerCase().trim().includes(cleanTitle))
      );
      if (!radio) {
        radio = { name: this.currentNowPlaying.title, label: this.currentNowPlaying.title, icon: this.currentNowPlaying.cover };
      }
    } else if (this.currentView === "radios" && this._lastPlayedRadio) {
      radio = this._lastPlayedRadio;
    } else if (currentInfo.mediaTitle && currentInfo.mediaTitle !== "Aucun morceau en cours") {
      const cleanTitle = currentInfo.mediaTitle.toLowerCase().trim();
      const matched = this.getRadios().find(r =>
        (r.name && cleanTitle.includes(r.name.toLowerCase().trim())) ||
        (r.label && cleanTitle.includes(r.label.toLowerCase().trim()))
      );
      if (matched) radio = matched;
    }

    // A. RADIO
    if (radio) {
      this._lastPlayedRadio = radio;
      this.showToast(`📡 Multi-diffusion radio « ${radio.label || radio.name} » sur ${selected.length} enceinte(s)...`);
      selected.forEach((sid, idx) => {
        setTimeout(() => {
          const sp = this.getSpeakers().find(s => s.id === sid);
          const stateObj = this._hass.states?.[sid];
          if (stateObj?.attributes?.is_volume_muted) {
            this._hass.callService("media_player", "volume_mute", { entity_id: sid, is_volume_muted: false });
          }
          if (stateObj?.attributes?.volume_level !== undefined && stateObj.attributes.volume_level <= 0.05) {
            this._hass.callService("media_player", "volume_set", { entity_id: sid, volume_level: 0.25 });
          }
          if (this.isLocalSystemSpeaker(sid)) {
            if (radio.streamUrl) {
              const audio = this.getLocalAudio();
              audio.src = radio.streamUrl;
              audio.play().catch(() => {});
            }
          } else if (sp && sp.isDlna) {
            if (sid === "media_player.sonoro_cuisine") {
              this._hass.callService("media_player", "play_media", {
                entity_id: sid,
                media_content_type: "radio",
                media_content_id: radio.name,
                extra: { title: radio.label || radio.name, thumb: radio.icon }
              });
            } else if (radio.streamUrl) {
              this._hass.callService("media_player", "play_media", {
                entity_id: sid,
                media_content_type: "music",
                media_content_id: radio.streamUrl,
                extra: { title: radio.label || radio.name, thumb: radio.icon }
              });
            }
          } else {
            const isGroup = sid === "media_player.partout" || sid === "media_player.chambre";
            const groupName = sid === "media_player.partout" ? "Partout" : (sp?.name || "Chambre");
            const prov = radio.provider || ((radio.name || "").toLowerCase().includes("rfm") || (radio.name || "").toLowerCase().includes("jazz") ? "tunein" : (this.radioProvider || "audioplayer"));
            
            let radioCmd = "";
            if (isGroup) {
              radioCmd = `joue la radio ${radio.name} sur ${groupName}`;
            } else {
              radioCmd = prov === "tunein"
                ? `joue la radio ${radio.name} sur TuneIn`
                : prov === "audioplayer"
                  ? `demande à Audio Player de jouer ${radio.name}`
                  : `demande à Radioplayer de jouer ${radio.name}`;
            }

            this._hass.callService("media_player", "play_media", {
              entity_id: sid,
              media_content_type: "custom",
              media_content_id: radioCmd
            });
          }
        }, idx * 1200);
      });
      return;
    }

    // B. SPOTIFY
    const playingStateObj = this._hass.states?.[this.selectedSpeaker];
    const activeAppName = playingStateObj?.attributes?.app_name || "";
    const spStateObj = this._hass.states?.[this.spotifyPlayer];
    const isSpotifyActive = (activeAppName === "Spotify") || (spStateObj?.state === "playing") || (this.currentView === "spotify");
    if (isSpotifyActive) {
      const groupSpeaker = selected.find(sid => sid === "media_player.partout" || sid === "media_player.chambre");
      const targetSpeakerId = groupSpeaker || selected[0];
      const targetSp = this.getSpeakers().find(s => s.id === targetSpeakerId);
      const targetDevName = targetSp?.spotifyDevice || targetSp?.name || "Chambre";

      this.showToast(`🎵 Spotify : Diffusion vers ${targetDevName}...`);
      this._hass.callService("spotifyplus", "player_transfer_playback", {
        entity_id: this.spotifyPlayer,
        device_id: targetDevName,
        play: true
      }).catch(() => {
        this._hass.callService("media_player", "play_media", {
          entity_id: targetSpeakerId,
          media_content_type: "custom",
          media_content_id: "reprends la lecture sur Spotify"
        });
      });
      return;
    }

    // C. ALBUM ou PLAYLIST NAS
    const alb = this._lastPlayedAlbum || this.selectedAlbum;
    if (alb) {
      this.showToast(`🎶 Multi-diffusion album « ${alb.Name || alb.displayName} » sur ${selected.length} enceinte(s)...`);
      selected.forEach((sid, idx) => {
        setTimeout(() => {
          const sp = this.getSpeakers().find(s => s.id === sid);
          const stateObj = this._hass.states?.[sid];
          if (stateObj?.attributes?.is_volume_muted) {
            this._hass.callService("media_player", "volume_mute", { entity_id: sid, is_volume_muted: false });
          }
          if (stateObj?.attributes?.volume_level !== undefined && stateObj.attributes.volume_level <= 0.05) {
            this._hass.callService("media_player", "volume_set", { entity_id: sid, volume_level: 0.25 });
          }
          if (this.isLocalSystemSpeaker(sid)) {
            if (this.nowPlayingQueue && this.nowPlayingQueue.length > 0) {
              this.castTrack(this.nowPlayingQueue[0], alb);
            }
          } else if (sp && sp.isDlna) {
            const isPlaylist = alb.Type === "Playlist";
            const uri = alb.Id ? `jellyfin--GRvzKL7Q://${isPlaylist ? "playlist" : "album"}/${alb.Id}` : `library://album/${encodeURIComponent(alb.Name)}`;
            this._hass.callService("mass", "play_media", {
              entity_id: sid,
              media_id: [uri],
              enqueue: "replace"
            }).catch(() => {});
          } else {
            const cmd = alb.customCmd || buildVoiceCmd(alb);
            this._hass.callService("media_player", "play_media", {
              entity_id: sid,
              media_content_type: "custom",
              media_content_id: cmd
            });
          }
        }, idx * 1200);
      });
      return;
    }

    // D. Piste ou morceau actuel
    const track = this._lastPlayedTrack || this.currentNowPlaying;
    if (track && (track.album || track.Album || track.title || track.Name)) {
      const albName = track.album || track.Album || track.title || track.Name;
      const albArtist = track.artist || track.AlbumArtist || "";
      this.showToast(`🎶 Multi-diffusion sur ${selected.length} enceinte(s)...`);
      selected.forEach((sid, idx) => {
        setTimeout(() => {
          const sp = this.getSpeakers().find(s => s.id === sid);
          const stateObj = this._hass.states?.[sid];
          if (stateObj?.attributes?.is_volume_muted) {
            this._hass.callService("media_player", "volume_mute", { entity_id: sid, is_volume_muted: false });
          }
          if (stateObj?.attributes?.volume_level !== undefined && stateObj.attributes.volume_level <= 0.05) {
            this._hass.callService("media_player", "volume_set", { entity_id: sid, volume_level: 0.25 });
          }
          if (this.isLocalSystemSpeaker(sid)) {
            const trackId = track.trackId || track.Id;
            if (trackId) {
              const audio = this.getLocalAudio();
              audio.src = `${this.jellyfinUrl}/Audio/${trackId}/stream.mp3?static=true&api_key=${this.jellyfinToken}`;
              audio.play().catch(() => {});
            }
          } else if (sp && sp.isDlna) {
            const trackId = track.trackId || track.Id;
            if (trackId) {
              this._hass.callService("media_player", "play_media", {
                entity_id: sid,
                media_content_type: "music",
                media_content_id: `${this.jellyfinUrl}/Audio/${trackId}/stream.mp3?static=true&api_key=${this.jellyfinToken}`
              });
            }
          } else {
            const cmd = buildVoiceCmd({ Name: albName, AlbumArtist: albArtist });
            this._hass.callService("media_player", "play_media", {
              entity_id: sid,
              media_content_type: "custom",
              media_content_id: cmd
            });
          }
        }, idx * 1200);
      });
      this.updateSpeakerInfo();
      this.render();
      return;
    }

    this.showToast("ℹ️ Lancez d'abord une radio, un album ou Spotify pour le multi-diffuser.");
    this.render();
  }

  transferPlaybackTo(newSpeakerId) {
    if (!newSpeakerId) return;
    const oldSpeakerId = this.selectedSpeaker;
    if (oldSpeakerId === newSpeakerId) return;

    this.selectedSpeaker = newSpeakerId;
    localStorage.setItem("nas_music_speaker", newSpeakerId);
    this.selectedSpeakersMulti.clear();
    try { localStorage.removeItem("nas_music_multi_speakers"); } catch(e) {}

    const speakerObj = this.getSpeakers().find(s => s.id === newSpeakerId);
    const speakerName = speakerObj?.name || newSpeakerId;

    if (speakerObj && speakerObj.zone && this._hass) {
      this._hass.callService("input_select", "select_option", {
        entity_id: "input_select.zone_ecoute_multimedia",
        option: speakerObj.zone
      }).catch(() => {});
    }

    window.dispatchEvent(new CustomEvent("nas-music-speaker-changed", { detail: { speaker: newSpeakerId } }));

    // Stop old speaker if it was playing and different from new
    if (oldSpeakerId && oldSpeakerId !== newSpeakerId && this._hass) {
      if (this.isLocalSystemSpeaker(oldSpeakerId)) {
        if (window._nasMusicLocalAudio) window._nasMusicLocalAudio.pause();
      } else {
        this._hass.callService("media_player", "media_stop", { entity_id: oldSpeakerId }).catch(() => {});
        if (this.isAlexaSpeaker(oldSpeakerId)) {
          this._hass.callService("media_player", "play_media", {
            entity_id: oldSpeakerId,
            media_content_type: "custom",
            media_content_id: "arrête"
          }).catch(() => {});
        }
      }
    }

    // Determine what was playing to transfer playback!
    const info = this.getNowPlayingInfo();
    const oldState = this._hass?.states?.[oldSpeakerId];
    const wasPlaying = info.isPlaying || oldState?.state === "playing" || this.isPlayingLocal;

    if (!wasPlaying) {
      this.showToast(`🎯 Enceinte sélectionnée : ${speakerName}`);
      this.updateSpeakerInfo();
      this.render();
      return;
    }

    // 1. Radio en direct
    if (this.currentNowPlaying?.artist === "Radio en direct" || (info.mediaArtist === "Radio en direct" && !info.isRadioResidual && info.mediaTitle)) {
      const radioTitle = this.currentNowPlaying?.title || info.mediaTitle;
      const cleanTitle = (radioTitle || "").toLowerCase().trim();
      let radio = this.getRadios().find(r =>
        (r.name && cleanTitle.includes(r.name.toLowerCase().trim())) ||
        (r.label && cleanTitle.includes(r.label.toLowerCase().trim())) ||
        (r.name && r.name.toLowerCase().trim().includes(cleanTitle))
      );
      if (!radio && this._lastPlayedRadio) radio = this._lastPlayedRadio;
      if (radio) {
        this.showToast(`📻 Bascule radio « ${radio.label || radio.name} » vers ${speakerName}...`);
        setTimeout(() => {
          this.castRadio(radio);
          this.render();
        }, 500);
        return;
      }
    }

    // 2. Spotify
    if (this.isSpotifyActive()) {
      const spPlayer = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
      const targetDev = speakerObj?.spotifyDevice;
      if (targetDev) {
        this.showToast(`🟢 Bascule Spotify vers ${speakerName}...`);
        setTimeout(() => {
          this._hass.callService("spotifyplus", "player_transfer_playback", {
            entity_id: spPlayer,
            device_id: targetDev,
            play: "play"
          }).catch(() => {});
          this.render();
        }, 500);
        return;
      }
    }

    // 3. Album NAS prioritaire si un album est identifié
    const albName = this.selectedAlbum?.Name || this.selectedAlbum?.name || this._lastPlayedAlbum?.Name || this._lastPlayedAlbum?.name || (this.currentNowPlaying?.album && this.currentNowPlaying.album !== this.currentNowPlaying.title ? this.currentNowPlaying.album : null);

    if (albName) {
      const albObj = this.selectedAlbum || this._lastPlayedAlbum || { Name: albName, AlbumArtist: this.currentNowPlaying?.artist || "" };
      this.showToast(`🎶 Bascule album vers ${speakerName} : ${albName}...`);
      setTimeout(() => {
        this.castAlbum(albObj, this.isShuffle);
        this.render();
      }, 500);
      return;
    }

    if (this._lastPlayedTrack && this._lastPlayedAlbum) {
      this.showToast(`🎶 Bascule vers ${speakerName} : ${this._lastPlayedTrack.Name || this._lastPlayedTrack.name}...`);
      setTimeout(() => {
        this.castTrack(this._lastPlayedTrack, this._lastPlayedAlbum);
        this.render();
      }, 500);
      return;
    }

    if (this.currentNowPlaying?.title && this.currentNowPlaying.artist !== "Radio en direct") {
      this.showToast(`🎶 Bascule vers ${speakerName} : ${this.currentNowPlaying.title}...`);
      setTimeout(() => {
        if (this.isAlexaSpeaker()) {
          const titleClean = this.currentNowPlaying.title.replace(/[\[\]()"]/g, "").trim();
          const artistClean = (this.currentNowPlaying.artist || "").split(/[,;]/)[0].replace(/[\[\]()"]/g, "").trim();
          const cmd = `demande à mon nas de jouer le morceau ${titleClean}${artistClean ? " de " + artistClean : ""}`;
          this.castAlexa(cmd);
        } else if (this.currentNowPlaying.trackId) {
          this.castTrack({ Id: this.currentNowPlaying.trackId, Name: this.currentNowPlaying.title, artist: this.currentNowPlaying.artist });
        }
        this.render();
      }, 500);
      return;
    }

    // 4. Default if nothing was identified
    this.showToast(`🎯 Enceinte sélectionnée : ${speakerName}`);
    this.updateSpeakerInfo();
    this.render();
  }

  updateSpeakerModalUI() {
    if (!this.shadowRoot || !this._hass || !this.showSpeakerManager) return;
    const root = this.shadowRoot;
    const speakers = this.getSpeakers();
    speakers.forEach(s => {
      const sidClean = s.id.replace(/\./g, "_");
      const volValEl = root.getElementById(`vol-val-${sidClean}`);
      const volSlider = root.querySelector(`.modal-vol-slider[data-speaker-id="${s.id}"]`);

      if (this.isLocalSystemSpeaker(s.id)) {
        const audio = this.getLocalAudio();
        const vol = Math.round((audio.volume !== undefined ? audio.volume : 0.8) * 100);
        if (volValEl) {
          volValEl.textContent = `${vol}%`;
        }
        if (volSlider && root.activeElement !== volSlider) {
          volSlider.value = vol;
        }
        return;
      }

      const stateObj = this._hass.states?.[s.id];
      if (stateObj) {
        const vol = stateObj.attributes?.volume_level !== undefined ? Math.round(stateObj.attributes.volume_level * 100) : null;
        if (volValEl && vol !== null) {
          volValEl.textContent = `${vol}%`;
        }
        if (volSlider && vol !== null && root.activeElement !== volSlider) {
          volSlider.value = vol;
        }
      }
    });
  }

  renderGridContent() {
    if (this.currentView === "radios") {
      this.loading = false;
      const radios = this.getRadios();
      return `
        <div style="font-size:12px;color:#9ca3af;margin:2px 2px 10px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>📻 Radios Françaises en direct</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:11px;color:#6b7280;">${radios.length} station${radios.length > 1 ? "s" : ""}</span>
            <button id="btn-open-radio-mgr" class="radio-mgr-header-btn" title="Ajouter, modifier ou supprimer des radios">
              ⚙️ Gérer les radios
            </button>
          </div>
        </div>
        <div class="grid">
          ${radios.map((r, idx) => `
            <div class="card-item radio-card-item" data-radio-index="${idx}" data-radio-name="${r.name}">
              <div class="radio-box">
                <img class="radio-logo" src="${r.icon}" alt="${r.name}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 fill=%22%23666%22 viewBox=%220 0 24 24%22><path d=%22M12 3v9.28a4.39 4.39 0 0 0-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-6z%22/></svg>'">
                <div class="play-overlay radio-play-btn" data-radio-name="${r.name}" title="Écouter ${r.label}">▶</div>
              </div>
              <div class="card-info">
                <div class="card-name" title="${r.label}">${r.label}</div>
                <div class="card-sub">Radio Direct</div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (this.loading) {
      return `<p style="text-align:center;color:#9ca3af;padding:30px 0;">⏳ Chargement de la bibliothèque...</p>`;
    }

    const items = this.searchResults.map(i => {
      if (i.Type && i.Type.startsWith("Spotify")) {
        return {
          Id: i.Id,
          Name: i.Name,
          displayName: i.Name,
          AlbumArtist: i.AlbumArtist || "Spotify",
          Type: i.Type,
          uri: i.uri,
          coverUrl: i.coverUrl || i.image_url || ""
        };
      }

      let displayName = i.Name;
      let displaySub = i.AlbumArtist || (i.Artists && i.Artists[0]) || "";
      if (i.Type === "Playlist") {
        if (i.Name && i.Name.includes(" - ")) {
          const parts = i.Name.split(" - ");
          displayName = parts.slice(1).join(" - ").trim();
          displaySub = `${parts[0].trim()} • Playlist`;
        } else {
          displaySub = displaySub ? `${displaySub} • Playlist` : "Playlist";
        }
      } else if (!displaySub) {
        displaySub = "Album";
      }

      return {
        Id: i.Id,
        Name: i.Name,
        displayName: displayName,
        AlbumArtist: displaySub,
        Type: i.Type,
        customCmd: i.customCmd || null,
        coverUrl: `${this.jellyfinUrl}/Items/${i.Id}/Images/Primary?maxWidth=300&quality=90`
      };
    });

    if (items.length === 0) {
      return `<p style="text-align:center;color:#9ca3af;padding:30px 0;">Aucun album ou playlist trouvé.</p>`;
    }

    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    const hasPagination = (this.currentView === "category" || this.currentView === "search" || this.currentView === "favorites") && totalPages > 1;

    let sectionHeader = "";
    if (this.currentView === "category") {
      const catLabel = CATEGORIES[this.activeCategory]?.label || "";
      sectionHeader = `<div style="font-size:12px;color:#9ca3af;margin:2px 2px 10px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
        <span>${catLabel}</span>
        <span style="font-size:11px;color:#6b7280;">${this.totalItems} album(s) au total</span>
      </div>`;
    } else if (this.currentView === "favorites") {
      sectionHeader = `<div style="font-size:12px;color:#9ca3af;margin:2px 2px 10px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
        <span>⭐ Albums Favoris Jellyfin</span>
        <span style="font-size:11px;color:#6b7280;">${this.totalItems} album(s) favori(s)</span>
      </div>`;
    } else if (this.currentView === "spotify") {
      sectionHeader = `
        <div class="spotify-subtabs">
          <button class="sp-subtab-pill ${this.spotifySubTab === 'playlists' && !this.searchQuery ? 'active' : ''}" data-sptab="playlists">🎶 Playlists</button>
          <button class="sp-subtab-pill ${this.spotifySubTab === 'albums' && !this.searchQuery ? 'active' : ''}" data-sptab="albums">💿 Albums favoris</button>
          <button class="sp-subtab-pill ${this.spotifySubTab === 'artists' && !this.searchQuery ? 'active' : ''}" data-sptab="artists">🎤 Artistes</button>
          <button class="sp-subtab-pill ${this.spotifySubTab === 'top' && !this.searchQuery ? 'active' : ''}" data-sptab="top">⭐ Top Titres</button>
        </div>
        <div style="font-size:12px;color:#9ca3af;margin:4px 2px 10px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
          <span>🟢 ${this.getSpotifySubTabLabel()}</span>
          <span style="font-size:11px;color:#6b7280;">${this.totalItems} élément(s)</span>
        </div>
      `;
    } else if (this.currentView === "search") {
      sectionHeader = `<div style="font-size:12px;color:#9ca3af;margin:2px 2px 10px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
        <span>🔍 Recherche : « ${this.searchQuery} »</span>
        <span style="font-size:11px;color:#6b7280;">${this.totalItems} résultat(s)</span>
      </div>`;
    }

    return `
      ${sectionHeader}
      <div class="grid">
        ${items.map(item => `
          <div class="card-item" data-id="${item.Id}">
            <div class="cover-box">
              <img class="cover-img" src="${item.coverUrl}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23555\\'><path d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/></svg>'">
              <div class="play-overlay" data-play-id="${item.Id}" title="Diffuser directement">▶</div>
            </div>
            <div class="card-info">
              <div class="card-name" title="${item.Name}">${item.displayName}</div>
              <div class="card-sub">${item.AlbumArtist}</div>
            </div>
          </div>
        `).join("")}
      </div>

      ${hasPagination ? `
        <div class="pagination-bar">
          <button id="btn-prev-page" class="page-btn" ${this.currentPage === 0 ? 'disabled' : ''}>◀ Précédent</button>
          <span class="page-info">Page ${this.currentPage + 1} / ${totalPages} (${this.totalItems} éléments)</span>
          <button id="btn-next-page" class="page-btn" ${(this.currentPage + 1) >= totalPages ? 'disabled' : ''}>Suivant ▶</button>
        </div>
      ` : ''}
    `;
  }

  renderNowPlayingView() {
    const info = this.getNowPlayingInfo();
    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    let speakerName = speakerObj ? speakerObj.name : "Enceinte";
    const isMulti = this.selectedSpeakersMulti && this.selectedSpeakersMulti.size > 1;
    if (isMulti) {
      const names = Array.from(this.selectedSpeakersMulti)
        .map(sid => this.getSpeakers().find(s => s.id === sid)?.name || sid)
        .join(", ");
      speakerName = `Multi-diffusion (${this.selectedSpeakersMulti.size}) : ${names}`;
    }

    return `
      <div class="nowplaying-view">
        <button id="btn-back-nowplaying" class="back-btn">⬅ Retour à la navigation</button>
        
        <div class="nowplaying-hero">
          <img class="np-cover" id="np-cover-img" src="${info.coverUrl}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23666\'><path d=\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\'/></svg>'">
          <div class="np-info">
            <div class="np-title" id="np-title-txt" title="${info.mediaTitle}">${info.mediaTitle}</div>
            <div class="np-artist" id="np-artist-txt" title="${info.mediaArtist}">${info.mediaArtist || "Artiste inconnu"}</div>
            <div class="np-album" id="np-album-txt" title="${info.mediaAlbum}" style="${info.mediaAlbum ? '' : 'display:none;'}">${info.mediaAlbum || ''}</div>
            <div class="np-speaker-badge">${isMulti ? '📡' : '🔊'} ${speakerName}</div>
          </div>
        </div>

        <!-- PROGRESS BAR / SEEK -->
        <div class="np-progress-section">
          <span id="np-time-current" class="np-time-label">${this.formatSeconds(info.curPos)}</span>
          <input type="range" id="np-progress-slider" class="np-progress-bar" min="0" max="${info.duration || 100}" step="1" value="${info.curPos}">
          <span id="np-time-duration" class="np-time-label">${this.formatSeconds(info.duration)}</span>
        </div>

        <!-- CONTROLS BAR (🔀, ⏮, ⏪ -15s, ▶/⏸, ⏩ +15s, ⏭) -->
        <div class="np-controls-bar">
          <button id="btn-np-shuffle" class="np-sec-btn ${this.isShuffle ? 'active-control' : ''}" title="${this.isShuffle ? 'Désactiver le mode aléatoire' : 'Activer le mode aléatoire'}">🔀</button>
          <button id="btn-np-prev" class="np-sec-btn" title="Morceau précédent">⏮</button>
          <button id="btn-np-rw" class="np-sec-btn np-skip-btn" title="Reculer de 15s">⏪ 15s</button>
          <button id="btn-np-play" class="np-main-btn" title="${info.isPlaying ? 'Pause' : 'Lecture'}">${info.isPlaying ? '⏸' : '▶'}</button>
          <button id="btn-np-ff" class="np-sec-btn np-skip-btn" title="Avancer de 15s">15s ⏩</button>
          <button id="btn-np-next" class="np-sec-btn" title="Morceau suivant">⏭</button>
        </div>

        <div class="np-subtabs">
          <button class="np-subtab-btn ${this.nowPlayingTab === 'lyrics' ? 'active' : ''}" data-tab="lyrics">${this.hasLrcSync ? '🎤 Paroles (.lrc)' : '📜 Paroles (.txt)'}</button>
          <button class="np-subtab-btn ${this.nowPlayingTab === 'queue' ? 'active' : ''}" data-tab="queue">🎶 File de lecture (${this.nowPlayingQueue.length})</button>
        </div>

        <div id="np-subtab-container">
          ${this.renderNowPlayingTabContent()}
        </div>
      </div>
    `;
  }

  renderNowPlayingTabContent() {
    const speaker = this._hass?.states[this.selectedSpeaker];
    const mediaTitle = speaker?.attributes?.media_title || "";

    if (this.nowPlayingTab === "lyrics") {
      if (this.loadingLyrics) {
        return `<div class="lyrics-empty">⏳ Recherche des paroles synchronisées (.lrc)...</div>`;
      }
      if (this.currentLyrics && this.currentLyrics.length > 0) {
        return `
          ${this.hasLrcSync ? `
            <div class="lyrics-sync-controls" style="display:flex;align-items:center;justify-content:center;gap:5px;padding:2px 0 8px;font-size:11px;color:#9ca3af;flex-wrap:wrap;">
              <span>⏱️ Calage :</span>
              <button class="btn-sync-adj" data-adj="-2" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Retarder les paroles de 2s">-2s</button>
              <button class="btn-sync-adj" data-adj="-1" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Retarder les paroles de 1s">-1s</button>
              <button class="btn-sync-adj" data-adj="-0.5" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Retarder les paroles de 0.5s">-0.5s</button>
              <span style="font-weight:700;color:${this.syncOffset !== 0 ? '#38bdf8' : '#e5e7eb'};min-width:32px;text-align:center;">${this.syncOffset > 0 ? '+' : ''}${this.syncOffset.toFixed(1)}s</span>
              <button class="btn-sync-adj" data-adj="0.5" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Avancer les paroles de 0.5s">+0.5s</button>
              <button class="btn-sync-adj" data-adj="1" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Avancer les paroles de 1s">+1s</button>
              <button class="btn-sync-adj" data-adj="2" style="background:#27272a;border:1px solid rgba(255,255,255,0.12);color:#d1d5db;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Avancer les paroles de 2s">+2s</button>
              ${this.syncOffset !== 0 ? `<button class="btn-sync-adj" data-adj="reset" style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10.5px;" title="Réinitialiser à 0s">Reset</button>` : ''}
            </div>
          ` : `<div class="lyrics-hint" style="text-align:center;font-size:11px;color:#9ca3af;padding-bottom:6px;">ℹ️ Paroles textuelles (défilement automatique estimé en cours)</div>`}
          <div class="lyrics-box" id="lyrics-scroll-box">
            ${this.currentLyrics.map((l, idx) => `
              <div class="lyric-line" data-idx="${idx}" title="${this.hasLrcSync ? 'Cliquer pour aller à ce moment' : ''}">${l.Text || (this.hasLrcSync ? '♪' : '')}</div>
            `).join("")}
          </div>
        `;
      }
      return `<div class="lyrics-empty">📜 Aucune parole disponible pour ce titre.</div>`;
    }

    if (this.nowPlayingQueue.length === 0) {
      return `<div class="lyrics-empty">🎶 Aucune file de lecture mémorisée. Lancez un album ou une playlist depuis la carte pour afficher tous les titres ici.</div>`;
    }

    return `
      <div class="track-list" style="max-height: 250px;">
        ${this.nowPlayingQueue.map((t, idx) => {
          const isCurrent = (this.nowPlayingCurrentIndex === idx) || (t.Name && mediaTitle && t.Name.toLowerCase() === mediaTitle.toLowerCase());
          return `
            <div class="track-item ${isCurrent ? 'current-track' : ''}" data-track-id="${t.Id || ''}" data-track-name="${t.Name}" data-track-idx="${idx}">
              <div class="track-num">${isCurrent ? '▶' : (t.IndexNumber || idx + 1)}</div>
              <div class="track-title">${t.Name}</div>
              <div class="track-time">${this.formatTicks(t.RunTimeTicks)}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  renderNowPlayingTab() {
    const container = this.shadowRoot.getElementById("np-subtab-container");
    if (container) {
      container.innerHTML = this.renderNowPlayingTabContent();
      this.attachNowPlayingEvents();
    }
    const lyricsBtn = this.shadowRoot?.querySelector('.np-subtab-btn[data-tab="lyrics"]');
    if (lyricsBtn) {
      lyricsBtn.textContent = this.hasLrcSync ? '🎤 Paroles (.lrc)' : '📜 Paroles (.txt)';
    }
    const queueBtn = this.shadowRoot?.querySelector('.np-subtab-btn[data-tab="queue"]');
    if (queueBtn) {
      queueBtn.textContent = `🎶 File de lecture (${this.nowPlayingQueue.length})`;
    }
    if (this.nowPlayingTab === "lyrics" && this.currentLyrics && this.currentLyrics.length > 0) {
      const curPos = this.getCurrentPlaybackPosition();
      setTimeout(() => this.highlightActiveLyric(curPos, true), 50);
    }
  }

  renderAlbumView() {
    const a = this.selectedAlbum;
    if (!a) {
      return `
        <div class="album-view">
          <button id="btn-back-grid" class="back-btn">⬅ Retour à la liste</button>
          <p style="padding:20px;color:#9ca3af;text-align:center;">Aucun album sélectionné.</p>
        </div>
      `;
    }
    const isSpotify = a.Type && a.Type.startsWith("Spotify");
    const coverUrl = isSpotify
      ? (a.coverUrl || a.image_url)
      : `${this.jellyfinUrl}/Items/${a.Id}/Images/Primary?maxWidth=400&quality=90`;
    const speakerObj = this.getSpeakers().find(s => s.id === this.selectedSpeaker);
    const speakerName = speakerObj ? speakerObj.name : "l'enceinte";
    const speakerMode = isSpotify ? 'Spotify' : (this.isLocalSystemSpeaker() ? 'Cet appareil' : (this.isDlnaSpeaker() ? 'DLNA' : 'Alexa'));

    return `
      <div class="album-view">
        <button id="btn-back-grid" class="back-btn">⬅ Retour à la liste</button>
        <div class="album-hero">
          <img class="album-hero-img" src="${coverUrl}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23555\\'><path d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/></svg>'">
          <div class="album-hero-meta">
            <div class="album-hero-title">${a.Name || a.displayName || ''}</div>
            <div class="album-hero-artist">${a.AlbumArtist || ""} • ${this.albumTracks.length} morceau(x)</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
              <button id="btn-cast-album" class="cast-btn" style="${isSpotify ? 'background:#1db954;color:#fff;' : ''}">
                <span>▶ Diffuser sur ${speakerName} (${speakerMode})</span>
              </button>
              <button id="btn-cast-album-shuffle" class="cast-btn" style="background:#374151;color:#f3f4f6;border:1px solid rgba(255,255,255,0.15);">
                <span>🔀 Aléatoire</span>
              </button>
            </div>
          </div>
        </div>

        <div class="track-list">
          ${this.loading ? '<p style="padding:10px;color:#9ca3af;">Chargement des pistes...</p>' : ''}
          ${this.albumTracks.map((t, idx) => `
            <div class="track-item" data-track-id="${t.Id}" data-track-name="${t.Name}" data-track-uri="${t.uri || ''}">
              <div class="track-num">${t.IndexNumber || idx + 1}</div>
              <div class="track-title">${t.Name} ${t.AlbumArtist ? `<span style="font-size:11px;color:#9ca3af;margin-left:6px;">— ${t.AlbumArtist}</span>` : ''}</div>
              <div class="track-time">${this.formatTicks(t.RunTimeTicks)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  renderResults() {
    const container = this.shadowRoot.getElementById("content-container");
    if (container && this.currentView !== "album" && this.currentView !== "nowplaying") {
      container.innerHTML = this.renderGridContent();
      this.attachGridEvents();
    }
  }

  attachEventListeners() {
    const root = this.shadowRoot;

    // Speaker select
    const sel = root.getElementById("speaker-dropdown");
    if (sel) {
      sel.onchange = () => {
        if (sel.value && sel.value !== "__multi__") {
          this.transferPlaybackTo(sel.value);
        }
      };
    }

    const openSpeakerMgrBtn = root.getElementById("btn-open-speaker-mgr");
    if (openSpeakerMgrBtn) {
      openSpeakerMgrBtn.onclick = () => {
        this.showSpeakerManager = true;
        if (!this.selectedSpeakersMulti) {
          this.selectedSpeakersMulti = new Set();
        }
        if (this.selectedSpeaker && this.selectedSpeakersMulti.size === 0) {
          this.selectedSpeakersMulti.add(this.selectedSpeaker);
        }
        this.render();
      };
    }

    // Volume slider
    const volSlider = root.getElementById("speaker-vol-slider");
    if (volSlider) {
      volSlider.oninput = () => {
        const val = parseFloat(volSlider.value) / 100;
        if (this.isLocalSystemSpeaker()) {
          const audio = this.getLocalAudio();
          audio.volume = val;
          localStorage.setItem("nas_music_local_volume", String(val));
          if (this._hass?.states?.[this.selectedSpeaker]) {
            this._hass.callService("media_player", "volume_set", {
              entity_id: this.selectedSpeaker,
              volume_level: val
            }).catch(() => {});
          }
          return;
        }
        if (this._hass) {
          this._hass.callService("media_player", "volume_set", {
            entity_id: this.selectedSpeaker,
            volume_level: val
          });
        }
      };
    }

    // Top status bar click -> Now Playing
    const statusBar = root.getElementById("speaker-status-bar");
    if (statusBar) {
      statusBar.onclick = (e) => {
        if (e.target.closest(".status-btns")) return;
        this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
        this.activeCategory = "nowplaying";
        this.currentView = "nowplaying";
        this.render();
        if (this.isAlexaSpeaker()) {
          const speaker = this._hass?.states[this.selectedSpeaker];
          if (speaker && speaker.attributes.media_title) {
            this.loadLyricsForCurrentTrack(speaker.attributes.media_title, speaker.attributes.media_artist);
            if (this.nowPlayingQueue.length === 0 && (speaker.attributes.media_album_name || speaker.attributes.media_title)) {
              this.loadQueueForCurrentAlbum(speaker.attributes.media_album_name || speaker.attributes.media_title);
            }
          }
        }
      };
    }

    // Mini player bar controls
    const miniBar = root.getElementById("mini-player-bar");
    if (miniBar) {
      miniBar.onclick = (e) => {
        if (e.target.closest(".mini-controls")) return;
        this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
        this.activeCategory = "nowplaying";
        this.currentView = "nowplaying";
        this.render();
      };
    }
    const miniPlayBtn = root.getElementById("btn-mini-play");
    if (miniPlayBtn) {
      miniPlayBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlPlayPause();
      };
    }
    const miniPrevBtn = root.getElementById("btn-mini-prev");
    if (miniPrevBtn) {
      miniPrevBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlPreviousTrack();
      };
    }
    const miniNextBtn = root.getElementById("btn-mini-next");
    if (miniNextBtn) {
      miniNextBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlNextTrack();
      };
    }
    const miniRwBtn = root.getElementById("btn-mini-rw");
    if (miniRwBtn) {
      miniRwBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlSeekRelative(-15);
      };
    }
    const miniFfBtn = root.getElementById("btn-mini-ff");
    if (miniFfBtn) {
      miniFfBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlSeekRelative(15);
      };
    }
    const miniLyricsBtn = root.getElementById("btn-mini-lyrics");
    if (miniLyricsBtn) {
      miniLyricsBtn.onclick = (e) => {
        e.stopPropagation();
        this.previousView = this.currentView !== "nowplaying" ? this.currentView : "favorites";
        this.activeCategory = "nowplaying";
        this.currentView = "nowplaying";
        this.nowPlayingTab = "lyrics";
        this.render();
      };
    }

    // Speaker transport controls
    const playBtn = root.getElementById("btn-speaker-playpause");
    if (playBtn) {
      playBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlPlayPause();
      };
    }
    const prevBtn = root.getElementById("btn-speaker-prev");
    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlPreviousTrack();
      };
    }
    const nextBtn = root.getElementById("btn-speaker-next");
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        this.controlNextTrack();
      };
    }

    // Toast click-to-dismiss
    const toastEl = root.getElementById("card-toast");
    if (toastEl) {
      toastEl.onclick = () => {
        toastEl.classList.remove("show");
        if (this._toastTimer) {
          clearTimeout(this._toastTimer);
          this._toastTimer = null;
        }
      };
    }

    // Search input
    const searchInput = root.getElementById("nas-search-input");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.trim();
        clearTimeout(this._searchDebounce);
        if (this.activeCategory === "spotify") {
          if (this.searchQuery.length >= 2) {
            this._searchDebounce = setTimeout(() => this.searchSpotify(this.searchQuery), 350);
          } else if (this.searchQuery.length === 0) {
            this.loadSpotifyContent(this.spotifySubTab);
          }
          return;
        }
        if (this.searchQuery.length >= 2) {
          this.activeCategory = "";
          this.currentView = "search";
          this._searchDebounce = setTimeout(() => this.searchJellyfin(this.searchQuery, 0), 350);
        } else if (this.searchQuery.length === 0) {
          this.activeCategory = "favorites";
          this.currentView = "favorites";
          this.render();
        }
      };
    }
    const clearBtn = root.getElementById("btn-clear-search");
    if (clearBtn) {
      clearBtn.onclick = () => {
        this.searchQuery = "";
        if (this.activeCategory === "spotify") {
          this.loadSpotifyContent(this.spotifySubTab);
          return;
        }
        this.activeCategory = "favorites";
        this.currentView = "favorites";
        this.render();
      };
    }

    // Pills
    root.querySelectorAll(".tab-pill").forEach(pill => {
      pill.onclick = () => {
        const cat = pill.dataset.cat;
        this.searchQuery = "";
        this.currentPage = 0;
        this.loadCategory(cat, 0);
      };
    });

    // Detail Album view buttons
    const backBtn = root.getElementById("btn-back-grid");
    if (backBtn) {
      backBtn.onclick = () => {
        this.selectedAlbum = null;
        this.currentView = this.previousView || "favorites";
        this.render();
      };
    }

    const castAlbumBtn = root.getElementById("btn-cast-album");
    if (castAlbumBtn && this.selectedAlbum) {
      castAlbumBtn.onclick = () => {
        if (this.selectedAlbum.Type && this.selectedAlbum.Type.startsWith("Spotify")) {
          this.castSpotifyContext(this.selectedAlbum, null, false);
        } else {
          this.castAlbum(this.selectedAlbum, false);
        }
      };
    }

    const castAlbumShuffleBtn = root.getElementById("btn-cast-album-shuffle");
    if (castAlbumShuffleBtn && this.selectedAlbum) {
      castAlbumShuffleBtn.onclick = () => {
        if (this.selectedAlbum.Type && this.selectedAlbum.Type.startsWith("Spotify")) {
          this.castSpotifyContext(this.selectedAlbum, null, true);
        } else {
          this.castAlbum(this.selectedAlbum, true);
        }
      };
    }

    // Album track click
    root.querySelectorAll(".album-view .track-item").forEach(t => {
      t.onclick = () => {
        if (this.selectedAlbum?.Type && this.selectedAlbum.Type.startsWith("Spotify")) {
          const trackUri = t.dataset.trackUri;
          this.castSpotifyContext(this.selectedAlbum, trackUri);
          return;
        }
        const trackName = t.dataset.trackName;
        const trackId = t.dataset.trackId;
        const trackObj = this.albumTracks.find(item => item.Id === trackId) || { Id: trackId, Name: trackName };
        this.castTrack(trackObj, this.selectedAlbum);
      };
    });

    this.attachGridEvents();
    this.attachNowPlayingEvents();
    this.attachSpeakerModalEvents();
  }

  attachGridEvents() {
    const root = this.shadowRoot;

    // Pagination events
    const prevPageBtn = root.getElementById("btn-prev-page");
    if (prevPageBtn) {
      prevPageBtn.onclick = () => {
        if (this.currentPage > 0) {
          const newPage = this.currentPage - 1;
          root.getElementById("content-container")?.scrollTo({ top: 0, behavior: "smooth" });
          if (this.currentView === "search") {
            this.searchJellyfin(this.searchQuery, newPage);
          } else {
            this.loadCategory(this.activeCategory, newPage);
          }
        }
      };
    }

    const nextPageBtn = root.getElementById("btn-next-page");
    if (nextPageBtn) {
      nextPageBtn.onclick = () => {
        const totalPages = Math.ceil(this.totalItems / this.pageSize);
        if (this.currentPage + 1 < totalPages) {
          const newPage = this.currentPage + 1;
          root.getElementById("content-container")?.scrollTo({ top: 0, behavior: "smooth" });
          if (this.currentView === "search") {
            this.searchJellyfin(this.searchQuery, newPage);
          } else {
            this.loadCategory(this.activeCategory, newPage);
          }
        }
      };
    }

    // Radio card events
    root.querySelectorAll(".radio-card-item").forEach(card => {
      card.onclick = () => {
        const radioIdx = card.dataset.radioIndex;
        const radios = this.getRadios();
        let radioObj = null;
        if (radioIdx !== undefined && radios[parseInt(radioIdx, 10)]) {
          radioObj = radios[parseInt(radioIdx, 10)];
        } else {
          radioObj = radios.find(r => r.name === card.dataset.radioName);
        }
        if (radioObj) this.castRadio(radioObj);
      };
    });

    // Radio manager open button
    const openRadioMgrBtn = root.getElementById("btn-open-radio-mgr");
    if (openRadioMgrBtn) {
      openRadioMgrBtn.onclick = () => {
        this.showRadioManager = true;
        this.radioFormOpen = false;
        this.editingRadioId = null;
        this.render();
      };
    }

    // Radio modal events
    const closeRadioModalBtn = root.getElementById("btn-close-radio-modal");
    if (closeRadioModalBtn) {
      closeRadioModalBtn.onclick = () => {
        this.showRadioManager = false;
        this.radioFormOpen = false;
        this.editingRadioId = null;
        this.render();
      };
    }

    const modalAddRadioBtn = root.getElementById("btn-modal-add-radio");
    if (modalAddRadioBtn) {
      modalAddRadioBtn.onclick = () => {
        this.radioFormOpen = true;
        this.editingRadioId = null;
        this.render();
      };
    }

    const modalSyncHaBtn = root.getElementById("btn-modal-sync-ha");
    if (modalSyncHaBtn) {
      modalSyncHaBtn.onclick = async () => {
        const radios = this.getRadios();
        this.showToast("⏳ Synchronisation avec Home Assistant en cours...");
        await this.syncRadiosToHA(radios);
      };
    }

    const modalResetRadiosBtn = root.getElementById("btn-modal-reset-radios");
    if (modalResetRadiosBtn) {
      modalResetRadiosBtn.onclick = () => {
        if (confirm("Réinitialiser les radios avec la liste d'origine (8 stations) ?")) {
          this.resetDefaultRadios();
        }
      };
    }

    const modalExportYamlBtn = root.getElementById("btn-modal-export-yaml");
    if (modalExportYamlBtn) {
      modalExportYamlBtn.onclick = () => {
        const radios = this.getRadios();
        let yamlStr = "radios:\n";
        radios.forEach(r => {
          yamlStr += `  - name: "${r.name}"\n`;
          yamlStr += `    label: "${r.label}"\n`;
          yamlStr += `    icon: "${r.icon}"\n`;
          yamlStr += `    streamUrl: "${r.streamUrl}"\n`;
          yamlStr += `    provider: "${r.provider || 'radioplayer'}"\n`;
        });
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(yamlStr).then(() => {
            this.showToast("📋 Configuration YAML copiée !");
          }).catch(() => {
            prompt("Copiez le YAML ci-dessous :", yamlStr);
          });
        } else {
          prompt("Copiez le YAML ci-dessous :", yamlStr);
        }
      };
    }

    const cancelRadioFormBtn = root.getElementById("btn-cancel-radio-form");
    if (cancelRadioFormBtn) {
      cancelRadioFormBtn.onclick = () => {
        this.radioFormOpen = false;
        this.editingRadioId = null;
        this.render();
      };
    }

    const inputIcon = root.getElementById("input-radio-icon");
    const previewIcon = root.getElementById("form-radio-logo-preview");
    if (inputIcon && previewIcon) {
      inputIcon.oninput = () => {
        previewIcon.src = inputIcon.value.trim();
        previewIcon.style.display = "block";
      };
    }

    const saveRadioFormBtn = root.getElementById("btn-save-radio-form");
    if (saveRadioFormBtn) {
      saveRadioFormBtn.onclick = () => {
        const label = (root.getElementById("input-radio-label")?.value || "").trim();
        let name = (root.getElementById("input-radio-name")?.value || "").trim();
        const icon = (root.getElementById("input-radio-icon")?.value || "").trim();
        const streamUrl = (root.getElementById("input-radio-stream")?.value || "").trim();
        const provider = (root.getElementById("input-radio-provider")?.value || "radioplayer").trim();

        if (!label) {
          alert("Veuillez indiquer un titre affiché pour la radio.");
          return;
        }
        if (!name) name = label;

        const defaultFavicon = `https://s2.googleusercontent.com/s2/favicons?domain=radio.fr&sz=256`;
        const radioItem = {
          name: name,
          label: label,
          icon: icon || defaultFavicon,
          streamUrl: streamUrl,
          provider: provider
        };

        const currentRadios = this.getRadios().map(r => ({
          name: r.name,
          label: r.label,
          icon: r.icon,
          streamUrl: r.streamUrl,
          provider: r.provider || ((r.name || "").toLowerCase().includes("rfm") || (r.name || "").toLowerCase().includes("jazz") ? "tunein" : "radioplayer"),
          _id: r._id
        }));
        if (this.editingRadioId) {
          const idx = currentRadios.findIndex(r => r._id === this.editingRadioId);
          if (idx !== -1) {
            radioItem._id = this.editingRadioId;
            currentRadios[idx] = radioItem;
          } else {
            radioItem._id = `radio_${Date.now()}`;
            currentRadios.push(radioItem);
          }
        } else {
          radioItem._id = `radio_${Date.now()}`;
          currentRadios.push(radioItem);
        }

        this.radioFormOpen = false;
        this.editingRadioId = null;
        this.saveCustomRadios(currentRadios);
      };
    }

    // Modal Move Up / Down buttons
    root.querySelectorAll(".modal-radio-up:not([disabled])").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (idx > 0) {
          const radios = [...this.getRadios()];
          const temp = radios[idx];
          radios[idx] = radios[idx - 1];
          radios[idx - 1] = temp;
          this.saveCustomRadios(radios);
        }
      };
    });

    root.querySelectorAll(".modal-radio-down:not([disabled])").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index, 10);
        const radios = [...this.getRadios()];
        if (idx < radios.length - 1) {
          const temp = radios[idx];
          radios[idx] = radios[idx + 1];
          radios[idx + 1] = temp;
          this.saveCustomRadios(radios);
        }
      };
    });

    // Modal Edit buttons
    root.querySelectorAll(".modal-radio-edit").forEach(btn => {
      btn.onclick = () => {
        const radId = btn.dataset.radioId;
        this.editingRadioId = radId;
        this.radioFormOpen = true;
        this.render();
      };
    });

    // Modal Delete buttons
    root.querySelectorAll(".modal-radio-delete").forEach(btn => {
      btn.onclick = () => {
        const radId = btn.dataset.radioId;
        const idx = parseInt(btn.dataset.index, 10);
        const radios = this.getRadios();
        const r = radId ? radios.find(rad => rad._id === radId) : radios[idx];
        if (confirm(`Supprimer la radio "${r?.label || ''}" ?`)) {
          const updated = radId ? radios.filter(rad => rad._id !== radId) : radios.filter((_, i) => i !== idx);
          this.saveCustomRadios(updated);
        }
      };
    });

    // Spotify subtab pills
    root.querySelectorAll(".sp-subtab-pill").forEach(pill => {
      pill.onclick = (e) => {
        e.stopPropagation();
        const tab = pill.dataset.sptab;
        this.searchQuery = "";
        const searchInput = root.getElementById("nas-search-input");
        if (searchInput) searchInput.value = "";
        this.loadSpotifyContent(tab);
      };
    });

    // Album / Playlist item clicks
    root.querySelectorAll(".card-item:not(.radio-card-item)").forEach(card => {
      card.onclick = (e) => {
        const id = card.dataset.id;
        const item = this.searchResults.find(i => String(i.Id) === String(id) || String(i.id) === String(id));
        if (!item) {
          console.warn("NAS Card: Item non trouvé pour l'ID cliqué:", id);
          return;
        }

        // Spotify items
        if (item.Type && item.Type.startsWith("Spotify")) {
          if (e.target.classList.contains("play-overlay")) {
            e.stopPropagation();
            if (item.Type === "SpotifyTrack") {
              this.castSpotifyTrack(item);
            } else {
              this.castSpotifyContext(item);
            }
            return;
          }
          if (item.Type === "SpotifyAlbum") {
            this.openSpotifyAlbum(item);
          } else if (item.Type === "SpotifyArtist") {
            this.openSpotifyArtist(item);
          } else if (item.Type === "SpotifyTrack") {
            this.castSpotifyTrack(item);
          } else {
            this.openSpotifyPlaylist(item);
          }
          return;
        }

        // Quick play overlay click -> cast directly
        if (e.target.classList.contains("play-overlay")) {
          e.stopPropagation();
          this.castAlbum(item);
          return;
        }

        // Clicking card opens details
        this.openAlbum(item);
      };
    });
  }

  attachNowPlayingEvents() {
    const root = this.shadowRoot;

    const backNpBtn = root.getElementById("btn-back-nowplaying");
    if (backNpBtn) {
      backNpBtn.onclick = () => {
        this.activeCategory = this.previousView === "nowplaying" ? "favorites" : this.previousView;
        this.currentView = this.previousView === "nowplaying" ? "favorites" : this.previousView;
        this.render();
      };
    }

    const npShuffleBtn = root.getElementById("btn-np-shuffle");
    if (npShuffleBtn) {
      npShuffleBtn.onclick = () => {
        this.toggleShuffle();
      };
    }

    const npPlayBtn = root.getElementById("btn-np-play");
    if (npPlayBtn) {
      npPlayBtn.onclick = () => {
        this.controlPlayPause();
      };
    }
    const npPrevBtn = root.getElementById("btn-np-prev");
    if (npPrevBtn) {
      npPrevBtn.onclick = () => {
        this.controlPreviousTrack();
      };
    }
    const npNextBtn = root.getElementById("btn-np-next");
    if (npNextBtn) {
      npNextBtn.onclick = () => {
        this.controlNextTrack();
      };
    }
    const npRwBtn = root.getElementById("btn-np-rw");
    if (npRwBtn) {
      npRwBtn.onclick = () => {
        this.controlSeekRelative(-15);
      };
    }
    const npFfBtn = root.getElementById("btn-np-ff");
    if (npFfBtn) {
      npFfBtn.onclick = () => {
        this.controlSeekRelative(15);
      };
    }
    const progressSlider = root.getElementById("np-progress-slider");
    if (progressSlider) {
      progressSlider.onchange = (e) => {
        const seekVal = parseFloat(e.target.value);
        this.controlSeekAbsolute(seekVal);
      };
    }

    // Subtabs: Lyrics vs Queue
    root.querySelectorAll(".np-subtab-btn").forEach(btn => {
      btn.onclick = () => {
        this.nowPlayingTab = btn.dataset.tab;
        root.querySelectorAll(".np-subtab-btn").forEach(b => b.classList.toggle("active", b === btn));
        this.renderNowPlayingTab();
      };
    });

    // Lyric line click to seek
    root.querySelectorAll(".lyric-line").forEach(lineEl => {
      lineEl.onclick = () => {
        const idx = parseInt(lineEl.dataset.idx, 10);
        const l = this.currentLyrics[idx];
        if (l && l.Start !== undefined) {
          const seekSec = Math.floor(l.Start / 10000000);
          this.controlSeekAbsolute(seekSec);
        }
      };
    });

    // Sync adjustment buttons
    root.querySelectorAll(".btn-sync-adj").forEach(btn => {
      btn.onclick = () => {
        const adj = btn.dataset.adj;
        if (adj === "reset") {
          this.syncOffset = 0;
        } else {
          this.syncOffset = Math.round((this.syncOffset + parseFloat(adj)) * 10) / 10;
        }
        localStorage.setItem("nas_music_sync_offset", this.syncOffset.toString());
        this.updateNowPlayingUI();
        this.renderNowPlayingTab();
        this.showToast(`⏱️ Calage synchronisation : ${this.syncOffset >= 0 ? '+' : ''}${this.syncOffset.toFixed(1)}s`);
      };
    });

    // Queue track click
    root.querySelectorAll(".nowplaying-view .track-item").forEach(t => {
      t.onclick = () => {
        const trackName = t.dataset.trackName;
        const trackId = t.dataset.trackId;
        const trackObj = this.nowPlayingQueue.find(item => (item.Id || item.id) === trackId) || { Id: trackId, Name: trackName };
        const albumObj = this.selectedAlbum || {
          Id: trackObj.AlbumId || this.currentNowPlaying?.albumId,
          Name: trackObj.Album || this.currentNowPlaying?.album || "",
          AlbumArtist: trackObj.AlbumArtist || ""
        };

        // Spotify queue track click
        if (trackObj.uri && trackObj.uri.startsWith("spotify:")) {
          if (albumObj?.Type === "SpotifyArtist") {
            this.castSpotifyContext(albumObj, trackObj.uri);
          } else if (albumObj?.Type?.startsWith("Spotify")) {
            this.castSpotifyContext(albumObj, trackObj.uri);
          } else {
            this.castSpotifyTrack(trackObj);
          }
          return;
        }

        this.castTrack(trackObj, albumObj);
      };
    });
  }

  attachSpeakerModalEvents() {
    if (!this.showSpeakerManager) return;
    const root = this.shadowRoot;

    // Close button
    const closeBtn = root.getElementById("btn-close-speaker-modal");
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.showSpeakerManager = false;
        this.render();
      };
    }

    // Backdrop click
    const backdrop = root.getElementById("speaker-modal-backdrop");
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          this.showSpeakerManager = false;
          this.render();
        }
      };
    }

    // Quick Partout
    const btnPartout = root.getElementById("btn-quick-partout");
    if (btnPartout) {
      btnPartout.onclick = () => {
        this.selectedSpeaker = "media_player.partout";
        localStorage.setItem("nas_music_speaker", this.selectedSpeaker);
        this.selectedSpeakersMulti.clear();
        this.selectedSpeakersMulti.add("media_player.partout");
        this.broadcastToSelection();
        this.render();
      };
    }

    // Quick Chambre (2 Echos)
    const btnChambre = root.getElementById("btn-quick-chambre");
    if (btnChambre) {
      btnChambre.onclick = () => {
        this.selectedSpeaker = "media_player.chambre";
        localStorage.setItem("nas_music_speaker", this.selectedSpeaker);
        this.selectedSpeakersMulti.clear();
        this.selectedSpeakersMulti.add("media_player.chambre");
        this.broadcastToSelection();
        this.render();
      };
    }

    // Quick Stop All
    const btnStopAll = root.getElementById("btn-quick-stop-all");
    if (btnStopAll) {
      btnStopAll.onclick = () => {
        this.stopAllSpeakers();
      };
    }

    // Multi-diffusion button
    const btnMultiCast = root.getElementById("btn-multi-cast");
    const updateMultiCastCount = () => {
      if (btnMultiCast) {
        const count = this.selectedSpeakersMulti ? this.selectedSpeakersMulti.size : 0;
        btnMultiCast.textContent = count > 0 ? `▶ Diffuser sur la sélection (${count})` : "▶ Diffuser sur la sélection";
      }
    };
    if (btnMultiCast) {
      btnMultiCast.onclick = () => {
        this.broadcastToSelection();
      };
    }

    // Multi-select checkboxes
    root.querySelectorAll(".speaker-multi-check").forEach(cb => {
      cb.onchange = () => {
        const sid = cb.dataset.speakerId;
        if (cb.checked) {
          this.selectedSpeakersMulti.add(sid);
        } else {
          this.selectedSpeakersMulti.delete(sid);
        }
        updateMultiCastCount();
      };
    });

    // Click on speaker info to toggle checkbox
    root.querySelectorAll(".speaker-main-info").forEach(info => {
      info.onclick = () => {
        const card = info.closest(".modal-speaker-card");
        if (!card) return;
        const cb = card.querySelector(".speaker-multi-check");
        if (cb) {
          cb.checked = !cb.checked;
          const sid = cb.dataset.speakerId;
          if (cb.checked) {
            this.selectedSpeakersMulti.add(sid);
          } else {
            this.selectedSpeakersMulti.delete(sid);
          }
          updateMultiCastCount();
        }
      };
    });

    // Select active speaker button
    root.querySelectorAll(".btn-speaker-select").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.speakerId;
        this.transferPlaybackTo(sid);
      };
    });

    // Power toggle button
    root.querySelectorAll(".btn-speaker-power").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.speakerId;
        this.toggleSpeakerPower(sid);
      };
    });

    // Toggle Play/Pause button
    root.querySelectorAll(".btn-speaker-toggle-play").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.speakerId;
        this.toggleSpeakerPlayPause(sid);
      };
    });

    // Mute button
    root.querySelectorAll(".btn-speaker-mute").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.speakerId;
        this.toggleSpeakerMute(sid);
      };
    });

    // Volume sliders
    root.querySelectorAll(".modal-vol-slider").forEach(slider => {
      const sid = slider.dataset.speakerId;
      const sidClean = sid.replace(/\./g, "_");
      const valLabel = root.getElementById(`vol-val-${sidClean}`);
      let volDebounce = null;
      slider.oninput = () => {
        if (valLabel) valLabel.textContent = `${slider.value}%`;
        clearTimeout(volDebounce);
        volDebounce = setTimeout(() => {
          this.setSpeakerVolume(sid, parseInt(slider.value, 10));
        }, 120);
      };
      slider.onchange = () => {
        clearTimeout(volDebounce);
        if (valLabel) valLabel.textContent = `${slider.value}%`;
        this.setSpeakerVolume(sid, parseInt(slider.value, 10));
      };
    });
  }

    static getConfigElement() {
    return document.createElement("nas-music-card-editor");
  }

  static getStubConfig() {
    return {
      default_speaker: "media_player.echo_chambre"
    };
  }
}

class NasMusicCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--primary-text-color);">
        <h3 style="margin-top:0;margin-bottom:8px;font-size:15px;display:flex;align-items:center;gap:6px;">
          🎵 Configuration du lecteur NAS Music
        </h3>
        <p style="font-size:12px;color:var(--secondary-text-color);margin-bottom:14px;line-height:1.4;">
          Personnalisez la carte, vos enceintes ou vos stations de radios.
        </p>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">
            Enceinte par défaut (ID Home Assistant)
          </label>
          <input id="cfg-speaker" type="text" value="${this._config.default_speaker || ''}" placeholder="media_player.echo_chambre" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--divider-color, #444);background:var(--card-background-color, #222);color:inherit;box-sizing:border-box;">
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">
            🔗 Vue ou URL de redirection vers le lecteur complet
          </label>
          <input id="cfg-player-url" type="text" list="cfg-views-list" value="${this._config.player_url || ''}" placeholder="/lovelace/multimedias" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--divider-color, #444);background:var(--card-background-color, #222);color:inherit;box-sizing:border-box;">
          <datalist id="cfg-views-list">
            <option value="/lovelace/multimedias">Multimedias</option>
            <option value="/lovelace/multimedias-test">Multimédias Test</option>
            <option value="/lovelace/musique">Musique</option>
            <option value="/lovelace/0">Vue principale</option>
          </datalist>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:4px;line-height:1.35;">
            Chemin ouvert lors du clic sur « 🎶 Changer de titre » ou sur la pochette (ex: <code>/lovelace/multimedias</code>). Si le lecteur est déjà présent sur la même vue, l'écran défilera directement jusqu'à lui.
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">
            Fournisseur Radio sur Amazon Echo
          </label>
          <select id="cfg-radio-provider" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--divider-color, #444);background:var(--card-background-color, #222);color:inherit;box-sizing:border-box;">
            <option value="radioplayer" ${(!this._config.radio_provider || this._config.radio_provider === 'radioplayer') ? 'selected' : ''}>📻 Radioplayer France (Officiel, sans pub TuneIn)</option>
            <option value="tunein" ${this._config.radio_provider === 'tunein' ? 'selected' : ''}>📡 TuneIn (Standard avec pubs)</option>
          </select>
        </div>

        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;font-size:12px;line-height:1.5;">
          <strong>📻 Gestion des stations de radios :</strong><br>
          • Directement dans la carte : cliquez sur l'onglet <strong>📻 Radios</strong> puis sur le bouton <strong>⚙️ Gérer les radios</strong> pour ajouter, modifier ou supprimer des stations graphiquement.<br>
          • En YAML : vous pouvez définir la clé <code>radios:</code> pour fixer la liste pour tous les utilisateurs.
        </div>
      </div>
    `;

    const input = this.querySelector("#cfg-speaker");
    if (input) {
      input.onchange = (e) => {
        const val = e.target.value.trim();
        const newConfig = { ...this._config };
        if (val) {
          newConfig.default_speaker = val;
        } else {
          delete newConfig.default_speaker;
        }
        const event = new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      };
    }

    const inputUrl = this.querySelector("#cfg-player-url");
    if (inputUrl) {
      inputUrl.onchange = (e) => {
        const val = e.target.value.trim();
        const newConfig = { ...this._config };
        if (val) {
          newConfig.player_url = val;
        } else {
          delete newConfig.player_url;
        }
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true
        }));
      };
    }

    const selRadio = this.querySelector("#cfg-radio-provider");
    if (selRadio) {
      selRadio.onchange = (e) => {
        const val = e.target.value;
        const newConfig = { ...this._config, radio_provider: val };
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true
        }));
      };
    }
  }
}
if (!customElements.get("nas-music-card-editor")) {
  customElements.define("nas-music-card-editor", NasMusicCardEditor);
}
if (!customElements.get("nas-music-card")) {
  customElements.define("nas-music-card", NasMusicCard);
}
class NasMusicPlayerCard extends NasMusicCard {
  static getConfigElement() {
    return document.createElement("nas-music-card-editor");
  }
  static getStubConfig() {
    return {
      default_speaker: "media_player.echo_chambre"
    };
  }
}
if (!customElements.get("nas-music-player-card")) {
  customElements.define("nas-music-player-card", NasMusicPlayerCard);
}

class NasMusicControlCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._timer = null;
  }

  static getConfigElement() {
    return document.createElement("nas-music-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:nas-music-control-card",
      speaker: "media_player.systeme_audio"
    };
  }

  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  connectedCallback() {
    this.render();
    if (!this._timer) {
      this._timer = setInterval(() => this.updateTimeAndProgress(), 1000);
    }
    this._onTrack = () => this.updateCard();
    this._onAudioState = () => this.updateCard();
    this._onSpeaker = () => this.updateCard();
    this._onStorage = (e) => {
      if (e.key === "nas_music_speaker" || e.key === "nas_music_active_meta") {
        this.updateCard();
      }
    };
    window.addEventListener("nas-music-track-changed", this._onTrack);
    window.addEventListener("nas-music-local-audio-state", this._onAudioState);
    window.addEventListener("nas-music-speaker-changed", this._onSpeaker);
    window.addEventListener("storage", this._onStorage);
  }

  disconnectedCallback() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    window.removeEventListener("nas-music-track-changed", this._onTrack);
    window.removeEventListener("nas-music-local-audio-state", this._onAudioState);
    window.removeEventListener("nas-music-speaker-changed", this._onSpeaker);
    window.removeEventListener("storage", this._onStorage);
  }

  getSpeakerId() {
    return this._config?.speaker || localStorage.getItem("nas_music_speaker") || "media_player.echo_chambre";
  }

  isLocalSystemSpeaker(speakerId) {
    const id = speakerId || this.getSpeakerId();
    return id === "media_player.systeme_audio" || id === "local_device" || id === "systeme_audio" || id === "local_browser";
  }

  isDlnaSpeaker(speakerId) {
    const id = speakerId || this.getSpeakerId();
    if (this.isLocalSystemSpeaker(id)) return false;
    return id.includes("sonoro") || id.includes("dlna");
  }

  isAlexaSpeaker(speakerId) {
    return !this.isLocalSystemSpeaker(speakerId) && !this.isDlnaSpeaker(speakerId);
  }

  formatSeconds(sec) {
    if (!sec || isNaN(sec) || sec < 0) return "0:00";
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? "0" : ""}${rem}`;
  }

  getPlaybackInfo() {
    const speakerId = this.getSpeakerId();
    const isLocal = this.isLocalSystemSpeaker(speakerId);
    let title = "Aucun morceau";
    let artist = "En attente";
    let album = "";
    let coverUrl = "";
    let isPlaying = false;
    let duration = 0;
    let curPos = 0;
    let volume = 50;

    // 1. Local HTML5 Audio
    if (isLocal && window._nasMusicLocalAudio) {
      const audio = window._nasMusicLocalAudio;
      isPlaying = !audio.paused && (audio.currentTime > 0 || audio.readyState > 0);
      curPos = (!isNaN(audio.currentTime) && audio.currentTime > 0) ? audio.currentTime : 0;
      duration = (!isNaN(audio.duration) && audio.duration > 0) ? Math.floor(audio.duration) : 0;
      volume = Math.round((audio.volume !== undefined ? audio.volume : 0.8) * 100);
    }

    // Read stored active metadata from main card
    try {
      const stored = localStorage.getItem("nas_music_active_meta");
      if (stored) {
        const meta = JSON.parse(stored);
        if (meta?.title) {
          title = meta.title;
          artist = meta.artist || "";
          album = meta.album || "";
          if (meta.cover) coverUrl = meta.cover;
          if (meta.duration && (!duration || duration === 0)) duration = meta.duration;
        }
      }
    } catch(e) {}

    // 2. HA Speaker Entity Check (Pour les enceintes réseau/Alexa/DLNA uniquement !)
    const speakerState = this._hass?.states?.[speakerId];
    if (speakerState && !isLocal) {
      if (speakerState.attributes?.volume_level !== undefined) {
        volume = Math.round(speakerState.attributes.volume_level * 100);
      }
      if (speakerState.state === "playing") {
        isPlaying = true;
      }
      if (speakerState.attributes?.media_title) {
        title = speakerState.attributes.media_title;
        artist = speakerState.attributes.media_artist || artist;
        album = speakerState.attributes.media_album_name || album;
        if (speakerState.attributes.entity_picture) {
          coverUrl = speakerState.attributes.entity_picture;
        }
        if (speakerState.attributes.media_duration) {
          duration = speakerState.attributes.media_duration;
        }
        if (typeof speakerState.attributes.media_position === "number") {
          const basePos = speakerState.attributes.media_position;
          const updated = speakerState.attributes.media_position_updated_at;
          const elapsed = (speakerState.state === "playing" && updated) ? Math.max(0, (Date.now() - new Date(updated).getTime()) / 1000) : 0;
          curPos = basePos + elapsed;
        }
      }
    }

    // 2b. Capteur NAS pour enceinte Alexa
    const nasSensor = this._hass?.states?.["sensor.nas_music_now_playing"];
    if (this.isAlexaSpeaker(speakerId) && nasSensor && nasSensor.state === "playing" && nasSensor.attributes?.title) {
      isPlaying = true;
      title = nasSensor.attributes.title;
      artist = nasSensor.attributes.artist || artist;
      album = nasSensor.attributes.album || album;
      if (nasSensor.attributes.duration) duration = nasSensor.attributes.duration;
    }

    // 3. Spotify check : Actif uniquement si le NAS n'est PAS en train de jouer et que Spotify cible cette enceinte
    const isNasActivelyPlaying = isPlaying || (nasSensor && nasSensor.state === "playing");
    if (!isNasActivelyPlaying && !isLocal) {
      const spotifyEntity = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
      const spState = this._hass?.states?.[spotifyEntity];
      const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === speakerId);
      const isTargetOfSpotify = (
        (speakerState?.state === "playing" && speakerState?.attributes?.app_name === "Spotify") ||
        (spState?.state === "playing" && speakerObj?.spotifyDevice && (spState?.attributes?.source || "").toLowerCase() === speakerObj.spotifyDevice.toLowerCase())
      );

      if (isTargetOfSpotify) {
        isPlaying = true;
        const activeState = (spState?.state === "playing" || !speakerState?.attributes?.media_title) ? spState : speakerState;
        if (activeState?.attributes?.media_title) {
          title = activeState.attributes.media_title;
          artist = activeState.attributes.media_artist || "";
          album = activeState.attributes.media_album_name || "";
          coverUrl = activeState.attributes.entity_picture || coverUrl;
          duration = activeState.attributes.media_duration || duration;
          if (typeof activeState.attributes.media_position === "number") {
            const updated = activeState.attributes.media_position_updated_at;
            const elapsed = updated ? Math.max(0, (Date.now() - new Date(updated).getTime()) / 1000) : 0;
            curPos = activeState.attributes.media_position + elapsed;
          }
        }
      }
    }

    if (!coverUrl) {
      coverUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/></svg>";
    }

    return { speakerId, isLocal, title, artist, album, coverUrl, isPlaying, duration, curPos, volume };
  }

  updateTimeAndProgress() {
    if (!this.shadowRoot) return;
    const info = this.getPlaybackInfo();
    const titleEl = this.shadowRoot.getElementById("mini-title-txt");
    if (titleEl && titleEl.textContent !== info.title) {
      this.updateCard();
      return;
    }
    const timeCur = this.shadowRoot.getElementById("mini-time-cur");
    const slider = this.shadowRoot.getElementById("mini-progress-slider");
    if (timeCur) timeCur.textContent = this.formatSeconds(info.curPos);
    if (slider && this.shadowRoot.activeElement !== slider) {
      slider.value = Math.floor(info.curPos);
      if (info.duration > 0) slider.max = info.duration;
    }
    const playBtn = this.shadowRoot.getElementById("btn-mini-play");
    if (playBtn) playBtn.textContent = info.isPlaying ? '⏸' : '▶';
  }

  updateCard() {
    if (!this.shadowRoot) return;
    const info = this.getPlaybackInfo();
    const titleEl = this.shadowRoot.getElementById("mini-title-txt");
    const artistEl = this.shadowRoot.getElementById("mini-artist-txt");
    const coverEl = this.shadowRoot.getElementById("mini-cover-img");
    const playBtn = this.shadowRoot.getElementById("btn-mini-play");
    const durEl = this.shadowRoot.getElementById("mini-time-dur");
    const volSlider = this.shadowRoot.getElementById("mini-vol-slider");
    const volIcon = this.shadowRoot.getElementById("mini-vol-icon");
    const sel = this.shadowRoot.getElementById("mini-speaker-select");

    if (titleEl) {
      titleEl.textContent = info.title;
      titleEl.title = info.title;
    }
    if (artistEl) {
      const artTxt = `${info.artist || ''}${info.album ? ' • ' + info.album : ''}`;
      artistEl.textContent = artTxt || 'Artiste inconnu';
      artistEl.title = artTxt;
    }
    if (coverEl && info.coverUrl) coverEl.src = info.coverUrl;
    if (playBtn) playBtn.textContent = info.isPlaying ? '⏸' : '▶';
    if (durEl) durEl.textContent = this.formatSeconds(info.duration);
    if (volSlider && this.shadowRoot.activeElement !== volSlider) volSlider.value = info.volume;
    if (volIcon) volIcon.textContent = info.volume === 0 ? '🔇' : (info.volume < 40 ? '🔉' : '🔊');
    if (sel && sel.value !== info.speakerId) sel.value = info.speakerId;
    this.updateTimeAndProgress();
  }

  render() {
    const info = this.getPlaybackInfo();
    const speakers = DEFAULT_SPEAKERS;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--ha-card-header-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          color: #f3f4f6;
        }
        .mini-card {
          background: var(--ha-card-background, #18181b);
          border-radius: var(--ha-card-border-radius, 14px);
          box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35));
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 14px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        .mini-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%);
          pointer-events: none;
        }
        .mini-top {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .mini-cover-wrap {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          background: #27272a;
          cursor: pointer;
        }
        .mini-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mini-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mini-title {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.25;
          cursor: pointer;
        }
        .mini-artist {
          font-size: 12px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .mini-meta-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .mini-speaker-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 8px;
          border-radius: 12px;
          width: fit-content;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .mini-speaker-select {
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 11px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          max-width: 140px;
        }
        .mini-speaker-select option {
          background: #18181b;
          color: #f3f4f6;
        }
        .mini-open-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 9px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
          user-select: none;
        }
        .mini-open-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #60a5fa;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
        .mini-open-btn:active {
          transform: scale(0.96);
        }
        /* Progress section */
        .mini-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
          position: relative;
          z-index: 1;
        }
        .mini-time {
          font-size: 10px;
          color: #9ca3af;
          font-variant-numeric: tabular-nums;
          min-width: 28px;
        }
        .mini-progress-bar {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          accent-color: #3b82f6;
          transition: height 0.15s;
        }
        .mini-progress-bar:hover {
          height: 6px;
        }
        /* Controls row */
        .mini-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          gap: 8px;
        }
        .mini-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mini-ctrl-btn {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f3f4f6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.15s, transform 0.1s;
        }
        .mini-ctrl-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }
        .mini-ctrl-btn:active {
          transform: scale(0.95);
        }
        .mini-play-btn {
          width: 38px;
          height: 38px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
          transition: background 0.15s, transform 0.1s;
        }
        .mini-play-btn:hover {
          background: #2563eb;
          transform: scale(1.08);
        }
        .mini-play-btn:active {
          transform: scale(0.95);
        }
        /* Volume section */
        .mini-vol-group {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .mini-vol-icon {
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }
        .mini-vol-slider {
          width: 75px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          accent-color: #3b82f6;
        }
      </style>

      <div class="mini-card">
        <div class="mini-top">
          <div class="mini-cover-wrap" id="mini-cover-click" title="Ouvrir le lecteur complet">
            <img class="mini-cover" id="mini-cover-img" src="${info.coverUrl}">
          </div>
          <div class="mini-info">
            <div class="mini-title" id="mini-title-txt" title="${info.title}">${info.title}</div>
            <div class="mini-artist" id="mini-artist-txt" title="${info.artist}">${info.artist}${info.album ? ' • ' + info.album : ''}</div>
            <div class="mini-meta-actions">
              <div class="mini-speaker-pill">
                <span>🔊</span>
                <select class="mini-speaker-select" id="mini-speaker-select">
                  ${speakers.map(s => `<option value="${s.id}" ${s.id === info.speakerId ? 'selected' : ''}>${s.name}</option>`).join("")}
                </select>
              </div>
              <button class="mini-open-btn" id="btn-mini-open" title="Ouvrir le lecteur complet pour choisir ou changer les titres">
                <span>🎶</span>
                <span>Changer de titre</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mini-progress">
          <span class="mini-time" id="mini-time-cur">${this.formatSeconds(info.curPos)}</span>
          <input type="range" class="mini-progress-bar" id="mini-progress-slider" min="0" max="${info.duration || 100}" value="${Math.floor(info.curPos)}">
          <span class="mini-time" id="mini-time-dur">${this.formatSeconds(info.duration)}</span>
        </div>

        <div class="mini-bottom">
          <div class="mini-btn-group">
            <button class="mini-ctrl-btn" id="btn-mini-prev" title="Morceau précédent">⏮</button>
            <button class="mini-play-btn" id="btn-mini-play" title="${info.isPlaying ? 'Pause' : 'Lecture'}">${info.isPlaying ? '⏸' : '▶'}</button>
            <button class="mini-ctrl-btn" id="btn-mini-next" title="Morceau suivant">⏭</button>
          </div>

          <div class="mini-vol-group">
            <span class="mini-vol-icon" id="mini-vol-icon">${info.volume === 0 ? '🔇' : (info.volume < 40 ? '🔉' : '🔊')}</span>
            <input type="range" class="mini-vol-slider" id="mini-vol-slider" min="0" max="100" value="${info.volume}">
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const root = this.shadowRoot;
    if (!root) return;

    // Speaker select
    const sel = root.getElementById("mini-speaker-select");
    if (sel) {
      sel.onchange = () => {
        const sid = sel.value;
        localStorage.setItem("nas_music_speaker", sid);
        const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === sid);
        if (speakerObj && speakerObj.zone && this._hass) {
          this._hass.callService("input_select", "select_option", {
            entity_id: "input_select.zone_ecoute_multimedia",
            option: speakerObj.zone
          }).catch(() => {});
        }
        window.dispatchEvent(new CustomEvent("nas-music-speaker-changed", { detail: { speaker: sid } }));
        this.updateCard();
      };
    }

    // Play / Pause
    const playBtn = root.getElementById("btn-mini-play");
    if (playBtn) {
      playBtn.onclick = () => {
        const info = this.getPlaybackInfo();
        if (info.isLocal) {
          if (window._nasMusicLocalAudio) {
            if (window._nasMusicLocalAudio.paused) window._nasMusicLocalAudio.play().catch(() => {});
            else window._nasMusicLocalAudio.pause();
          }
          this.updateCard();
          return;
        }
        const spotifyEntity = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
        const spState = this._hass?.states?.[spotifyEntity];
        const speakerState = this._hass?.states?.[info.speakerId];
        const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === info.speakerId);
        const isSpotify = !info.isLocal && (
          (speakerState?.attributes?.app_name === "Spotify") ||
          (spState?.state === "playing" && speakerObj?.spotifyDevice && (spState?.attributes?.source || "").toLowerCase() === speakerObj.spotifyDevice.toLowerCase())
        );
        if (isSpotify) {
          this._hass.callService("media_player", "media_play_pause", { entity_id: spotifyEntity });
          return;
        }
        if (!this._hass) return;
        if (this.isAlexaSpeaker(info.speakerId)) {
          const cmd = info.isPlaying ? "pause" : "reprends";
          this._hass.callService("media_player", "play_media", {
            entity_id: info.speakerId,
            media_content_type: "custom",
            media_content_id: cmd
          });
          this._hass.callService("media_player", info.isPlaying ? "media_pause" : "media_play", {
            entity_id: info.speakerId
          });
        } else {
          this._hass.callService("media_player", "media_play_pause", { entity_id: info.speakerId });
        }
      };
    }

    // Next Track
    const nextBtn = root.getElementById("btn-mini-next");
    if (nextBtn) {
      nextBtn.onclick = () => {
        const info = this.getPlaybackInfo();
        if (info.isLocal) {
          window.dispatchEvent(new CustomEvent("nas-music-remote-next"));
          return;
        }
        const spotifyEntity = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
        const spState = this._hass?.states?.[spotifyEntity];
        const speakerState = this._hass?.states?.[info.speakerId];
        const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === info.speakerId);
        const isSpotify = !info.isLocal && (
          (speakerState?.attributes?.app_name === "Spotify") ||
          (spState?.state === "playing" && speakerObj?.spotifyDevice && (spState?.attributes?.source || "").toLowerCase() === speakerObj.spotifyDevice.toLowerCase())
        );
        if (isSpotify) {
          this._hass.callService("media_player", "media_next_track", { entity_id: spotifyEntity });
          return;
        }
        if (!this._hass) return;
        this._hass.callService("media_player", "media_next_track", { entity_id: info.speakerId });
      };
    }

    // Previous Track
    const prevBtn = root.getElementById("btn-mini-prev");
    if (prevBtn) {
      prevBtn.onclick = () => {
        const info = this.getPlaybackInfo();
        if (info.isLocal) {
          window.dispatchEvent(new CustomEvent("nas-music-remote-prev"));
          return;
        }
        const spotifyEntity = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
        const spState = this._hass?.states?.[spotifyEntity];
        const speakerState = this._hass?.states?.[info.speakerId];
        const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === info.speakerId);
        const isSpotify = !info.isLocal && (
          (speakerState?.attributes?.app_name === "Spotify") ||
          (spState?.state === "playing" && speakerObj?.spotifyDevice && (spState?.attributes?.source || "").toLowerCase() === speakerObj.spotifyDevice.toLowerCase())
        );
        if (isSpotify) {
          this._hass.callService("media_player", "media_previous_track", { entity_id: spotifyEntity });
          return;
        }
        if (!this._hass) return;
        this._hass.callService("media_player", "media_previous_track", { entity_id: info.speakerId });
      };
    }

    // Progress bar seek
    const progBar = root.getElementById("mini-progress-slider");
    if (progBar) {
      progBar.onchange = () => {
        const pos = parseFloat(progBar.value);
        const info = this.getPlaybackInfo();
        if (info.isLocal && window._nasMusicLocalAudio) {
          window._nasMusicLocalAudio.currentTime = pos;
          return;
        }
        const spotifyEntity = this._config?.spotify_player || "media_player.spotifyplus_alaindaix";
        const spState = this._hass?.states?.[spotifyEntity];
        const speakerState = this._hass?.states?.[info.speakerId];
        const speakerObj = DEFAULT_SPEAKERS.find(s => s.id === info.speakerId);
        const isSpotify = !info.isLocal && (
          (speakerState?.attributes?.app_name === "Spotify") ||
          (spState?.state === "playing" && speakerObj?.spotifyDevice && (spState?.attributes?.source || "").toLowerCase() === speakerObj.spotifyDevice.toLowerCase())
        );
        if (isSpotify) {
          this._hass.callService("media_player", "media_seek", {
            entity_id: spotifyEntity,
            seek_position: pos
          });
          return;
        }
        if (!this._hass) return;
        this._hass.callService("media_player", "media_seek", {
          entity_id: info.speakerId,
          seek_position: pos
        });
      };
    }

    // Volume slider
    const volSlider = root.getElementById("mini-vol-slider");
    if (volSlider) {
      volSlider.oninput = () => {
        const val = parseFloat(volSlider.value);
        const info = this.getPlaybackInfo();
        if (info.isLocal && window._nasMusicLocalAudio) {
          window._nasMusicLocalAudio.volume = val / 100;
          localStorage.setItem("nas_music_local_volume", String(val / 100));
          return;
        }
        if (!this._hass) return;
        this._hass.callService("media_player", "volume_set", {
          entity_id: info.speakerId,
          volume_level: val / 100
        });
      };
    }

    // Cover / Title / Changer de titre button click -> Scroll to or focus main player if present
    const coverClick = root.getElementById("mini-cover-click");
    const titleClick = root.getElementById("mini-title-txt");
    const openBtn = root.getElementById("btn-mini-open");

    const onOpenMain = () => {
      let targetUrl = (this._config?.player_url || "/lovelace/multimedias").trim();
      if (!targetUrl.startsWith("/") && !targetUrl.startsWith("http")) {
        targetUrl = `/lovelace/${targetUrl}`;
      }

      const findInRoot = (node) => {
        if (!node) return null;
        const direct = node.querySelector ? node.querySelector("nas-music-player-card, nas-music-card") : null;
        if (direct) return direct;
        const all = node.querySelectorAll ? node.querySelectorAll("*") : [];
        for (const child of all) {
          if (child.shadowRoot) {
            const found = findInRoot(child.shadowRoot);
            if (found) return found;
          }
        }
        return null;
      };

      const mainPlayer = findInRoot(document.body);
      const isTargetUrl = window.location.pathname === targetUrl;

      if (mainPlayer && isTargetUrl) {
        mainPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
        mainPlayer.style.transition = "box-shadow 0.3s ease";
        mainPlayer.style.boxShadow = "0 0 0 3px #3b82f6, 0 10px 25px rgba(0,0,0,0.5)";
        setTimeout(() => {
          mainPlayer.style.boxShadow = "";
        }, 1500);
      } else {
        if (window.location.pathname !== targetUrl) {
          if (history && history.pushState) {
            history.pushState(null, "", targetUrl);
            window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
          } else {
            window.location.href = targetUrl;
          }
        } else if (mainPlayer) {
          mainPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    if (coverClick) coverClick.onclick = onOpenMain;
    if (titleClick) titleClick.onclick = onOpenMain;
    if (openBtn) openBtn.onclick = onOpenMain;
  }
}

if (!customElements.get("nas-music-control-card")) {
  customElements.define("nas-music-control-card", NasMusicControlCard);
}
if (!customElements.get("nas-music-mini-card")) {
  customElements.define("nas-music-mini-card", NasMusicControlCard);
}

console.log("NAS Music Player Card (v3.4.2) registered successfully!");
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "nas-music-player-card")) {
  window.customCards.push({
    type: "nas-music-player-card",
    name: "NAS Music Player",
    preview: true,
    description: "Lecteur NAS complet avec sélection d'enceinte, Spotify, paroles LRC synchronisées et file de lecture"
  });
}
if (!window.customCards.some(c => c.type === "nas-music-card")) {
  window.customCards.push({
    type: "nas-music-card",
    name: "NAS Music Card",
    preview: true,
    description: "Lecteur NAS & Spotify complet"
  });
}
if (!window.customCards.some(c => c.type === "nas-music-control-card")) {
  window.customCards.push({
    type: "nas-music-control-card",
    name: "NAS Music Control Card (Mini)",
    preview: true,
    description: "Mini carte de contrôle compacte style media-control pour le NAS, Spotify et Radios"
  });
}
