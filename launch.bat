@echo off

rem Crear un entorno virtual si no existe
if not exist "venv\" (
    echo Creando entorno virtual...
    python -m venv venv
)

rem Activar el entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate

rem Actualizar requirements.txt
echo Actualizando dependencias...
pip install -r requirements.txt --upgrade

rem Iniciar servidor Django en segundo plano
echo Iniciando servidor Django...
start /b "" python manage.py runserver

rem Iniciar servidor React en segundo plano
echo Iniciando servidor React...
cd frontend
start /b "" npm start
cd ..

echo Todos los servidores están en funcionamiento.