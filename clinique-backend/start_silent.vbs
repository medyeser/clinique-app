Set WshShell = CreateObject("WScript.Shell")
' Lancer le script start.bat sans afficher la fenêtre
WshShell.Run "cmd /c """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\start.bat""", 0, False
Set WshShell = Nothing
