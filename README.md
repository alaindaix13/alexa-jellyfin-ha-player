# 🎵 Alexa Jellyfin HA Player

Solution complète pour diffuser et piloter votre musique hébergée sur un NAS (**Jellyfin**) directement sur des enceintes **Amazon Echo (Alexa)**, avec une interface tactile tout-en-un sur **Home Assistant** (pochettes, paroles défilantes synchronisées `.lrc`, radios web et Spotify en option).

---

## 🏛️ Architecture & Fonctionnement

```
[Carte Lovelace (Home Assistant)]
       │
       ▼
 1. Clic sur Album/Titre : Envoi d'une commande vocale muette simulée
    service: media_player.play_media
    media_content_type: "custom"
    media_content_id: "demande à mon nas de jouer l'album <Nom>"
       │
       ▼
 [Serveurs Amazon Alexa]
       │
       ▼
 2. Appel Webhook HTTPS : https://alexa.<domaine>
       │
       ▼
 [Reverse Proxy Nginx (Port 443 SSL)]
       │
       ▼
 [Conteneur Docker : jellyfin-alexa-skill]
       │
       ├─ Recherche du titre/album dans Jellyfin
       └─ Renvoie la directive Alexa "AudioPlayer.Play" avec l'URL MP3 statique
       │
       ▼
 [Enceinte Amazon Echo]
       │
       ▼
 3. Lit le flux audio direct en HTTPS depuis Jellyfin :
    https://jelly.<domaine>/Audio/<id>/stream.mp3?static=true
```

---

## 📁 Structure du Projet

```text
alexa-jellyfin-ha-player/
├── docker-skill/               # Conteneur Docker du Skill Alexa patché
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── config/
│   │   └── skill.conf.example  # Modèle de configuration avec vos identifiants
│   └── custom/
│       ├── apply_patch.py      # Patch FR, direct MP3 streaming & hook HA
│       ├── interaction_model_fr_FR.json
│       ├── skill_fr.po
│       └── skill_fr.mo
├── nginx/                      # Modèles de Virtual Hosts pour Reverse Proxy
│   ├── alexa-jellyfin.conf     # Webhook Skill Alexa
│   └── jellyfin.conf           # Serveur Jellyfin
├── ha-card/                    # Carte Lovelace tout-en-un Home Assistant
│   ├── nas-music-player-card.js
│   └── card-example.yaml       # Exemples de configuration YAML
└── README.md
```

---

## 📋 Pré-requis

