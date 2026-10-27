$ErrorActionPreference='Stop'
$productionRoot=Join-Path $PSScriptRoot '../.local/stage2/production/2023-2024-v2'
$rasterManifest=Get-Content -Raw -LiteralPath (Join-Path $productionRoot 'raster-manifest.json') | ConvertFrom-Json
$napsRoot=Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'NAPS2'
[xml]$ocrConfig=Get-Content -LiteralPath (Join-Path $napsRoot 'config.xml')
if($ocrConfig.UserConfig.OcrMode -ne 'Best' -and $ocrConfig.DocumentElement.OcrMode -ne 'Best'){throw 'NAPS2 OCR mode is not Best'}
$modelRoot=Join-Path $napsRoot 'components/tesseract4/best'
$models=@('fra','chi_sim') | ForEach-Object { $modelPath=Join-Path $modelRoot ($_.ToString()+'.traineddata'); if(!(Test-Path -LiteralPath $modelPath)){throw "Missing Best model $_"}; @{language=$_;path=$modelPath;sha256=(Get-FileHash -LiteralPath $modelPath -Algorithm SHA256).Hash.ToLowerInvariant()} }
$records=@()
foreach($source in $rasterManifest.sources){
 if($source.kind -notin @('paper','answers','explanations')){throw "Out-of-scope source: $($source.kind)"}
 $images=@($source.pageImages | ForEach-Object {$_.path}) -join ';'
 if(Test-Path -LiteralPath $source.output){throw "Output exists; create a new explicit production run: $($source.output)"}
 & 'D:/NAPS2/NAPS2.Console.exe' -i $images -o $source.output -n 0 --ocrlang 'fra+chi_sim' -v
 if($LASTEXITCODE -ne 0){throw "Best OCR failed: $($source.id)"}
 [xml]$afterConfig=Get-Content -LiteralPath (Join-Path $napsRoot 'config.xml')
 if($afterConfig.DocumentElement.OcrMode -ne 'Best'){throw 'OCR configuration changed during run'}
 $records+=@{id=$source.id;mode='Best';languages=@('fra','chi_sim');models=$models;forceRasterized=$true;dpi=300;inputSha256=$source.sha256;pages=$source.originalPages;output=$source.output;outputSha256=(Get-FileHash -LiteralPath $source.output -Algorithm SHA256).Hash.ToLowerInvariant();completedAt=[DateTime]::UtcNow.ToString('o')}
 $records | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $productionRoot 'ocr.run.json') -Encoding utf8
 Write-Output "Completed Best OCR: $($source.id)"
}
