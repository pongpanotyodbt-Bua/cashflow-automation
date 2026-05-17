# Request admin elevation
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "Requesting admin rights..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
  exit
}

Write-Host "Running as Administrator" -ForegroundColor Green

$root = Split-Path $MyInvocation.MyCommand.Path
$port = 8000
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress

# Add URL ACL reservation (requires admin)
Write-Host "Reserving URL for network access..." -ForegroundColor Cyan
netsh http delete urlacl "url=http://localhost:$port/" 2>$null | Out-Null
netsh http delete urlacl "url=http://${ip}:${port}/" 2>$null | Out-Null
netsh http add urlacl "url=http://localhost:$port/" user="Everyone" | Out-Null
netsh http add urlacl "url=http://${ip}:${port}/" user="Everyone" | Out-Null

$prefix = @("http://localhost:$port/", "http://${ip}:${port}/")

$listener = New-Object System.Net.HttpListener
foreach ($p in $prefix) { $listener.Prefixes.Add($p) }
Write-Host "Server running at:" -ForegroundColor Green
Write-Host "  http://localhost:$port/bundle.html" -ForegroundColor Green
Write-Host "  http://${ip}:${port}/bundle.html" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

$listener.Start()

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".jsx"  = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".svg"  = "image/svg+xml"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq "/") { $urlPath = "/index.html" }

    $filePath = Join-Path $root $urlPath.TrimStart("/").Replace("/", "\")

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host "200 $urlPath"
    } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found: $urlPath")
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
        Write-Host "404 $urlPath"
    }

    $res.OutputStream.Close()
}
