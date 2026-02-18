Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Chemin vers le bureau
desktopPath = WshShell.SpecialFolders("Desktop")

' Nom du raccourci
shortcutPath = desktopPath & "\Clinique Gestion.lnk"

' Créer le raccourci
Set shortcut = WshShell.CreateShortcut(shortcutPath)

' Cible : le script VBS qui lance tout de manière invisible
shortcut.TargetPath = "C:\Users\21655\Desktop\python\Lancer_Invisible.vbs"
shortcut.WorkingDirectory = "C:\Users\21655\Desktop\python"
shortcut.Description = "Lancer l'application Clinique Gestion"

' Icône : Utiliser icon.ico (vérifié existant)
iconPath = "C:\Users\21655\Desktop\python\frontend\public\icon.ico"
If FSO.FileExists(iconPath) Then
    shortcut.IconLocation = iconPath & ",0"
End If

' Sauvegarder
shortcut.Save

WScript.Echo "Succès : Raccourci créé sur le bureau avec l'icône correcte."

Set shortcut = Nothing
Set FSO = Nothing
Set WshShell = Nothing
