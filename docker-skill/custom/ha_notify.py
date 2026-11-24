
import json
import logging
from pathlib import Path
import urllib.request

logger = logging.getLogger(__name__)

def notify_ha(item=None, state="playing", playback=None):
    try:
        token_path = Path("/skill/data/ha.key")
        if not token_path.exists():
            return
        token = token_path.read_text().strip()
        if not token:
            return

        if not item and playback and playback.queue:
            idx = playback.current_idx
            if playback.shuffle and playback.shuffle_idxs and idx < len(playback.shuffle_idxs):
                idx = playback.shuffle_idxs[idx]
            if 0 <= idx < len(playback.queue):
                item = playback.queue[idx]

        attrs = {}
        if item:
            attrs["title"] = item.get("title") or ""
            artists = item.get("artists") or []
            attrs["artist"] = ", ".join(artists) if isinstance(artists, list) else str(artists)
            attrs["track_id"] = str(item.get("id"))
            if playback:
                attrs["queue_index"] = playback.current_idx
                attrs["queue_length"] = len(playback.queue)

        payload = json.dumps({
            "state": state,
            "attributes": attrs
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://172.17.0.1:8124/api/states/sensor.nas_music_now_playing",
            data=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            pass
    except Exception as e:
        logger.debug("notify_ha error: %s", e)
