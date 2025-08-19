@echo off
echo 🚀 Iniciando migração Neon → Supabase...
echo.

echo 📦 Fazendo backup do Neon...
pg_dump "postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" --verbose --clean --no-owner --no-privileges --format=custom --file=neon_backup.dump

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backup do Neon concluído com sucesso!
    echo.
    echo 📤 Restaurando no Supabase...
    pg_restore "postgresql://postgres:Hu3AhxdGya01q8dX@db.viffcgeoqtkovryrbalu.supabase.co:5432/postgres" --verbose --clean --no-owner --no-privileges neon_backup.dump
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo 🎉 Migração concluída com sucesso!
        echo 📁 Backup salvo em: neon_backup.dump
    ) else (
        echo.
        echo ❌ Erro ao restaurar no Supabase
    )
) else (
    echo.
    echo ❌ Erro ao fazer backup do Neon
)

echo.
echo ⏰ Fim da migração: %date% %time%
pause
