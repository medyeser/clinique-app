Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Créer le raccourci sur le bureau
desktopPath = WshShell.SpecialFolders("Desktop")
Set shortcut = WshShell.CreateShortcut(desktopPath & "\Clinique Gestion.lnk")

' Chemin vers le script VBS
frontendPath = "C:\Users\21655\Desktop\python\frontend"
shortcut.TargetPath = frontendPath & "\start_silent.vbs"
shortcut.WorkingDirectory = frontendPath
shortcut.Description = "Lancer l'application Clinique Gestion"
shortcut.IconLocation = frontendPath & "\public\favicon.ico,0"

' Sauvegarder le raccourci
shortcut.Save

WScript.Echo "Raccourci créé sur le bureau avec succès!"

Set shortcut = Nothing
Set FSO = Nothing
Set WshShell = Nothing
