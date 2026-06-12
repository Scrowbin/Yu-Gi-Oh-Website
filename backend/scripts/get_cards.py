import json
import re
import time
from pathlib import Path

import requests

INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*]')

MASTERDUEL_URL = (
    "https://www.masterduelmeta.com/api/v1/cards"
    "?cardSort=popRank&aggregate=search&page=1&"
)
YGOPRODECK_API = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
REQUESTS_PER_SECOND = 10  # half of YGOProDeck's 20 req/s limit
MIN_INTERVAL = 1.0 / REQUESTS_PER_SECOND

SCRIPT_DIR = Path(__file__).resolve().parent
CARDS_DIR = SCRIPT_DIR.parent / "cards"
IMAGES_DIR = SCRIPT_DIR.parent / "card_images"
CACHE_DIR = SCRIPT_DIR / "cache"
IMAGE_TYPES = {
    "full": "image_url",
    "small": "image_url_small",
    "cropped": "image_url_cropped",
}


class RateLimiter:
    def __init__(self, interval: float = MIN_INTERVAL):
        self._interval = interval
        self._last = 0.0

    def wait(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last
        if elapsed < self._interval:
            time.sleep(self._interval - elapsed)
        self._last = time.monotonic()


def sanitize_filename(name: str) -> str:
    """Match existing on-disk naming: quotes and other invalid path chars become _."""
    return INVALID_FILENAME_CHARS.sub("_", name)


def request_cards_most_frequent(url: str, limit: int) -> list[dict]:
    response = requests.get(url, params={"limit": limit}, timeout=30)
    response.raise_for_status()
    return response.json()


def masterduel_cache_path(limit: int) -> Path:
    return CACHE_DIR / f"masterduel_top_{limit}.json"


def load_or_fetch_mdm_cards(
    url: str,
    limit: int,
    force_refresh: bool = False,
) -> list[dict]:
    cache_path = masterduel_cache_path(limit)
    if not force_refresh and cache_path.exists():
        return json.loads(cache_path.read_text(encoding="utf-8"))

    cards = request_cards_most_frequent(url, limit)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps(cards, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return cards


def get_konami_id(card: dict) -> int | None:
    raw_id = card.get("konamiID") or card.get("konami_id")
    if raw_id is None:
        return None
    return int(raw_id)


def load_local_cards_by_id() -> dict[int, dict]:
    cards: dict[int, dict] = {}
    if not CARDS_DIR.exists():
        return cards

    for path in CARDS_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            cards[int(data["id"])] = data
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            continue
    return cards


def human_readable_card_type(card: dict) -> str:
    card_type = card.get("type", "")
    if card_type == "Spell Card":
        return f"{card.get('race', 'Normal')} Spell"
    if card_type == "Trap Card":
        return f"{card.get('race', 'Normal')} Trap"
    return card_type


def transform_card(card: dict) -> dict:
    result = dict(card)
    result["humanReadableCardType"] = human_readable_card_type(card)
    return result


def fetch_card_by_konami_id(konami_id: int, limiter: RateLimiter) -> dict | None:
    limiter.wait()
    response = requests.get(YGOPRODECK_API, params={"id": konami_id}, timeout=30)
    response.raise_for_status()
    payload = response.json()
    if "error" in payload:
        return None
    cards = payload.get("data", [])
    return cards[0] if cards else None


def save_card_json(card: dict) -> Path:
    CARDS_DIR.mkdir(parents=True, exist_ok=True)
    path = CARDS_DIR / f"{sanitize_filename(card['name'])}.json"
    path.write_text(
        json.dumps(transform_card(card), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return path


def image_dest(card_name: str, image_id: int, image_type: str) -> Path:
    safe_name = sanitize_filename(card_name)
    if image_type == "full":
        return IMAGES_DIR / image_type / f"{safe_name}_{image_id}.jpg"
    return IMAGES_DIR / image_type / f"{safe_name}_{image_id}_{image_type}.jpg"


def missing_image_urls(card: dict) -> list[tuple[str, Path]]:
    pending: list[tuple[str, Path]] = []
    card_name = card["name"]

    for entry in card.get("card_images", []):
        image_id = entry["id"]
        for image_type, url_key in IMAGE_TYPES.items():
            url = entry.get(url_key)
            if not url:
                continue
            dest = image_dest(card_name, image_id, image_type)
            if not dest.exists():
                pending.append((url, dest))
    return pending


def download_images(card: dict, limiter: RateLimiter) -> int:
    downloaded = 0
    for url, dest in missing_image_urls(card):
        limiter.wait()
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(response.content)
        downloaded += 1
    return downloaded


def download_missing_cards(
    url: str = MASTERDUEL_URL,
    limit: int = 1000,
    force_refresh_mdm: bool = False,
) -> None:
    limiter = RateLimiter()
    mdm_cards = load_or_fetch_mdm_cards(url, limit, force_refresh=force_refresh_mdm)
    local_cards = load_local_cards_by_id()

    konami_ids: list[int] = []
    for card in mdm_cards:
        konami_id = get_konami_id(card)
        if konami_id is not None:
            konami_ids.append(konami_id)

    missing_json = [kid for kid in konami_ids if kid not in local_cards]
    print(f"Top {limit} cards from Master Duel Meta: {len(konami_ids)} konami IDs")
    print(f"Missing JSON locally: {len(missing_json)}")

    failed: list[int] = []
    saved_json = 0
    saved_images = 0

    for konami_id in konami_ids:
        card = local_cards.get(konami_id)

        if card is None:
            card = fetch_card_by_konami_id(konami_id, limiter)
            if card is None:
                failed.append(konami_id)
                print(f"  failed to fetch: {konami_id}")
                continue
            save_card_json(card)
            local_cards[konami_id] = card
            saved_json += 1
            print(f"  saved JSON: {card['name']} ({konami_id})")

        images_added = download_images(card, limiter)
        if images_added:
            saved_images += images_added
            print(f"  saved {images_added} image(s): {card['name']}")

    print(f"Done. JSON saved: {saved_json}, images saved: {saved_images}")
    if failed:
        print(f"Failed konami IDs: {failed}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Download missing YGOProDeck cards/images.")
    parser.add_argument("--limit", type=int, default=1000)
    parser.add_argument(
        "--refresh-mdm",
        action="store_true",
        help="Re-fetch the Master Duel Meta top-cards list instead of using cache.",
    )
    args = parser.parse_args()
    download_missing_cards(
        url=MASTERDUEL_URL,
        limit=args.limit,
        force_refresh_mdm=args.refresh_mdm,
    )
