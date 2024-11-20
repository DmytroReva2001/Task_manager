@echo off

rem Iniciar servidor Django en segundo plano en la misma consola
echo Iniciando servidor Django...
start /b "" python manage.py runserver

rem Iniciar servidor React en segundo plano en la misma consola
echo Iniciando servidor React...
cd frontend
start /b "" npm start
cd ..