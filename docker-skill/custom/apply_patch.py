import os, sys, json, shutil

pkg_dir = "/opt/venv/lib/python3.10/site-packages/jellyfin_alexa_skill-0.3.1-py3.10.egg/jellyfin_alexa_skill"

# 1. Copy interaction_model_fr_FR.json
interaction_dir = os.path.join(pkg_dir, "alexa", "setup", "interaction")
shutil.copy("/custom/interaction_model_fr_FR.json", os.path.join(interaction_dir, "interaction_model_fr_FR.json"))

# 2. Patch model.py
model_py_path = os.path.join(interaction_dir, "model.py")
with open(model_py_path, "r", encoding="utf-8") as f:
    content = f.read()

patch_code = """
INTERACTION_MODEL_FR_FR = DefaultSerializer().deserialize(
    pkg_resources.read_text(interaction, "interaction_model_fr_FR.json"),
    InteractionModelData)

INTERACTION_MODELS = {
    "en-US": INTERACTION_MODEL_EN_US,
    "de-DE": INTERACTION_MODEL_DE_DE,
    "fr-FR": INTERACTION_MODEL_FR_FR
}
"""
if "INTERACTION_MODEL_FR_FR" not in content:
    content = content.replace('INTERACTION_MODELS = {\n    "en-US": INTERACTION_MODEL_EN_US,\n    "de-DE": INTERACTION_MODEL_DE_DE\n}', patch_code)
    with open(model_py_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("model.py patched successfully")

# 3. Patch manifest.json
manifest_json_path = os.path.join(pkg_dir, "alexa", "setup", "manifest", "manifest.json")
with open(manifest_json_path, "r", encoding="utf-8") as f:
    manifest_data = json.load(f)

manifest_data["manifest"]["publishingInformation"]["locales"]["fr-FR"] = {
    "summary": "Skill Jellyfin pour Alexa",
    "examplePhrases": [
        "Alexa lance jellyfin player",
        "Alexa demande à jellyfin player de jouer Queen",
        "Alexa demande à jellyfin player de jouer mes favoris"
    ],
    "keywords": [
        "jellyfin",
        "player",
        "musique"
    ],
    "name": "Jellyfin Player",
    "description": "Skill pour écouter votre musique hébergée sur votre serveur Jellyfin."
}

with open(manifest_json_path, "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2, ensure_ascii=False)
print("manifest.json patched successfully")

# 4. Add fr locale LC_MESSAGES skill.mo
fr_locale_dir = os.path.join(pkg_dir, "locales", "fr", "LC_MESSAGES")
os.makedirs(fr_locale_dir, exist_ok=True)
shutil.copy("/custom/skill_fr.po", os.path.join(fr_locale_dir, "skill.po"))
shutil.copy("/custom/skill_fr.mo", os.path.join(fr_locale_dir, "skill.mo"))
print("fr locales copied successfully")

# 5. Patch config.py
config_py_path = os.path.join(pkg_dir, "config.py")
with open(config_py_path, "r", encoding="utf-8") as f:
    config_code = f.read()

if "FR_TRANSLATION" not in config_code:
    config_code = config_code.replace(
        'DE_TRANSLATION = gettext.translation("skill", localedir=Path(__file__).resolve().parent / "locales", languages=("de",))',
        'DE_TRANSLATION = gettext.translation("skill", localedir=Path(__file__).resolve().parent / "locales", languages=("de",))\nFR_TRANSLATION = gettext.translation("skill", localedir=Path(__file__).resolve().parent / "locales", languages=("fr",))'
    )
    config_code = config_code.replace(
        '"de-DE": DE_TRANSLATION',
        '"de-DE": DE_TRANSLATION,\n    "fr-FR": FR_TRANSLATION'
    )
    with open(config_py_path, "w", encoding="utf-8") as f:
        f.write(config_code)
    print("config.py patched successfully")

# 6. Patch client.py for standard Authorization header
client_py_path = os.path.join(pkg_dir, "jellyfin", "api", "client.py")
with open(client_py_path, "r", encoding="utf-8") as f:
    client_code = f.read()

client_code = client_code.replace('"X-Emby-Authorization": self._build_emby_auth_header()', '"Authorization": self._build_emby_auth_header()')
client_code = client_code.replace('"X-Emby-Authorization": self._build_emby_auth_header(token=token)', '"Authorization": self._build_emby_auth_header(token=token)')

old_header_line = 'header = f"MediaBrowser Client={client_name}, Device={device_name}, DeviceId={device_id}, Version={version}"'
new_header_line = 'header = f\'MediaBrowser Client="{client_name}", Device="{device_name}", DeviceId="{device_id}", Version="{version}"\''
client_code = client_code.replace(old_header_line, new_header_line)

old_token_line = 'header += ", Token={}".format(token)'
new_token_line = 'header += \', Token="{}"\'.format(token)'
client_code = client_code.replace(old_token_line, new_token_line)

# 7. Patch client.py audio stream to direct mp3 streaming for Echo devices
old_stream_block = """            path = f"/Audio/{item_id}/universal"
            params = {
                'UserId': user_id,
                'DeviceId': device_id,
                "MaxStreamingBitrate": max_streaming_bitrate,
                "PlaySessionId": play_info["PlaySessionId"],
                "api_key": token,
                "AudioCodec": audio_codec
            }"""

new_stream_block = """            path = f"/Audio/{item_id}/stream.mp3"
            params = {
                "static": "true"
            }"""

if old_stream_block in client_code:
    client_code = client_code.replace(old_stream_block, new_stream_block)
    print("client.py patched for direct mp3 streaming!")

with open(client_py_path, "w", encoding="utf-8") as f:
    f.write(client_code)
# 8. Patch util.py with convert_french_numbers
util_py_path = os.path.join(pkg_dir, "alexa", "util.py")
with open(util_py_path, "r", encoding="utf-8") as f:
    util_code = f.read()

convert_func = r"""
def convert_french_numbers(text: str) -> str:
    import re
    if not text:
        return text

    units = {
        'zero': 0, 'zéro': 0, 'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4,
        'cinq': 5, 'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
        'onze': 11, 'douze': 12, 'treize': 13, 'quatorze': 14, 'quinze': 15,
        'seize': 16, 'dix_sept': 17, 'dix_huit': 18, 'dix_neuf': 19
    }
    tens = {
        'vingt': 20, 'vingts': 20, 'trente': 30, 'quarante': 40,
        'cinquante': 50, 'soixante': 60, 'soixante_dix': 70,
        'quatre_vingt': 80, 'quatre_vingts': 80, 'quatre_vingt_dix': 90
    }

    t = text.lower()
    t = re.sub(r'\bquatre[\s-]+vingts?[\s-]+dix\b', 'quatre_vingt_dix', t)
    t = re.sub(r'\bquatre[\s-]+vingts?\b', 'quatre_vingt', t)
    t = re.sub(r'\bsoixante[\s-]+dix\b', 'soixante_dix', t)
    t = re.sub(r'\bdix[\s-]+sept\b', 'dix_sept', t)
    t = re.sub(r'\bdix[\s-]+huit\b', 'dix_huit', t)
    t = re.sub(r'\bdix[\s-]+neuf\b', 'dix_neuf', t)
    t = t.replace('-', ' ')

    all_num_keys = set(list(units.keys()) + list(tens.keys()) + ['cent', 'cents', 'mille', 'milles', 'et'])
    words = t.split()
    result = []
    i = 0
    while i < len(words):
        w = words[i]
        if w in all_num_keys and w != 'et':
            num_tokens = []
            j = i
            while j < len(words) and words[j] in all_num_keys:
                if words[j] != 'et':
                    num_tokens.append(words[j])
                j += 1
            total = 0
            cur = 0
            for tok in num_tokens:
                if tok in units:
                    cur += units[tok]
                elif tok in tens:
                    cur += tens[tok]
                elif tok in ('cent', 'cents'):
                    cur = (cur if cur > 0 else 1) * 100
                elif tok in ('mille', 'milles'):
                    total += (cur if cur > 0 else 1) * 1000
                    cur = 0
            val = total + cur
            result.append(str(val))
            i = j
        else:
            result.append(words[i])
            i += 1
    res = ' '.join(result)
    res = re.sub(r'\b(\d+)\s*\'?\s*s\.?(?=\s|$)', r'\1s', res)
    return res
"""

if "def convert_french_numbers" not in util_code:
    util_code += "\n" + convert_func + "\n"
    with open(util_py_path, "w", encoding="utf-8") as f:
        f.write(util_code)
    print("util.py patched successfully")

# 9. Patch control.py (PlayAlbumIntentHandler)
control_py_path = os.path.join(pkg_dir, "alexa", "handler", "control.py")
with open(control_py_path, "r", encoding="utf-8") as f:
    control_code = f.read()

if "convert_french_numbers" not in control_code:
    old_imp = "from jellyfin_alexa_skill.alexa.util import set_shuffle_queue_idxs, build_stream_response, MediaTypeSlot, \\\n    get_similarity, best_matches_by_idx"
    new_imp = "from jellyfin_alexa_skill.alexa.util import set_shuffle_queue_idxs, build_stream_response, MediaTypeSlot, \\\n    get_similarity, best_matches_by_idx, convert_french_numbers"
    control_code = control_code.replace(old_imp, new_imp)

    old_album_block = """        album_search_results = self.jellyfin_client.search_media_items(user_id=user.jellyfin_user_id,
                                                                       token=user.jellyfin_token,
                                                                       term=album_name,
                                                                       media=MediaType.ALBUM,
                                                                       Filters="IsFolder")
        if musician:
            musician = musician.lower()
            # filter album search results with the searched musician
            artists_search_results = self.jellyfin_client.search_artist(user_id=user.jellyfin_user_id,
                                                                        token=user.jellyfin_token,
                                                                        term=musician)
            artists_ids = set([artists["Id"] for artists in artists_search_results])

            album_search_results = [album for album in album_search_results if
                                    set(artist["Id"] for artist in album["AlbumArtists"]).intersection(artists_ids)]

        if len(album_search_results) == 0:
            # no search results
            handler_input.response_builder.speak(no_result_response_text)
            return handler_input.response_builder.response"""

    new_album_block = """        import re
        raw_album = handler_input.request_envelope.request.intent.slots["album"].value
        raw_musician = handler_input.request_envelope.request.intent.slots["musician"].value

        no_result_response_text = translation.gettext(
            "Sorry, I can't find any songs for this search. Please try again.")

        if not raw_album:
            handler_input.response_builder.speak(no_result_response_text)
            return handler_input.response_builder.response

        album_name = raw_album.strip()
        musician = raw_musician.strip().lower() if raw_musician else None

        # 1. Nettoyer les prefixes courants de reconnaissance vocale
        album_name = re.sub(r"^(?:l[\x27\u2019]album\s+d[\x27\u2019]|l[\x27\u2019]album\s+|l[\x27\u2019]ep\s+|le\s+disque\s+|l[\x27\u2019]opus\s+|album\s+)", "", album_name, flags=re.I).strip()

        # 2. Separer ' de ' / ' par ' si le musicien n'a pas ete scinde par le slot Alexa
        if not musician and re.search(r"\s+\b(?:de|par)\b\s+", album_name, flags=re.I):
            parts = re.split(r"\s+\b(?:de|par)\b\s+", album_name, maxsplit=1, flags=re.I)
            album_name = parts[0].strip()
            musician = parts[1].strip().lower()

        # 3. Convertir les nombres en francais (vingt-cinq -> 25, 70 s. -> 70s, etc.)
        converted = convert_french_numbers(album_name)
        search_terms = [converted] if converted != album_name else [album_name]
        if converted != album_name:
            search_terms.append(album_name)

        # 4. Rechercher les albums dans Jellyfin
        album_search_results = []
        for term in search_terms:
            res = self.jellyfin_client.search_media_items(user_id=user.jellyfin_user_id,
                                                          token=user.jellyfin_token,
                                                          term=term,
                                                          media=MediaType.ALBUM,
                                                          Filters="IsFolder")
            if res:
                album_search_results = res
                album_name = term
                break

        # 5. Filtrer par musicien si renseigne (sans vider les resultats en cas de compilation)
        if musician and album_search_results:
            filtered = []
            for a in album_search_results:
                artists_in_album = [art["Name"].lower() for art in a.get("AlbumArtists", [])]
                if any(musician in art or art in musician for art in artists_in_album):
                    filtered.append(a)
            if filtered:
                album_search_results = filtered

        # 6. Repli 1 : Recherche dans les playlists si aucun album trouve
        if not album_search_results:
            for term in search_terms:
                playlists = self.jellyfin_client.get_playlist(user_id=user.jellyfin_user_id,
                                                              token=user.jellyfin_token,
                                                              playlist_name=term)
                if playlists:
                    best_playlist = playlists[0]
                    playlist_items = self.jellyfin_client.get_playlist_items(user_id=user.jellyfin_user_id,
                                                                             token=user.jellyfin_token,
                                                                             playlist_id=best_playlist["Id"])
                    if playlist_items:
                        playback_items = [PlaybackItem(item["Id"], item["Name"], item["Artists"])
                                          for item in playlist_items]
                        user_id = handler_input.request_envelope.context.system.user.user_id
                        playback = set_playback_queue(user_id, playback_items, reset=True)
                        build_stream_response(jellyfin_client=self.jellyfin_client,
                                              jellyfin_user_id=user.jellyfin_user_id,
                                              jellyfin_token=user.jellyfin_token,
                                              handler_input=handler_input,
                                              playback=playback,
                                              idx=0)
                        return handler_input.response_builder.response

        # 7. Repli 2 : Recherche par artiste si le nom d'album correspondait a un artiste
        if not album_search_results:
            for term in search_terms:
                artists = self.jellyfin_client.search_artist(user_id=user.jellyfin_user_id,
                                                             token=user.jellyfin_token,
                                                             term=term)
                if artists:
                    artist_item = artists[0]
                    items = self.jellyfin_client.get_artist_items(user_id=user.jellyfin_user_id,
                                                                  token=user.jellyfin_token,
                                                                  artist_id=artist_item["Id"],
                                                                  media=MediaType.AUDIO)
                    if items:
                        playback_items = [PlaybackItem(item["Id"], item["Name"], item["Artists"])
                                          for item in items]
                        user_id = handler_input.request_envelope.context.system.user.user_id
                        playback = set_playback_queue(user_id, playback_items, reset=True)
                        build_stream_response(jellyfin_client=self.jellyfin_client,
                                              jellyfin_user_id=user.jellyfin_user_id,
                                              jellyfin_token=user.jellyfin_token,
                                              handler_input=handler_input,
                                              playback=playback,
                                              idx=0)
                        return handler_input.response_builder.response

        if not album_search_results:
            handler_input.response_builder.speak(no_result_response_text)
            return handler_input.response_builder.response

        # 8. Selection du meilleur album et lecture DIRECTE immediate (jamais de question de confirmation)
        exact = [a for a in album_search_results if a["Name"].strip().lower() == album_name.strip().lower()]
        if exact:
            album = exact[0]
        else:
            scored = sorted(album_search_results, key=lambda a: get_similarity(a["Name"].lower(), album_name.lower()), reverse=True)
            album = scored[0]

        items = self.jellyfin_client.get_album_items(user_id=user.jellyfin_user_id,
                                                     token=user.jellyfin_token,
                                                     album_id=album["Id"])
        if not items:
            handler_input.response_builder.speak(no_result_response_text)
            return handler_input.response_builder.response

        playback_items = [PlaybackItem(item["Id"], item["Name"], item["Artists"])
                          for item in items]

        user_id = handler_input.request_envelope.context.system.user.user_id
        playback = set_playback_queue(user_id, playback_items, reset=True)

        build_stream_response(jellyfin_client=self.jellyfin_client,
                              jellyfin_user_id=user.jellyfin_user_id,
                              jellyfin_token=user.jellyfin_token,
                              handler_input=handler_input,
                              playback=playback,
                              idx=0)

        return handler_input.response_builder.response"""

    if old_album_block in control_code:
        control_code = control_code.replace(old_album_block, new_album_block)
        with open(control_py_path, "w", encoding="utf-8") as f:
            f.write(control_code)
        print("control.py patched successfully")
    else:
        print("WARNING: old_album_block not found in control.py")

# 10. Patch playlist.py (PlayPlaylistIntentHandler)
playlist_py_path = os.path.join(pkg_dir, "alexa", "handler", "playlist.py")
with open(playlist_py_path, "r", encoding="utf-8") as f:
    playlist_code = f.read()

if "convert_french_numbers" not in playlist_code:
    old_pl_imp1 = "from jellyfin_alexa_skill.alexa.util import build_stream_response, get_similarity"
    new_pl_imp1 = "from jellyfin_alexa_skill.alexa.util import build_stream_response, get_similarity, convert_french_numbers"
    old_pl_imp2 = "from jellyfin_alexa_skill.jellyfin.api.client import JellyfinClient"
    new_pl_imp2 = "from jellyfin_alexa_skill.jellyfin.api.client import JellyfinClient, MediaType"
    playlist_code = playlist_code.replace(old_pl_imp1, new_pl_imp1)
    playlist_code = playlist_code.replace(old_pl_imp2, new_pl_imp2)

    old_pl_block = """        playlist_name = handler_input.request_envelope.request.intent.slots["playlist"].value
        playlists = self.jellyfin_client.get_playlist(user_id=user.jellyfin_user_id,
                                                      token=user.jellyfin_token,
                                                      playlist_name=playlist_name)

        if not playlists:
            text = translation.gettext("Sorry, I couldn't find any playlist with this name. Please try again.")
            handler_input.response_builder.speak(text)"""

    new_pl_block = """        playlist_name = handler_input.request_envelope.request.intent.slots["playlist"].value
        playlists = self.jellyfin_client.get_playlist(user_id=user.jellyfin_user_id,
                                                      token=user.jellyfin_token,
                                                      playlist_name=playlist_name)
        if not playlists:
            converted = convert_french_numbers(playlist_name)
            if converted != playlist_name:
                playlists = self.jellyfin_client.get_playlist(user_id=user.jellyfin_user_id,
                                                              token=user.jellyfin_token,
                                                              playlist_name=converted)
                if playlists:
                    playlist_name = converted

        if not playlists:
            # Fallback to album search if no playlist found
            album_results = self.jellyfin_client.search_media_items(user_id=user.jellyfin_user_id,
                                                                    token=user.jellyfin_token,
                                                                    term=playlist_name,
                                                                    media=MediaType.ALBUM,
                                                                    Filters="IsFolder")
            if not album_results:
                converted = convert_french_numbers(playlist_name)
                if converted != playlist_name:
                    album_results = self.jellyfin_client.search_media_items(user_id=user.jellyfin_user_id,
                                                                            token=user.jellyfin_token,
                                                                            term=converted,
                                                                            media=MediaType.ALBUM,
                                                                            Filters="IsFolder")
            if album_results:
                album = album_results[0]
                items = self.jellyfin_client.get_album_items(user_id=user.jellyfin_user_id,
                                                             token=user.jellyfin_token,
                                                             album_id=album["Id"])
                if items:
                    playback_items = [PlaybackItem(item["Id"], item["Name"], item["Artists"])
                                      for item in items]
                    playback = set_playback_queue(user_id, playback_items, reset=True)
                    build_stream_response(jellyfin_client=self.jellyfin_client,
                                          jellyfin_user_id=user.jellyfin_user_id,
                                          jellyfin_token=user.jellyfin_token,
                                          handler_input=handler_input,
                                          playback=playback,
                                          idx=0)
                    response_text = translation.gettext("Ok, I play the playlist {}.").format(album["Name"])
                    handler_input.response_builder.speak(response_text)
                    return handler_input.response_builder.response

        if not playlists:
            text = translation.gettext("Sorry, I couldn't find any playlist with this name. Please try again.")
            handler_input.response_builder.speak(text)"""

    if old_pl_block in playlist_code:
        playlist_code = playlist_code.replace(old_pl_block, new_pl_block)
        with open(playlist_py_path, "w", encoding="utf-8") as f:
            f.write(playlist_code)
        print("playlist.py patched successfully")
    else:
        print("WARNING: old_pl_block not found in playlist.py")


# 11. Patch util.py and event.py to fix 3-second PlaybackNearlyFinished infinite loop
util_py_path = os.path.join(pkg_dir, "alexa", "util.py")
with open(util_py_path, "r", encoding="utf-8") as f:
    util_code = f.read()

old_util_sig = "def build_stream_response(jellyfin_client: JellyfinClient,\n                          jellyfin_user_id: str,\n                          jellyfin_token: str,\n                          handler_input,\n                          playback: Playback,\n                          idx: int) -> ReturnCode:"
new_util_sig = "def build_stream_response(jellyfin_client: JellyfinClient,\n                          jellyfin_user_id: str,\n                          jellyfin_token: str,\n                          handler_input,\n                          playback: Playback,\n                          idx: int,\n                          enqueue: bool = False,\n                          expected_previous_token: str = None) -> ReturnCode:"

old_util_directive = """        handler_input.response_builder.add_directive(
            PlayDirective(
                play_behavior=PlayBehavior.REPLACE_ALL,
                audio_item=AudioItem(
                    stream=Stream(
                        token=item["id"],
                        url=stream_url,
                        offset_in_milliseconds=0),
                    metadata=AudioItemMetadata(
                        title=item["title"],
                        subtitle=" ,".join(item["artists"]),
                        art=art_image
                    )
                )
            )
        )"""

new_util_directive = """        play_behavior = PlayBehavior.ENQUEUE if enqueue else PlayBehavior.REPLACE_ALL
        stream_kwargs = {
            "token": item["id"],
            "url": stream_url,
            "offset_in_milliseconds": 0
        }
        if enqueue and expected_previous_token:
            stream_kwargs["expected_previous_token"] = expected_previous_token

        handler_input.response_builder.add_directive(
            PlayDirective(
                play_behavior=play_behavior,
                audio_item=AudioItem(
                    stream=Stream(**stream_kwargs),
                    metadata=AudioItemMetadata(
                        title=item["title"],
                        subtitle=" ,".join(item["artists"]),
                        art=art_image
                    )
                )
            )
        )"""

if old_util_sig in util_code and old_util_directive in util_code:
    util_code = util_code.replace(old_util_sig, new_util_sig).replace(old_util_directive, new_util_directive)
    with open(util_py_path, "w", encoding="utf-8") as f:
        f.write(util_code)
    print("util.py PlaybackNearlyFinished patch applied successfully")

event_py_path = os.path.join(pkg_dir, "alexa", "handler", "event.py")
with open(event_py_path, "r", encoding="utf-8") as f:
    event_code = f.read()

old_event_handler = """class PlaybackNearlyFinishedEventHandler(BaseHandler):
    def __init__(self, jellyfin_client: JellyfinClient):
        self.jellyfin_client = jellyfin_client

    def can_handle(self, handler_input: HandlerInput) -> bool:
        return is_request_type("AudioPlayer.PlaybackNearlyFinished")(handler_input)

    def handle_func(self, user: User, handler_input: HandlerInput, *args, **kwargs) -> Response:
        user_id = handler_input.request_envelope.context.system.user.user_id

        playback = get_playback(user_id)
        if playback.playing and (playback.current_idx + 1 < len(playback.queue)
                                 or playback.loop_all or playback.loop_single):
            if playback.loop_single:
                idx = playback.current_idx
            elif playback.shuffle:
                if not playback.shuffle_idxs:
                    # create a new shuffle idxs
                    set_shuffle_queue_idxs(playback)
                    playback.save()

                idx = playback.shuffle_idxs[playback.current_idx]
            else:
                idx = (playback.current_idx + 1) % len(playback.queue)

            build_stream_response(jellyfin_client=self.jellyfin_client,
                                  jellyfin_user_id=user.jellyfin_user_id,
                                  jellyfin_token=user.jellyfin_token,
                                  handler_input=handler_input,
                                  playback=playback,
                                  idx=idx)

        return handler_input.response_builder.response"""

new_event_handler = """class PlaybackNearlyFinishedEventHandler(BaseHandler):
    def __init__(self, jellyfin_client: JellyfinClient):
        self.jellyfin_client = jellyfin_client

    def can_handle(self, handler_input: HandlerInput) -> bool:
        return is_request_type("AudioPlayer.PlaybackNearlyFinished")(handler_input)

    def handle_func(self, user: User, handler_input: HandlerInput, *args, **kwargs) -> Response:
        user_id = handler_input.request_envelope.context.system.user.user_id

        playback = get_playback(user_id)
        if playback.playing and (playback.current_idx + 1 < len(playback.queue)
                                 or playback.loop_all or playback.loop_single):
            if playback.loop_single:
                idx = playback.current_idx
            elif playback.shuffle:
                if not playback.shuffle_idxs:
                    # create a new shuffle idxs
                    set_shuffle_queue_idxs(playback)
                    playback.save()

                idx = (playback.current_idx + 1) % len(playback.queue)
            else:
                idx = (playback.current_idx + 1) % len(playback.queue)

            prev_token = getattr(handler_input.request_envelope.request, "token", None)
            if not prev_token and playback.queue and 0 <= playback.current_idx < len(playback.queue):
                prev_token = playback.queue[playback.current_idx]["id"]

            build_stream_response(jellyfin_client=self.jellyfin_client,
                                  jellyfin_user_id=user.jellyfin_user_id,
                                  jellyfin_token=user.jellyfin_token,
                                  handler_input=handler_input,
                                  playback=playback,
                                  idx=idx,
                                  enqueue=True,
                                  expected_previous_token=prev_token)

        return handler_input.response_builder.response"""

if old_event_handler in event_code:
    event_code = event_code.replace(old_event_handler, new_event_handler)
    with open(event_py_path, "w", encoding="utf-8") as f:
        f.write(event_code)
    print("event.py PlaybackNearlyFinished patch applied successfully")



ha_notify_code = """import os, urllib.request, json, threading

HA_URL = os.environ.get("HOMEASSISTANT_URL", "http://homeassistant:8123")
HA_TOKEN = os.environ.get("HOMEASSISTANT_TOKEN", "")

def notify_ha_playback(state, item=None):
    if not HA_TOKEN:
        return
    def _do():
        try:
            attrs = {}
            if item:
                attrs["title"] = item.get("title", "")
                artists = item.get("artists", [])
                attrs["artist"] = ", ".join(artists) if isinstance(artists, list) else str(artists)
                attrs["track_id"] = item.get("id", "")
            req = urllib.request.Request(
                f"{HA_URL}/api/states/sensor.nas_music_now_playing",
                data=json.dumps({"state": state, "attributes": attrs}).encode(),
                headers={"Authorization": f"Bearer {HA_TOKEN}", "Content-Type": "application/json"}
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass
    threading.Thread(target=_do, daemon=True).start()
"""
# 11b. Patch util.py with notify_ha_playback
with open(util_py_path, "r", encoding="utf-8") as f:
    u_code = f.read()

if "def notify_ha_playback" not in u_code:
    u_code = ha_notify_code + "\n" + u_code
    old_b_str = "play_behavior = PlayBehavior.ENQUEUE if enqueue else PlayBehavior.REPLACE_ALL"
    new_b_str = "play_behavior = PlayBehavior.ENQUEUE if enqueue else PlayBehavior.REPLACE_ALL\n        if not enqueue:\n            notify_ha_playback(\"playing\", item)"
    if old_b_str in u_code:
        u_code = u_code.replace(old_b_str, new_b_str, 1)
    with open(util_py_path, "w", encoding="utf-8") as f:
        f.write(u_code)
    print("util.py notify_ha_playback patch applied")

# 12. Patch event.py for Home Assistant live playback sensor sync
if "notify_ha_playback" not in event_code:
    ha_notify_code = """import os, urllib.request, json, threading

HA_URL = os.environ.get("HOMEASSISTANT_URL", "http://homeassistant:8123")
HA_TOKEN = os.environ.get("HOMEASSISTANT_TOKEN", "")

def notify_ha_playback(state, item=None):
    if not HA_TOKEN:
        return
    def _do():
        try:
            attrs = {}
            if item:
                attrs["title"] = item.get("title", "")
                artists = item.get("artists", [])
                attrs["artist"] = ", ".join(artists) if isinstance(artists, list) else str(artists)
                attrs["track_id"] = item.get("id", "")
            req = urllib.request.Request(
                f"{HA_URL}/api/states/sensor.nas_music_now_playing",
                data=json.dumps({"state": state, "attributes": attrs}).encode(),
                headers={"Authorization": f"Bearer {HA_TOKEN}", "Content-Type": "application/json"}
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass
    threading.Thread(target=_do, daemon=True).start()
"""
    event_code = ha_notify_code + event_code
    old_start = """        playback = get_playback(user_id)
        playback.playing = True
        playback.offset = 0
        playback.save()

        return handler_input.response_builder.response"""

    new_start = """        playback = get_playback(user_id)
        playback.playing = True
        playback.offset = 0
        playback.save()

        if playback.queue and 0 <= playback.current_idx < len(playback.queue):
            notify_ha_playback("playing", playback.queue[playback.current_idx])

        return handler_input.response_builder.response"""

    old_stop = """        playback = get_playback(user_id)
        playback.playing = False
        playback.save()

        return handler_input.response_builder.response"""

    new_stop = """        playback = get_playback(user_id)
        playback.playing = False
        playback.save()

        notify_ha_playback("idle")

        return handler_input.response_builder.response"""

    event_code = event_code.replace(old_start, new_start, 1).replace(old_stop, new_stop, 1)
    with open(event_py_path, "w", encoding="utf-8") as f:
        f.write(event_code)
    print("event.py HA notification patch applied successfully")

print("All patches applied!")
