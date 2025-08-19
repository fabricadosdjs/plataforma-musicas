// Utilitários para lidar com datas no timezone do Brasil

/**
 * Obtém a data atual no timezone do Brasil (America/Sao_Paulo)
 */
export function getCurrentDateBrazil(): Date {
    // Usar uma abordagem mais direta para evitar problemas de timezone
    const now = new Date();
    const brazilOffset = -3 * 60; // UTC-3 para Brasil
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (brazilOffset * 60000));
}

/**
 * Converte uma data para o timezone do Brasil
 */
export function convertToBrazilTimezone(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Se a data é uma string sem hora (ex: "2025-08-18"), assumir que é no timezone local do Brasil
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Criar a data no timezone local do Brasil (meio-dia para evitar problemas de timezone)
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

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
 * Formata uma data para exibição no formato solicitado: "Domingo, 17 de Agosto de 2025"
 */
export function formatDateExtendedBrazil(date: Date | string): string {
    const brazilDate = convertToBrazilTimezone(date);

    const diaSemana = brazilDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dia = brazilDate.getDate();
    const mes = brazilDate.toLocaleDateString('pt-BR', { month: 'long' });
    const ano = brazilDate.getFullYear();

    // Capitalizar primeira letra do dia da semana
    const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    return `${diaSemanaCapitalizado}, ${dia} de ${mes} de ${ano}`;
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
