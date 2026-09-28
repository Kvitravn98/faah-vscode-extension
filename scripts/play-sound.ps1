param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $SoundPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore
$resolvedSoundPath = [System.IO.Path]::GetFullPath($SoundPath)

$player = New-Object System.Windows.Media.MediaPlayer
try {
    $player.Open([System.Uri]::new($resolvedSoundPath))
    $player.Play()
    Start-Sleep -Milliseconds 2000
}
finally {
    $player.Stop()
    $player.Close()
}
