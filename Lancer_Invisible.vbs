Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Chemin absolu vers le script PowerShell
scriptPath = "C:\Users\21655\Desktop\python\Lancer_Clinique_Silent.ps1"

' Commande pour lancer PowerShell en mode caché
' -ExecutionPolicy Bypass : pour autoriser l'exécution
' -WindowStyle Hidden : pour cacher la fenêtre PowerShell
command = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """"

' Lancer la commande (0 = caché, False = ne pas attendre la fin)
WshShell.Run command, 0, False

Set WshShell = Nothing
Set FSO = Nothing
