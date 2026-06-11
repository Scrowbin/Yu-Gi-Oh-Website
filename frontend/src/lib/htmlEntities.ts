export function decodeHtmlEntities(value: string): string {
    return value
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'");
}

export function cardNamesMatch(a: string, b: string): boolean {
    return (
        decodeHtmlEntities(a).toLowerCase() ===
        decodeHtmlEntities(b).toLowerCase()
    );
}
