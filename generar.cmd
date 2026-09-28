@echo off
rem Doble clic para regenerar las páginas después de cambiar js/productos.js o plantillas/.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generar.ps1"
pause
