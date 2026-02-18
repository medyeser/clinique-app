@echo off
echo ========================================
echo Installation Backend Clinique Medicale
echo ========================================
echo.

echo [1/5] Creation de l'environnement virtuel...
python -m venv venv
if errorlevel 1 (
    echo ERREUR: Impossible de creer l'environnement virtuel
    pause
    exit /b 1
)
echo OK - Environnement virtuel cree
echo.

echo [2/5] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat
echo OK - Environnement active
echo.

echo [3/5] Installation des dependances...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERREUR: Impossible d'installer les dependances
    pause
    exit /b 1
)
echo OK - Dependances installees
echo.

echo [4/5] Copie du fichier de configuration...
if not exist .env (
    copy .env.example .env
    echo OK - Fichier .env cree
) else (
    echo INFO - Fichier .env existe deja
)
echo.

echo [5/5] Initialisation de la base de donnees...
echo IMPORTANT: Assurez-vous qu'EasyPHP est demarre et que MySQL est actif!
echo.
pause
python init_db.py
echo.

echo ========================================
echo Installation terminee!
echo ========================================
echo.
echo Pour demarrer l'API:
echo   1. Activez l'environnement: venv\Scripts\activate
echo   2. Lancez l'API: uvicorn main:app --reload
echo   3. Ouvrez: http://localhost:8000/docs
echo.
echo Credentials par defaut:
echo   Username: admin
echo   Password: admin123
echo.
pause
