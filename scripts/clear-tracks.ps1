# Script PowerShell para remover TODAS as músicas do banco de dados
# ⚠️ ATENÇÃO: Este script é DESTRUTIVO e irá remover TODAS as músicas!
#
# Uso:
# .\scripts\clear-tracks.ps1
#
# Parâmetros:
# -Confirm:$false  : Executa sem confirmação
# -Backup          : Cria backup antes de remover
# -DryRun          : Mostra o que seria removido sem executar

param(
    [switch]$Confirm = $true,
    [switch]$Backup,
    [switch]$DryRun
)

# Configurações
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Função para mostrar cabeçalho
function Show-Header {
    Write-Host "🚨 SCRIPT DE REMOÇÃO DE MÚSICAS 🚨" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "⚠️  ATENÇÃO: Este script irá remover TODAS as músicas do banco!" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
}

# Função para verificar se o Node.js está instalado
function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
        return $false
    }
    return $false
}

# Função para verificar se o Prisma está disponível
function Test-Prisma {
    try {
        $prismaVersion = npx prisma --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Prisma encontrado: $prismaVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Prisma não encontrado" -ForegroundColor Red
        return $false
    }
    return $false
}

# Função para criar backup
function New-TracksBackup {
    Write-Host "📦 Criando backup das músicas..." -ForegroundColor Cyan
    
    try {
        # Criar diretório de backup se não existir
        $backupDir = Join-Path $PSScriptRoot "..\backups"
        if (!(Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        
        # Nome do arquivo de backup com timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $backupFile = Join-Path $backupDir "tracks-backup-$timestamp.json"
        
        # Executar script de backup via Node.js
        $backupScript = @"
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupTracks() {
    try {
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                pool: true,
                releaseDate: true,
                downloadUrl: true,
                previewUrl: true,
                imageUrl: true,
                bitrate: true,
                releaseId: true,
                folder: true,
                filename: true,
                isCommunity: true,
                uploadedBy: true,
                aiMeta: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        fs.writeFileSync('$backupFile', JSON.stringify(tracks, null, 2));
        console.log('BACKUP_SUCCESS:' + tracks.length);
    } catch (error) {
        console.error('BACKUP_ERROR:' + error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

backupTracks();
"@
        
        # Salvar script temporário
        $tempScript = Join-Path $env:TEMP "backup-tracks.js"
        $backupScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        # Executar script
        $result = node $tempScript 2>&1
        
        # Limpar arquivo temporário
        Remove-Item $tempScript -Force
        
        if ($result -match "BACKUP_SUCCESS:(\d+)") {
            $count = $matches[1]
            Write-Host "✅ Backup criado com sucesso: $backupFile" -ForegroundColor Green
            Write-Host "📊 Total de músicas no backup: $count" -ForegroundColor Green
            return $backupFile
        } elseif ($result -match "BACKUP_ERROR:(.+)") {
            $error = $matches[1]
            throw "Erro ao criar backup: $error"
        } else {
            throw "Erro desconhecido ao criar backup"
        }
        
    } catch {
        Write-Host "❌ Erro ao criar backup: $_" -ForegroundColor Red
        throw $_
    }
}

# Função para contar músicas
function Get-TracksCount {
    try {
        $countScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countTracks() {
    try {
        const count = await prisma.track.count();
        console.log('COUNT:' + count);
    } catch (error) {
        console.error('ERROR:' + error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

countTracks();
"@
        
        $tempScript = Join-Path $env:TEMP "count-tracks.js"
        $countScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        $result = node $tempScript 2>&1
        
        Remove-Item $tempScript -Force
        
        if ($result -match "COUNT:(\d+)") {
            return [int]$matches[1]
        } else {
            throw "Erro ao contar músicas"
        }
        
    } catch {
        Write-Host "❌ Erro ao contar músicas: $_" -ForegroundColor Red
        return 0
    }
}

# Função para remover músicas
function Remove-AllTracks {
    try {
        Write-Host "🗑️  Removendo todas as músicas..." -ForegroundColor Red
        
        $deleteScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllTracks() {
    try {
        const result = await prisma.track.deleteMany({});
        console.log('DELETE_SUCCESS:' + result.count);
    } catch (error) {
        console.error('DELETE_ERROR:' + error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

deleteAllTracks();
"@
        
        $tempScript = Join-Path $env:TEMP "delete-tracks.js"
        $deleteScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        $result = node $tempScript 2>&1
        
        Remove-Item $tempScript -Force
        
        if ($result -match "DELETE_SUCCESS:(\d+)") {
            $count = $matches[1]
            Write-Host "✅ Remoção concluída com sucesso!" -ForegroundColor Green
            Write-Host "📊 Músicas removidas: $count" -ForegroundColor Green
            return $count
        } elseif ($result -match "DELETE_ERROR:(.+)") {
            $error = $matches[1]
            throw "Erro ao remover músicas: $error"
        } else {
            throw "Erro desconhecido ao remover músicas"
        }
        
    } catch {
        Write-Host "❌ Erro durante a remoção: $_" -ForegroundColor Red
        throw $_
    }
}

# Função principal
function Main {
    try {
        Show-Header
        
        # Verificar configurações
        Write-Host "🔧 CONFIGURAÇÕES:" -ForegroundColor Cyan
        Write-Host "  Confirmação: $Confirm" -ForegroundColor White
        Write-Host "  Backup: $Backup" -ForegroundColor White
        Write-Host "  Modo dry-run: $DryRun" -ForegroundColor White
        Write-Host ""
        
        # Verificar dependências
        if (!(Test-NodeJS)) {
            Write-Host "❌ Node.js é necessário para executar este script" -ForegroundColor Red
            exit 1
        }
        
        if (!(Test-Prisma)) {
            Write-Host "❌ Prisma é necessário para executar este script" -ForegroundColor Red
            exit 1
        }
        
        # Contar músicas atuais
        $currentCount = Get-TracksCount
        Write-Host "📊 Total de músicas no banco: $currentCount" -ForegroundColor Yellow
        
        if ($currentCount -eq 0) {
            Write-Host "ℹ️  Nenhuma música encontrada para remover" -ForegroundColor Blue
            return
        }
        
        # Modo dry-run
        if ($DryRun) {
            Write-Host "🔍 MODO DRY-RUN: Nenhuma música será removida" -ForegroundColor Yellow
            return
        }
        
        # Confirmação do usuário
        if ($Confirm) {
            Write-Host "⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!" -ForegroundColor Red
            Write-Host "   Todas as músicas serão perdidas permanentemente." -ForegroundColor Red
            Write-Host ""
            
            $answer = Read-Host "🤔 Tem certeza que deseja continuar? (digite 'SIM' para confirmar)"
            
            if ($answer -ne "SIM") {
                Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Yellow
                return
            }
            
            $finalAnswer = Read-Host "🚨 ÚLTIMA CHANCE: Digite 'REMOVER TUDO' para confirmar"
            
            if ($finalAnswer -ne "REMOVER TUDO") {
                Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Yellow
                return
            }
        }
        
        # Criar backup se solicitado
        $backupFile = $null
        if ($Backup) {
            $backupFile = New-TracksBackup
        }
        
        # Executar remoção
        $removedCount = Remove-AllTracks
        
        # Verificar resultado
        $finalCount = Get-TracksCount
        Write-Host "📊 Músicas restantes: $finalCount" -ForegroundColor Yellow
        
        if ($finalCount -eq 0) {
            Write-Host "🎉 Todas as músicas foram removidas com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Algumas músicas ainda permanecem no banco" -ForegroundColor Yellow
        }
        
        if ($backupFile) {
            Write-Host "💾 Backup salvo em: $backupFile" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ Erro fatal: $_" -ForegroundColor Red
        exit 1
    }
}

# Executar função principal
Main
