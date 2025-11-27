export const formatPhoneNumber = (
    phone: string | null | undefined,
    options?: { international?: boolean }
): string => {
    if (!phone) return "";

    let clean = phone.replace(/\D/g, "");

    // Normaliza presença de DDI 55
    const hasDDI = clean.startsWith("55");
    if (options?.international) {
        if (!hasDDI) clean = "55" + clean; // garante DDI ao exibir internacional
    } else {
        if (hasDDI && clean.length >= 12) clean = clean.slice(2); // remove DDI ao exibir nacional
    }

    // Agora, para decidir o padrão de formatação, se internacional mantemos +55, senão nacional
    const formatWith = (ddiPrefix: string) => {
        if (clean.startsWith("55")) {
            const local = clean.slice(2);
            if (local.length === 11) {
                return `${ddiPrefix} ${local.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "$1 $2 $3-$4")}`;
            }
            if (local.length === 10) {
                return `${ddiPrefix} ${local.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2-$3")}`;
            }
        } else {
            if (clean.length === 11) {
                return clean.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
            }
            if (clean.length === 10) {
                return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
            }
        }
        return phone;
    };

    return options?.international
        ? formatWith("+55")
        : clean.length === 11
            ? clean.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4")
            : clean.length === 10
                ? clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
                : phone;
};