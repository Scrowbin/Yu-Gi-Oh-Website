import argparse
import json
import re
from pathlib import Path

import requests

API_URL = "https://www.masterduelmeta.com/api/v1/top-decks"
RECENT_DECKS_URL = f"{API_URL}?created[$gte]=(days-14)"

SCRIPT_DIR = Path(__file__).resolve().parent
DECKS_DIR = SCRIPT_DIR.parent / "decks"
CACHE_DIR = SCRIPT_DIR / "cache"
INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*]')


def sanitize_filename(name: str) -> str:
    return INVALID_FILENAME_CHARS.sub("_", name)


def get_card_names(cards: list[dict]) -> list[dict]:
    return [
        {
            "name": card["card"]["name"],
            "amount": card["amount"],
        }
        for card in cards
    ]


def parse_deck(deck: dict) -> dict:
    return {
        "mdmId": deck.get("_id"),
        "sourceUrl": deck.get("url"),
        "deckType": deck.get("deckType", {}).get("name"),
        "created": deck.get("created"),
        "rankedType": deck.get("rankedType", {}).get("shortName"),
        "engines": [engine["name"] for engine in deck.get("engines", [])],
        "main": get_card_names(deck.get("main", [])),
        "extra": get_card_names(deck.get("extra", [])),
        "side": get_card_names(deck.get("side", [])),
    }


def get_specific_deck(url: str) -> dict | None:
    response = requests.get(API_URL, params={"url": url, "limit": 1}, timeout=30)
    response.raise_for_status()
    decks = response.json()
    if not decks:
        return None
    deck = decks[0] if isinstance(decks, list) else decks
    return parse_deck(deck)


def request_recent_decks(limit: int) -> list[dict]:
    response = requests.get(RECENT_DECKS_URL, params={"limit": limit}, timeout=30)
    response.raise_for_status()
    decks = response.json()
    if isinstance(decks, dict):
        return [decks]
    return decks


def masterduel_cache_path(limit: int) -> Path:
    return CACHE_DIR / f"masterduel_recent_decks_{limit}.json"


def load_or_fetch_recent_decks(limit: int, force_refresh: bool = False) -> list[dict]:
    cache_path = masterduel_cache_path(limit)
    if not force_refresh and cache_path.exists():
        return json.loads(cache_path.read_text(encoding="utf-8"))

    decks = request_recent_decks(limit)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps(decks, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return decks


def deck_json_path(deck: dict) -> Path:
    mdm_id = deck.get("mdmId")
    if mdm_id:
        return DECKS_DIR / f"{sanitize_filename(str(mdm_id))}.json"

    source_url = deck.get("sourceUrl") or "unknown"
    safe = sanitize_filename(source_url.strip("/").replace("/", "_"))
    return DECKS_DIR / f"{safe}.json"


def save_deck_json(deck: dict) -> Path:
    DECKS_DIR.mkdir(parents=True, exist_ok=True)
    path = deck_json_path(deck)
    path.write_text(
        json.dumps(deck, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return path


def download_recent_decks(limit: int = 10, force_refresh: bool = False) -> None:
    raw_decks = load_or_fetch_recent_decks(limit, force_refresh=force_refresh)
    saved = 0

    for raw in raw_decks:
        deck = parse_deck(raw)
        save_deck_json(deck)
        saved += 1
        label = deck.get("deckType") or deck.get("sourceUrl") or deck.get("mdmId")
        print(f"  saved: {label} ({deck.get('mdmId')})")

    print(f"Done. Saved {saved} deck(s) to {DECKS_DIR}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download recent Master Duel Meta decks.")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument(
        "--refresh-mdm",
        action="store_true",
        help="Re-fetch the deck list from Master Duel Meta instead of using cache.",
    )
    args = parser.parse_args()
    download_recent_decks(limit=args.limit, force_refresh=args.refresh_mdm)
