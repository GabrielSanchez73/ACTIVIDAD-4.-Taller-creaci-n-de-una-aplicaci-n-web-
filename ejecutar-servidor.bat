@echo off
title REST Countries API - Servidor Local
color 0A

echo.
echo ========================================
echo    🌍 REST COUNTRIES API
echo ========================================
echo.
echo 🚀 Iniciando servidor local...
echo.
echo 📱 La aplicacion se abrira automaticamente
echo    en tu navegador en unos segundos.
echo.
echo ⚠️  Para detener el servidor presiona Ctrl+C
echo.
echo ========================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no esta instalado
    echo.
    echo 📥 Instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Cambiar al directorio de la aplicacion
cd /d "%~dp0"

REM Iniciar servidor
echo 🌐 Iniciando servidor en puerto 3000...
echo 📍 URL: http://localhost:3000
echo.
echo ✅ Servidor iniciado correctamente!
echo.

npx serve . -p 3000

pause
