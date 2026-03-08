@echo off
cd /d "%~dp0"
git add .
git commit -m "Atualização" 2>nul || echo Nada novo para commitar.
git push origin main
pause
