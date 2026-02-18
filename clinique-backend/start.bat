@echo off
echo ========================================
echo Demarrage de l'API Clinique Medicale
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if slowapi is installed (indicator that all deps are installed)
python -c "import slowapi" 2>nul
if errorlevel 1 (
    echo Installation des dependances manquantes...
    pip install -r requirements.txt --quiet
    echo Dependances installees avec succes!
    echo.
)

echo API demarree sur http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

REM Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
