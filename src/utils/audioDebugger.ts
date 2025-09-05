// Utilitário para debug detalhado de problemas de áudio
export class AudioDebugger {
    private static logs: Array<{
        timestamp: string;
        level: 'info' | 'warn' | 'error';
        message: string;
        data?: any;
    }> = [];

    static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : undefined
        };

        this.logs.push(logEntry);

        // Manter apenas os últimos 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }

        // Console output baseado no nível
        const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🎵';
        const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

        if (data) {
            consoleMethod(`${emoji} AudioDebug: ${message}`, data);
        } else {
            consoleMethod(`${emoji} AudioDebug: ${message}`);
        }
    }

    static getLogs() {
        return [...this.logs];
    }

    static clearLogs() {
        this.logs = [];
    }

    static exportLogs() {
        const logText = this.logs
            .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? ' | Data: ' + JSON.stringify(log.data) : ''}`)
            .join('\n');

        return logText;
    }

    // Analisar padrões nos logs para identificar problemas comuns
    static analyzeIssues() {
        const issues: string[] = [];
        const recentLogs = this.logs.slice(-20); // Últimos 20 logs

        // Verificar se há muitos erros de carregamento
        const loadErrors = recentLogs.filter(log =>
            log.level === 'error' && log.message.includes('carregamento')
        );
        if (loadErrors.length > 3) {
            issues.push('Múltiplos erros de carregamento detectados - possível problema de conectividade');
        }

        // Verificar se há problemas específicos da Contabo
        const contaboErrors = recentLogs.filter(log =>
            log.level === 'error' && log.message.includes('contabostorage')
        );
        if (contaboErrors.length > 2) {
            issues.push('Problemas recorrentes com Contabo Storage - considerar usar URLs diretas');
        }

        // Verificar se há problemas de CORS
        const corsErrors = recentLogs.filter(log =>
            log.level === 'error' && (log.message.includes('CORS') || log.message.includes('cross-origin'))
        );
        if (corsErrors.length > 1) {
            issues.push('Problemas de CORS detectados - verificar configurações do servidor');
        }

        return issues;
    }
}

// Função auxiliar para debug de URLs de áudio
export const debugAudioUrl = (url: string, context: string = 'Unknown') => {
    AudioDebugger.log('info', `Analisando URL de áudio - ${context}`, {
        url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
        isContabo: url.includes('contabostorage.com'),
        isSigned: url.includes('X-Amz-Signature'),
        hasParams: url.includes('?'),
        protocol: url.startsWith('https') ? 'HTTPS' : url.startsWith('http') ? 'HTTP' : 'OTHER'
    });
};

// Função para testar conectividade com uma URL
export const testAudioConnectivity = async (url: string): Promise<{
    success: boolean;
    status?: number;
    error?: string;
    responseTime?: number;
}> => {
    const startTime = Date.now();

    try {
        AudioDebugger.log('info', 'Testando conectividade de áudio', { url: url.substring(0, 100) + '...' });

        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'Accept': 'audio/*',
                'Cache-Control': 'no-cache'
            }
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            AudioDebugger.log('info', 'Teste de conectividade bem-sucedido', {
                status: response.status,
                responseTime: `${responseTime}ms`,
                contentType: response.headers.get('content-type')
            });

            return {
                success: true,
                status: response.status,
                responseTime
            };
        } else {
            AudioDebugger.log('warn', 'Teste de conectividade retornou erro', {
                status: response.status,
                statusText: response.statusText,
                responseTime: `${responseTime}ms`
            });

            return {
                success: false,
                status: response.status,
                error: response.statusText,
                responseTime
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        AudioDebugger.log('error', 'Falha no teste de conectividade', {
            error: errorMessage,
            responseTime: `${responseTime}ms`
        });

        return {
            success: false,
            error: errorMessage,
            responseTime
        };
    }
};

export default AudioDebugger;
