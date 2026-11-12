# The console look of Remiqora's install and launch scripts (install.bat, setup_prereqs.ps1, setup_models.ps1,
# launch.ps1): dot-sourced right after the script defines $root. Brings the language switch T, colours, the banner
# and the Step / Ok / Warn / Fail / Ask helpers.
# True colour (VT) where the console takes it; the old conhost without it gets the banner in 16 colours;
# redirected output and NO_COLOR get plain text.

# Message language: REMIQORA_LANG if set, else the Windows display language; Russian or English
$script:lang = if ($env:REMIQORA_LANG) { $env:REMIQORA_LANG } else { (Get-UICulture).TwoLetterISOLanguageName }
$script:ru = $script:lang.ToLowerInvariant().StartsWith('ru')
function T([string]$Ru, [string]$En) { if ($script:ru) { $Ru } else { $En } }

$utf8 = New-Object System.Text.UTF8Encoding($false)
try { [Console]::OutputEncoding = $utf8 } catch { }
$OutputEncoding = $utf8

$esc = [char]27
function Enable-Vt {
    if ($env:NO_COLOR -or $env:TERM -eq 'dumb') { return $false }
    if ($env:FORCE_COLOR) { return $true }   # colour into a pipe (screenshots, tests)
    if ([Console]::IsOutputRedirected) { return $false }
    try {
        Add-Type -Namespace RemiqoraConsole -Name Native -ErrorAction Stop -MemberDefinition '[DllImport("kernel32.dll")] public static extern IntPtr GetStdHandle(int n); [DllImport("kernel32.dll")] public static extern bool GetConsoleMode(IntPtr h, out uint m); [DllImport("kernel32.dll")] public static extern bool SetConsoleMode(IntPtr h, uint m);'
        $h = [RemiqoraConsole.Native]::GetStdHandle(-11)   # STD_OUTPUT_HANDLE
        [uint32]$mode = 0
        if (-not [RemiqoraConsole.Native]::GetConsoleMode($h, [ref]$mode)) { return $false }
        if (($mode -band 4) -ne 0) { return $true }
        return [RemiqoraConsole.Native]::SetConsoleMode($h, ($mode -bor 5))   # VT processing | processed output
    } catch { return $false }
}
$script:vt = Enable-Vt
$script:tty = -not [Console]::IsOutputRedirected

# The app's palette (frontend/src/style.css): --color-accent1 violet, --color-accent2 pink, and the status colours
$cViolet = 168, 85, 247; $cPink = 236, 72, 153; $cGreen = 74, 222, 128; $cRed = 248, 113, 113
$cAmber = 251, 191, 36; $cCyan = 103, 232, 249; $cGrey = 148, 163, 184

# Colours a piece of text (returns it plain without VT)
function C([int[]]$Rgb, [string]$Text, [switch]$Bold) {
    if (-not $script:vt) { return $Text }
    $b = if ($Bold) { '1;' } else { '' }
    "$esc[${b}38;2;$($Rgb[0]);$($Rgb[1]);$($Rgb[2])m$Text$esc[0m"
}
function Dim([string]$Text) { if ($script:vt) { "$esc[2m$Text$esc[0m" } else { $Text } }
function Gb([double]$Bytes) { ($Bytes / 1e9).ToString('0.0', [Globalization.CultureInfo]::InvariantCulture) + ' ' + (T 'ГБ' 'GB') }
function Get-FreeBytes([string]$Path) {
    try { (New-Object IO.DriveInfo ([IO.Path]::GetPathRoot([IO.Path]::GetFullPath($Path)))).AvailableFreeSpace } catch { -1 }
}

# One section of the run, its result lines, and a plain note under them
function Step([string]$Text) { Write-Host ''; Write-Host ('  ' + (C $cViolet '▍' -Bold) + ' ' + (C $cViolet $Text -Bold)) }
function Ok([string]$Text) { Write-Host ('  ' + (C $cGreen '✓') + ' ' + $Text) }
function Warn([string]$Text) { Write-Host ('  ' + (C $cAmber '!' -Bold) + ' ' + (C $cAmber $Text)) }
function Fail([string]$Text) { Write-Host ('  ' + (C $cRed '✗' -Bold) + ' ' + (C $cRed $Text)) }
function Note([string]$Text) { Write-Host ('    ' + (Dim $Text)) }
function Info([string]$Label, [string]$Value) { Write-Host ('    ' + (Dim $Label) + ' ' + (C $cCyan $Value)) }

