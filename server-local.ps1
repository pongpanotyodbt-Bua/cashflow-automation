$root = "C:\Users\User\Desktop\Cashflow Automation"
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "OK: http://localhost:$port/bundle.html" -ForegroundColor Green

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript"
  ".css"  = "text/css"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = $ctx.Request.Url.LocalPath
  if ($path -eq "/" -or $path -eq "") { $path = "/bundle.html" }
  $fp = Join-Path $root ($path.TrimStart("/").Replace("/","\"))
  $res = $ctx.Response
  try {
    if (Test-Path $fp -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fp).ToLower()
      $mime = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($fp)
      $res.ContentType  = $mime
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes("Not found: $path")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {}
  $res.OutputStream.Close()
}
