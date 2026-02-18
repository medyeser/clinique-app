$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\Clinique Medicale.lnk"
if (Test-Path $ShortcutPath) { Remove-Item $ShortcutPath -Force }
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "c:\Users\21655\Desktop\python\Lancer_Invisible.vbs"
$Shortcut.WorkingDirectory = "c:\Users\21655\Desktop\python"
$Shortcut.IconLocation = "c:\Users\21655\Desktop\python\frontend\public\icon.ico"
$Shortcut.Save()
