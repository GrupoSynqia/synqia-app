export const formatName = (rawName: string | null | undefined): string => {
    if (typeof rawName !== "string") return "";

    // Normalize unicode, trim and collapse internal whitespace
    const normalized = rawName
        .normalize("NFKC")
        .replace(/[\s\t\r\n]+/g, " ")
        .trim();

    if (normalized.length === 0) return "";

    // Common particles that usually stay lowercase when not the first word
    const lowercaseParticles = new Set([
        "da",
        "de",
        "do",
        "das",
        "dos",
        "e",
        "di",
        "del",
        "della",
        "dello",
        "van",
        "von",
        "la",
        "le",
        "du",
        "des",
    ]);

    const toTitleCase = (segment: string): string => {
        if (!segment) return segment;
        const [first, ...rest] = segment;
        return first.toLocaleUpperCase("pt-BR") + rest.join("").toLocaleLowerCase("pt-BR");
    };

    const capitalizeWithApostrophe = (token: string, isFirstWord: boolean): string => {
        // Handle cases like d'ávila -> d'Ávila, l'oscar -> l'Oscar
        const parts = token.split("'");
        return parts
            .map((part, idx) => {
                // Keep very short prefixes like d', l' in lowercase unless it's the first word
                if (idx === 0 && !isFirstWord && (part === "d" || part === "l" || part === "o")) {
                    return part.toLocaleLowerCase("pt-BR");
                }
                return toTitleCase(part.toLocaleLowerCase("pt-BR"));
            })
            .join("'");
    };

    const capitalizeToken = (token: string, isFirstWord: boolean): string => {
        // Support hyphenated names: maria-helena -> Maria-Helena
        return token
            .split("-")
            .map((sub) => (sub.includes("'") ? capitalizeWithApostrophe(sub, isFirstWord) : toTitleCase(sub)))
            .join("-");
    };

    const words = normalized.toLocaleLowerCase("pt-BR").split(" ");

    const formatted = words
        .map((word, index) => {
            const isFirst = index === 0;
            if (!isFirst && lowercaseParticles.has(word)) {
                return word; // keep lowercase particles when not the first word
            }
            return capitalizeToken(word, isFirst);
        })
        .join(" ");

    return formatted;
};

export const truncateNameWords = (rawName: string | null | undefined, maxWords: number = 4): string => {
    const formatted = formatName(rawName);
    if (!formatted) return "";
    const words = formatted.split(" ").filter(Boolean);
    if (words.length <= maxWords) return formatted;
    return words.slice(0, maxWords).join(" ") + "...";
};




export default formatName;