# One question with its default in brackets; Enter takes the default, a closed stdin returns $null
function Ask([string]$Prompt, [string]$Default = '') {
    $d = if ($Default) { ' ' + (Dim "[$Default]") } else { '' }
    Write-Host ('  ' + (C $cViolet '?' -Bold) + " $Prompt$d : ") -NoNewline
    $a = Read-Host
    if ($null -eq $a) { return $null }
    if ($a.Trim() -eq '') { return $Default }
    return $a.Trim()
}

# «REMIQORA» in ANSI Shadow
$logo = @(
    '██████╗ ███████╗███╗   ███╗██╗ ██████╗  ██████╗ ██████╗  █████╗ ',
    '██╔══██╗██╔════╝████╗ ████║██║██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗',
    '██████╔╝█████╗  ██╔████╔██║██║██║   ██║██║   ██║██████╔╝███████║',
    '██╔══██╗██╔══╝  ██║╚██╔╝██║██║██║▄▄ ██║██║   ██║██╔══██╗██╔══██║',
    '██║  ██║███████╗██║ ╚═╝ ██║██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║',
    '╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝ ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝'
)
function Get-AppVersion {
    try { (Get-Content (Join-Path $root 'desktop\package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version } catch { '' }
}
function Show-Banner([string]$Subtitle) {
    $version = Get-AppVersion
    $line = $Subtitle
    if ($version) { $line += (T '  ·  версия ' '  ·  version ') + $version }
    $tagline = T 'Создано с AI. Сделано тобой.' 'Made with AI. Made by you.'
    Write-Host ''
    if ($script:vt) {
        $g0 = $cViolet; $g1 = $cPink
        foreach ($row in $logo) {
            $n = [Math]::Max($row.Length - 1, 1)
            $sb = New-Object System.Text.StringBuilder
            [void]$sb.Append('  ')
            for ($x = 0; $x -lt $row.Length; $x++) {
                $ch = $row[$x]
                if ($ch -eq ' ') { [void]$sb.Append($ch); continue }
                $t = $x / $n
                $k = if ('█▄▀'.Contains([string]$ch)) { 1.0 } else { 0.55 }   # the shadow's lines: the same hue, darker
                $r = [int][Math]::Round(($g0[0] + ($g1[0] - $g0[0]) * $t) * $k)
                $gg = [int][Math]::Round(($g0[1] + ($g1[1] - $g0[1]) * $t) * $k)
                $b = [int][Math]::Round(($g0[2] + ($g1[2] - $g0[2]) * $t) * $k)
                [void]$sb.Append("$esc[38;2;${r};${gg};${b}m$ch")
            }
            [void]$sb.Append("$esc[0m")
            Write-Host $sb.ToString()
        }
        Write-Host ('  ' + (C $cPink $tagline -Bold) + (Dim '  ·  ') + $line)
        Write-Host ('  ' + (Dim ('─' * $logo[0].Length)))
    } elseif ($script:tty) {
        # no true colour (the old conhost): 16 colours, violet to pink across the letters
        foreach ($row in $logo) {
            Write-Host '  ' -NoNewline
            for ($x = 0; $x -lt $row.Length; $x++) {
                $col = if ($row[$x] -notin '█', '▄', '▀') { 'DarkMagenta' } elseif ($x -lt $row.Length * 2 / 3) { 'Magenta' } else { 'Red' }
                Write-Host $row[$x] -NoNewline -ForegroundColor $col
            }
            Write-Host ''
        }
        Write-Host ("  $tagline  ·  $line") -ForegroundColor Magenta
        Write-Host ('  ' + ('─' * $logo[0].Length)) -ForegroundColor DarkGray
    } else {
        Write-Host ("  REMIQORA  ·  $line")
        Write-Host ('  ' + ('-' * 40))
    }
}

# The window of a double-clicked .bat (REMIQORA_WAIT, set by the .bat) stays up until Enter
function Wait-Close {
    if (-not $env:REMIQORA_WAIT) { return }
    Write-Host ''
    Write-Host ('  ' + (Dim (T 'Нажмите Enter, чтобы закрыть окно' 'Press Enter to close this window')))
    try { [void](Read-Host) } catch { }
}

# Runs a native command; a non-zero exit code is an error, not a line that scrolls by
function Invoke-Native([string]$Name, [string[]]$NativeArgs) {
    & $Name @NativeArgs
    if ($LASTEXITCODE -ne 0) { throw (T "Команда завершилась с кодом $LASTEXITCODE`: $Name $($NativeArgs -join ' ')" "Command exited with code $LASTEXITCODE`: $Name $($NativeArgs -join ' ')") }
}

# winget writes new PATH entries to the registry: read them into this process, so tools installed a minute ago
# are found without opening a new terminal
function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($env:Path, $machine, $user) -join ';')
}
