# Script PowerShell pour lancer l'application Clinique
# Backend caché, Frontend visible (mais terminal caché)

$backendPath = "C:\Users\21655\Desktop\python\clinique-backend"
$frontendPath = "C:\Users\21655\Desktop\python\frontend"

# Message de démarrage (optionnel mais rassurant)
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show("Le logiciel Clinique est en cours de démarrage...`nL'ouverture peut prendre 5-10 secondes.", "Démarrage Clinique")

# 1. Lancer le backend (caché)
$backendScript = @"
cd /d "$backendPath"
call venv\Scripts\activate.bat
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

# Créer un fichier temporaire pour le script backend
$tempBackendBat = "$env:TEMP\start_backend_clinique.bat"
Set-Content -Path $tempBackendBat -Value $backendScript

# Lancer le backend en mode caché
Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$tempBackendBat`"" -WindowStyle Hidden

# 2. Attendre que le backend démarre (5 secondes)
Start-Sleep -Seconds 5

# 3. Lancer le frontend Electron
# On utilise cmd /c pour lancer npm sans laisser de fenêtre CMD traîner
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$frontendPath`" && npm run electron:dev" -WindowStyle Hidden
