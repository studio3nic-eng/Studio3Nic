@echo off
rem Doble clic para ver el sitio en http://localhost:3000 (cierra esta ventana para detenerlo).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview.ps1" %*
pause
