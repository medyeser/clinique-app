Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Chemins
backendPath = "C:\Users\21655\Desktop\python\clinique-backend"
frontendPath = "C:\Users\21655\Desktop\python\frontend"

' Lancer le backend sans fenêtre visible (0 = caché, False = ne pas attendre)
WshShell.Run "cmd /c """ & backendPath & "\start.bat""", 0, False

' Attendre 5 secondes pour que le backend démarre complètement
WScript.Sleep 5000

' Lancer le frontend Electron sans fenêtre de terminal
WshShell.CurrentDirectory = frontendPath
WshShell.Run "cmd /c npm run electron:dev", 0, False

Set FSO = Nothing
Set WshShell = Nothing
