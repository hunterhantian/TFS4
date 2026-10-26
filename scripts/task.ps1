param([Parameter(Position=0)][string]$Task='test')
$ErrorActionPreference='Stop'
$allowed=@('install','dev','start','test','data:check')
if($Task -notin $allowed){throw "Supported tasks: $($allowed -join ', ')"}
[string[]]$taskArgs=if($Task -eq 'install'){@('install','--frozen-lockfile')}else{@($Task)}
$pnpmCommand=Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if($pnpmCommand){ & $pnpmCommand.Source @taskArgs; exit $LASTEXITCODE }
$nodeCommand=Get-Command node -ErrorAction Stop
$nodeRoot=Split-Path (Split-Path $nodeCommand.Source)
$bundledPnpm=Join-Path $nodeRoot 'node_modules\pnpm\bin\pnpm.cjs'
if(!(Test-Path $bundledPnpm)){throw 'Install pnpm 11.25.0, then run pnpm install --frozen-lockfile.'}
& $nodeCommand.Source $bundledPnpm @taskArgs
exit $LASTEXITCODE


