/** YGOPRODeck JSON sometimes stores names with HTML entities (e.g. &amp;). */
export function decodeHtmlEntities(value: string): string {
    return value
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'");
}

export function encodeHtmlEntities(value: string): string {
    return value.replaceAll("&", "&amp;");
}

/** Search variants so `&` and `&amp;` both match. */
export function cardNameSearchTerms(name: string): string[] {
    const decoded = decodeHtmlEntities(name);
    const terms = new Set([name, decoded]);
    if (decoded.includes("&")) {
        terms.add(encodeHtmlEntities(decoded));
    }
    return [...terms];
}
