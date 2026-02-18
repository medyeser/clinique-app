Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Obtenir le chemin du dossier frontend
frontendPath = FSO.GetParentFolderName(WScript.ScriptFullName)
backendPath = FSO.GetParentFolderName(frontendPath) & "\clinique-backend"

' Lancer le backend en arrière-plan
WshShell.Run "cmd /c """ & backendPath & "\start.bat""", 0, False

' Attendre 3 secondes pour que le backend démarre
WScript.Sleep 3000

' Lancer le frontend Electron en arrière-plan
WshShell.CurrentDirectory = frontendPath
WshShell.Run "cmd /c npm run electron:dev", 0, False

Set FSO = Nothing
Set WshShell = Nothing
