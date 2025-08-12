// Utilitários para lidar com datas no timezone do Brasil

/**
 * Obtém a data atual no timezone do Brasil (America/Sao_Paulo)
 */
export function getCurrentDateBrazil(): Date {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
}

/**
 * Converte uma data para o timezone do Brasil
 */
export function convertToBrazilTimezone(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return brazilDate;
}

/**
 * Obtém apenas a data (sem hora) no timezone do Brasil
 */
export function getDateOnlyBrazil(date: Date | string): Date {
    const brazilDate = convertToBrazilTimezone(date);
    return new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate());
}

/**
 * Compara duas datas apenas pela data (sem hora) no timezone do Brasil
 */
export function compareDatesOnly(date1: Date | string, date2: Date | string): boolean {
    const date1Only = getDateOnlyBrazil(date1);
    const date2Only = getDateOnlyBrazil(date2);
    return date1Only.getTime() === date2Only.getTime();
}

/**
 * Verifica se uma data é hoje no timezone do Brasil
 */
export function isTodayBrazil(date: Date | string): boolean {
    const today = getCurrentDateBrazil();
    return compareDatesOnly(date, today);
}

/**
 * Verifica se uma data é ontem no timezone do Brasil
 */
export function isYesterdayBrazil(date: Date | string): boolean {
    const today = getCurrentDateBrazil();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return compareDatesOnly(date, yesterday);
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatDateBrazil(date: Date | string): string {
    const brazilDate = convertToBrazilTimezone(date);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return brazilDate.toLocaleDateString('pt-BR', options);
}

/**
 * Obtém a chave de data para agrupamento (hoje, ontem, futuro, etc.)
 */
export function getDateKeyBrazil(date: Date | string): string {
    const brazilDate = convertToBrazilTimezone(date);
    const today = getCurrentDateBrazil();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = getDateOnlyBrazil(brazilDate);
    const todayOnly = getDateOnlyBrazil(today);
    const yesterdayOnly = getDateOnlyBrazil(yesterday);

    if (compareDatesOnly(dateOnly, todayOnly)) {
        return 'today';
    } else if (compareDatesOnly(dateOnly, yesterdayOnly)) {
        return 'yesterday';
    } else if (dateOnly > todayOnly) {
        return 'future';
    } else {
        return dateOnly.toISOString().split('T')[0];
    }
}
