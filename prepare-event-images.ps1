param([string]$EventFolder = '', [string]$AssetRoot = 'assets/events')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot $AssetRoot
if ($EventFolder) { $root = Join-Path $root $EventFolder }
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' -and $_.FullName -notmatch '[\\/]previews?[\\/]' } | ForEach-Object {
    $source = $_
    $folder = Join-Path $source.DirectoryName 'previews'
    [System.IO.Directory]::CreateDirectory($folder) | Out-Null
    $target = Join-Path $folder ($source.Name + '.jpg')
    $image = [System.Drawing.Image]::FromFile($source.FullName)
    try {
        if ($image.PropertyIdList -contains 274) {
            $orientation = [BitConverter]::ToUInt16($image.GetPropertyItem(274).Value, 0)
            $rotations = @{ 2 = 4; 3 = 2; 4 = 6; 5 = 5; 6 = 1; 7 = 7; 8 = 3 }
            if ($rotations.ContainsKey([int]$orientation)) { $image.RotateFlip([System.Drawing.RotateFlipType]$rotations[[int]$orientation]) }
        }
        $ratio = [Math]::Min(1.0, 1400.0 / [Math]::Max($image.Width, $image.Height))
        $bitmap = [System.Drawing.Bitmap]::new([int]($image.Width * $ratio), [int]($image.Height * $ratio))
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.Clear([System.Drawing.Color]::White)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($image, 0, 0, $bitmap.Width, $bitmap.Height)
            $bitmap.Save($target, $codec, $parameters)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
        Write-Output $target
    } finally { $image.Dispose() }
}
$parameters.Dispose()
if ($AssetRoot -eq 'assets/travel') {
    $manifest = @{}
    foreach ($trip in @('kii', 'izu')) {
        $manifest[$trip] = @(Get-ChildItem -LiteralPath (Join-Path $root $trip) -File | Where-Object Name -match '^\d+\.jpg$' | Sort-Object Name | Select-Object -ExpandProperty Name)
    }
    $json = ConvertTo-Json -InputObject $manifest -Depth 4
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'travel-photo-manifest.js'), "window.travelPhotoManifest = $json;", [System.Text.UTF8Encoding]::new($false))
}
