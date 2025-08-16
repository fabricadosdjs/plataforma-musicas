# 🎵 Contabo Music Downloader - Script PowerShell
# 
# Este script baixa músicas do Contabo e cria automaticamente
# pastas organizadas por estilo no seu PC.
#
# Como usar:
# 1. Abra PowerShell como administrador
# 2. Execute: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# 3. Execute: .\scripts\contabo-downloader.ps1

param(
    [string]$Style = "",
    [string]$DownloadDir = "$env:USERPROFILE\Downloads\Contabo Music",
    [int]$BatchSize = 10,
    [int]$BatchDelay = 2000
)

# Configurações
$API_BASE_URL = "http://localhost:3000/api/admin"
$ErrorActionPreference = "Stop"

# Função para criar pasta se não existir
function Ensure-Directory {
    param([string]$Path)
    
    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "✅ Pasta criada: $Path" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Pasta já existe: $Path" -ForegroundColor Green
    }
}

# Função para sanitizar nome de arquivo/pasta
function Sanitize-Name {
    param([string]$Name)
    
    return $Name -replace '[<>:"/\\|?*]', '_' -replace '\s+', ' ' -replace '^\s+|\s+$', ''
}

# Função para baixar uma música
function Download-Track {
    param($Track, $StyleFolder)
    
    try {
        Write-Host "📥 Baixando: $($Track.artist) - $($Track.songName)" -ForegroundColor Cyan
        
        # Nome do arquivo
        $fileName = "$($Track.artist) - $($Track.songName).mp3"
        $filePath = Join-Path $StyleFolder $fileName
        
        # Verificar se já existe
        if (Test-Path $filePath) {
            Write-Host "⏭️  Arquivo já existe: $fileName" -ForegroundColor Yellow
            return @{ Success = $true; Skipped = $true; FileName = $fileName }
        }
        
        # Fazer download
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/download-track" -Method POST -Body (@{ trackId = $Track.id } | ConvertTo-Json) -ContentType "application/json"
        
        # Converter resposta para bytes e salvar
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($response)
        [System.IO.File]::WriteAllBytes($filePath, $bytes)
        
        Write-Host "✅ Download concluído: $fileName" -ForegroundColor Green
        return @{ Success = $true; Skipped = $false; FileName = $fileName }
        
    }
    catch {
        Write-Host "❌ Erro ao baixar $($Track.songName): $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Função para baixar músicas de um estilo
function Download-StyleTracks {
    param([string]$Style, $Tracks)
    
    Write-Host "`n🎵 Iniciando download do estilo: $Style" -ForegroundColor Magenta
    Write-Host "📊 Total de músicas: $($Tracks.Count)" -ForegroundColor Cyan
    
    # Criar pasta do estilo
    $styleFolder = Join-Path $DownloadDir "🎵 $(Sanitize-Name $Style)"
    Ensure-Directory $styleFolder
    
    # Dividir em lotes
    $batches = @()
    for ($i = 0; $i -lt $Tracks.Count; $i += $BatchSize) {
        $end = [Math]::Min($i + $BatchSize, $Tracks.Count)
        $batches += , @($Tracks[$i..($end - 1)])
    }
    
    Write-Host "📦 Downloads divididos em $($batches.Count) lotes de $BatchSize" -ForegroundColor Cyan
    
    $successCount = 0
    $skipCount = 0
    $errorCount = 0
    
    # Processar lotes
    for ($i = 0; $i -lt $batches.Count; $i++) {
        $batch = $batches[$i]
        Write-Host "`n📥 Processando lote $($i + 1)/$($batches.Count) ($($batch.Count) músicas)" -ForegroundColor Yellow
        
        # Download simultâneo do lote
        $jobs = @()
        foreach ($track in $batch) {
            $jobs += Start-Job -ScriptBlock {
                param($Track, $StyleFolder, $API_BASE_URL)
                
                try {
                    $fileName = "$($Track.artist) - $($Track.songName).mp3"
                    $filePath = Join-Path $StyleFolder $fileName
                    
                    if (Test-Path $filePath) {
                        return @{ Success = $true; Skipped = $true; FileName = $fileName }
                    }
                    
                    $response = Invoke-RestMethod -Uri "$API_BASE_URL/download-track" -Method POST -Body (@{ trackId = $Track.id } | ConvertTo-Json) -ContentType "application/json"
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($response)
                    [System.IO.File]::WriteAllBytes($filePath, $bytes)
                    
                    return @{ Success = $true; Skipped = $false; FileName = $fileName }
                }
                catch {
                    return @{ Success = $false; Error = $_.Exception.Message }
                }
            } -ArgumentList $track, $styleFolder, $API_BASE_URL
        }
        
        # Aguardar conclusão dos jobs
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        # Contar resultados
        foreach ($result in $results) {
            if ($result.Success -and $result.Skipped) { $skipCount++ }
            elseif ($result.Success) { $successCount++ }
            else { $errorCount++ }
        }
        
        # Aguardar antes do próximo lote
        if ($i -lt $batches.Count - 1) {
            Write-Host "⏳ Aguardando $BatchDelay ms antes do próximo lote..." -ForegroundColor Gray
            Start-Sleep -Milliseconds $BatchDelay
        }
    }
    
    # Resumo
    Write-Host "`n📊 Resumo do estilo `"$Style`":" -ForegroundColor Magenta
    Write-Host "✅ Baixadas: $successCount" -ForegroundColor Green
    Write-Host "⏭️  Puladas: $skipCount" -ForegroundColor Yellow
    Write-Host "❌ Erros: $errorCount" -ForegroundColor Red
    
    return $true
}

# Função principal
function Main {
    try {
        Write-Host "🎵 Contabo Music Downloader - Script PowerShell" -ForegroundColor Magenta
        Write-Host "===============================================" -ForegroundColor Magenta
        
        # Verificar se a pasta de download existe
        Ensure-Directory $DownloadDir
        
        if ([string]::IsNullOrEmpty($Style)) {
            # Perguntar ao usuário qual estilo baixar
            Write-Host "`n📁 Pasta de destino: $DownloadDir" -ForegroundColor Cyan
            Write-Host "`n🎯 Opções disponíveis:" -ForegroundColor Yellow
            Write-Host "1. Baixar um estilo específico"
            Write-Host "2. Baixar todos os estilos"
            Write-Host "3. Listar estilos disponíveis"
            
            $choice = Read-Host "`nEscolha uma opção (1-3)"
            
            if ($choice -eq "1") {
                $Style = Read-Host "Digite o nome do estilo"
                Write-Host "`n🔍 Buscando músicas do estilo: $Style" -ForegroundColor Cyan
                
                # Buscar músicas do estilo
                $response = Invoke-RestMethod -Uri "$API_BASE_URL/tracks-by-style" -Method GET
                
                if ($response.tracksByStyle.$Style) {
                    Download-StyleTracks $Style $response.tracksByStyle.$Style
                }
                else {
                    Write-Host "❌ Estilo `"$Style`" não encontrado." -ForegroundColor Red
                    Write-Host "Estilos disponíveis: $($response.tracksByStyle.Keys -join ', ')" -ForegroundColor Yellow
                }
                
            }
            elseif ($choice -eq "2") {
                Write-Host "`n🔍 Buscando todos os estilos..." -ForegroundColor Cyan
                
                # Buscar todos os estilos
                $response = Invoke-RestMethod -Uri "$API_BASE_URL/tracks-by-style" -Method GET
                
                Write-Host "📊 Total de estilos encontrados: $($response.tracksByStyle.Keys.Count)" -ForegroundColor Cyan
                
                foreach ($styleKey in $response.tracksByStyle.Keys) {
                    Download-StyleTracks $styleKey $response.tracksByStyle.$styleKey
                    Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
                }
                
            }
            elseif ($choice -eq "3") {
                Write-Host "`n🔍 Listando estilos disponíveis..." -ForegroundColor Cyan
                
                $response = Invoke-RestMethod -Uri "$API_BASE_URL/tracks-by-style" -Method GET
                
                Write-Host "`n📋 Estilos disponíveis:" -ForegroundColor Yellow
                foreach ($styleKey in $response.tracksByStyle.Keys) {
                    Write-Host "🎵 $styleKey`: $($response.tracksByStyle.$styleKey.Count) músicas" -ForegroundColor Cyan
                }
                
            }
            else {
                Write-Host "❌ Opção inválida!" -ForegroundColor Red
            }
        }
        else {
            # Estilo especificado via parâmetro
            Write-Host "`n🔍 Buscando músicas do estilo: $Style" -ForegroundColor Cyan
            
            $response = Invoke-RestMethod -Uri "$API_BASE_URL/tracks-by-style" -Method GET
            
            if ($response.tracksByStyle.$Style) {
                Download-StyleTracks $Style $response.tracksByStyle.$Style
            }
            else {
                Write-Host "❌ Estilo `"$Style`" não encontrado." -ForegroundColor Red
                Write-Host "Estilos disponíveis: $($response.tracksByStyle.Keys -join ', ')" -ForegroundColor Yellow
            }
        }
        
    }
    catch {
        Write-Host "❌ Erro geral: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*ECONNREFUSED*") {
            Write-Host "`n💡 Dica: Certifique-se de que o servidor Next.js está rodando em http://localhost:3000" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n👋 Script finalizado!" -ForegroundColor Green
}

# Executar função principal
Main




