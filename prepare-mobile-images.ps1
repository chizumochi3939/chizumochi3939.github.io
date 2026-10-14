$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]72)
$manifest = @{}
Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'assets') -Recurse -File | Where-Object { $_.Directory.Name -eq 'previews' -and $_.Extension -eq '.jpg' -and $_.Name -notlike '*.mobile.jpg' } | ForEach-Object {
    $target = Join-Path $_.DirectoryName ($_.BaseName + '.mobile.jpg')
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    try {
        $ratio = [Math]::Min(1.0, 640.0 / [Math]::Max($image.Width, $image.Height))
        $bitmap = [System.Drawing.Bitmap]::new([Math]::Max(1, [int]($image.Width * $ratio)), [Math]::Max(1, [int]($image.Height * $ratio)))
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($image, 0, 0, $bitmap.Width, $bitmap.Height)
            $bitmap.Save($target, $codec, $parameters)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
    } finally { $image.Dispose() }
    $src = [System.IO.Path]::GetRelativePath($PSScriptRoot, $_.FullName).Replace('\', '/')
    $manifest[$src] = [System.IO.Path]::GetRelativePath($PSScriptRoot, $target).Replace('\', '/')
}
$parameters.Dispose()
$json = ConvertTo-Json -InputObject $manifest -Depth 3
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'mobile-image-previews.js'), "window.mobileImagePreviews = $json;`n", [System.Text.UTF8Encoding]::new($false))
Write-Output ($manifest.Count.ToString() + ' mobile previews generated')