1. **Nom de domaine public** (ex: `mondomaine.fr` ou DuckDNS).
2. **Certificat SSL valide (Let's Encrypt)** émis sur le port standard **443**. Amazon Alexa **refuse les certificats auto-signés** et les ports non standards pour l'AudioPlayer.
3. **Ports 80 et 443** ouverts sur votre routeur/box internet redirigeant vers votre Nginx.
4. **Serveur Jellyfin fonctionnel** avec vos albums/morceaux tagués.
5. **Compte Amazon Developer** (gratuit, sur le même compte Amazon que vos enceintes Echo).
6. **Home Assistant** avec l'intégration HACS `Alexa Media Player` configurée.

---

## 🚀 Guide de Déploiement Pas à Pas

### Étape 1 : Obtenir les identifiants Amazon Developer (LWA & ASK-CLI)

1. Connectez-vous sur [developer.amazon.com](https://developer.amazon.com/alexa/console/ask).
2. Allez dans **Settings** (en haut à droite) > **Security Profiles** > **Create a New Security Profile** :
   - Remplissez le nom (ex: `Jellyfin Skill`).
   - Onglet **Web Settings** : ajoutez l'URL de redirection : `http://127.0.0.1:9090/cb`.
   - Notez votre **Client ID** (`amzn1.application-oa2-client...`) et **Client Secret**.
3. Sur votre ordinateur (avec Node.js installé), installez l'outil ASK-CLI et générez le `refresh_token` :
   ```bash
   npm install -g ask-cli
   ask util generate-lwa-tokens --client-id <VOTRE_CLIENT_ID> --client-confirmation <VOTRE_CLIENT_SECRET>
   ```
   Une page de connexion Amazon s'ouvre, autorisez l'accès et copiez le `refresh_token` affiché dans le terminal.
4. Créez le Skill dans la console Alexa :
   - Cliquez sur **Create Skill** > Nom : `Jellyfin Player` > Langue : **French (FR)**.
   - Modèle : **Custom** > Backend : **Provision your own**.
   - Dans **Interfaces** : activez la case **Audio Player** (indispensable !).
   - Dans **Endpoint** : sélectionnez **HTTPS**, entrez `https://alexa.<VOTRE_DOMAINE>` et choisissez : *"My development endpoint has a Certificate from a trusted Certificate Authority"*.
   - Notez le **Skill ID** (`amzn1.ask.skill.xxxxxxxx-...`).

---

### Étape 2 : Configurer le Reverse Proxy Nginx

Copiez les configurations du dossier `nginx/` dans le dossier de configuration de votre serveur Nginx :

1. `nginx/alexa-jellyfin.conf` :
   - Remplacez `alexa.votredomaine.fr` par votre sous-domaine.
   - Vérifiez les chemins vers vos certificats SSL (`fullchain.pem` et `privkey.pem`).
   - Veillez à ce que les headers `SignatureCertChainUrl` et `Signature` soient présents (requis par Amazon).
2. `nginx/jellyfin.conf` :
   - Remplacez `jelly.votredomaine.fr` par votre sous-domaine Jellyfin.
   - Ajustez l'IP locale de votre serveur Jellyfin (`proxy_pass http://192.168.x.x:8096;`).
3. Rechargez Nginx (`nginx -s reload` ou `docker restart nginx`).

---

### Étape 3 : Configurer et démarrer le conteneur du Skill

1. Rendez-vous dans le dossier `docker-skill/` :
   ```bash
   cd docker-skill
   ```
2. Créez votre fichier de configuration à partir de l'exemple :
   ```bash
   cp config/skill.conf.example config/skill.conf
   ```
3. Éditez `config/skill.conf` avec vos vraies valeurs :
   - `skill_id` : votre Skill ID Amazon.
   - `jellyfin_endpoint` : `https://jelly.<VOTRE_DOMAINE>`.
   - `skill_endpoint` : `https://alexa.<VOTRE_DOMAINE>`.
   - `user` et `password` : vos identifiants Jellyfin.
   - `client_id`, `client_secret` et `refresh_token` : vos clés SMAPI générées à l'Étape 1.
4. Construisez et lancez le conteneur :
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```
5. Consultez les logs pour vérifier le déploiement automatique du modèle vocal :
   ```bash
   docker compose logs -f
   ```
   Le conteneur compile et pousse automatiquement le modèle d'interaction en français sur votre console Amazon.

---

### Étape 4 : Configurer la Carte Multimédias dans Home Assistant

#### 1. Installation du fichier JavaScript
1. Copiez le fichier `ha-card/nas-music-player-card.js` dans le dossier `www` de votre Home Assistant :
   - Emplacement : `/config/www/nas-music-player-card.js`
2. Dans Home Assistant, allez dans **Paramètres** > **Tableaux de bord** > Menu 3 points (en haut à droite) > **Ressources** :
   - Cliquez sur **Ajouter une ressource**
   - URL : `/local/nas-music-player-card.js?v=1.0.0`
   - Type : `Module JavaScript`

#### 2. Configuration via l'Éditeur Graphique (UI)
Ajoutez une carte personnalisée `custom:nas-music-player-card`. Vous pouvez la configurer directement depuis l'interface visuelle :
- **URL Jellyfin** : ex. `https://jelly.mondomaine.fr`
- **Clé API Jellyfin** : créée dans Jellyfin (*Tableau de bord > Avancé > Clés d'API*)
- **Enceinte par défaut** : ex. `media_player.echo_salon`
- **Nom d'invocation vocal** : ex. `mon nas`
- **Spotify** : case à cocher pour l'activer ou la masquer entièrement.

#### 3. Configuration Avancée en YAML (Dossiers et Catégories Personnalisés)
Pour adapter la carte aux dossiers spécifiques de votre serveur Jellyfin (ex: Compilations, Rock, Pop...) ou masquer Spotify :

```yaml
type: custom:nas-music-player-card
jellyfin_url: "https://jelly.mondomaine.fr"
jellyfin_token: "votre_cle_api_jellyfin"
default_speaker: media_player.echo_salon
skill_invocation: "mon nas"

# Spotify : masqué par défaut si non configuré
show_spotify: false

# Définissez vos propres onglets et dossiers Jellyfin :
categories:
  - id: "favorites"
    label: "⭐ Favoris"
    type: "favorites"

  - id: "albums"
    label: "💿 Tous les Albums"
    type: "jellyfin"
    itemTypes: "MusicAlbum"

  - id: "compilations"
    label: "📁 Compilations"
    type: "jellyfin"
    parentId: "91dee17855cfbed5eaab9fd7aaed6566"
    itemTypes: "MusicAlbum"

  - id: "rock"
    label: "🎸 Rock"
    type: "jellyfin"
    parentId: "3ba5494bda5a2b42d7cb341bc2cb8f58"
    itemTypes: "MusicAlbum"

  - id: "playlists"
    label: "📑 Playlists"
    type: "jellyfin"
    itemTypes: "Playlist"

  - id: "radios"
    label: "📻 Radios"
    type: "radios"

# Liste de vos enceintes :
speakers:
  - id: media_player.echo_salon
    name: "Echo Salon"
    zone: "Salon"
    icon: "🛋️"
    isAlexa: true
  - id: media_player.echo_chambre
    name: "Echo Chambre"
    zone: "Chambre"
    icon: "🛏️"
    isAlexa: true
```

> 💡 **Comment trouver le `parentId` d'un dossier dans Jellyfin ?**  
> 1. Ouvrez Jellyfin dans votre navigateur web.  
> 2. Cliquez sur le dossier ou la bibliothèque que vous souhaitez afficher.  
> 3. Regardez la barre d'adresse de votre navigateur : `https://jelly.mondomaine.fr/web/index.html#!/item?id=3ba5494bda5a2b42d7cb341bc2cb8f58`.  
> 4. Copiez la chaîne de caractères après `?id=` : c'est votre `parentId` !

---

## 🎯 Fonctionnalités Clés incluses

- 🎤 **Commandes Vocales en Français** :
  - *"Alexa, demande à mon nas de jouer Queen"*
  - *"Alexa, demande à mon nas de jouer l'album 70s"* (conversion phonétique intégrée)
  - *"Alexa, pause / suivant / précédent"*
- 📱 **Interface Tactile Lovelace Complète** :
  - Navigation par Albums, Artistes, Favoris, Playlists et dossiers sur mesure.
  - Paroles karaoké synchronisées en temps réel (fichiers `.lrc` Jellyfin ou base mondiale LRCLIB).
  - Gestion du volume individuel par enceinte et multi-diffusion.
  - Gestionnaire graphique des stations de radio (Audio Player, TuneIn, Radioplayer).
  - Spotify entièrement désactivable.

---

## 📄 Licence
Projet sous licence MIT. Basé sur les travaux open-source de [jellyfin_alexa_skill](https://github.com/infinityofspace/jellyfin_alexa_skill).
