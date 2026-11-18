# InsightLoop - start all services (MongoDB, Backend, AI, Frontend, HTTPS)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$log = Join-Path $root '.logs'
$py  = "C:\Users\Gayatri Dhas\AppData\Local\Programs\Python\Python313\python.exe"
New-Item -ItemType Directory -Path $log -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $root 'backend\.mongo-data') -Force | Out-Null

# ------------------------------------------------------------------
# Self-signed certificate for the HTTPS frontend (port 5174).
# Required: browsers only expose the microphone on secure contexts, and
# http://<LAN-IP> is not one. Re-generated automatically if the LAN IP changes.
# ------------------------------------------------------------------
& powershell -ExecutionPolicy Bypass -File (Join-Path $root 'frontend\scripts\gen-cert.ps1')
if ($LASTEXITCODE -ne 0 -and -not (Test-Path (Join-Path $root 'frontend\certs\dev.pfx'))) {
  "Cert     : FAILED - HTTPS frontend will not start"
}

# ------------------------------------------------------------------
# Windows Firewall: phones on the same Wi-Fi must reach both dev servers.
#   5173 -> plain HTTP (this machine's own browser, zero-config)
#   5174 -> HTTPS     (QR codes, shared links, any other device)
# ------------------------------------------------------------------
foreach ($port in 5173, 5174) {
  $fwRuleName = "InsightLoop Vite Dev $port"
  $fwExists = Get-NetFirewallRule -DisplayName $fwRuleName -ErrorAction SilentlyContinue
  if (-not $fwExists) {
    try {
      New-NetFirewallRule -DisplayName $fwRuleName `
        -Direction Inbound -Protocol TCP -LocalPort $port `
        -Action Allow -Profile Any `
        -Description 'InsightLoop: allows phones scanning QR codes to reach the Vite dev server for feedback forms.' `
        -ErrorAction Stop | Out-Null
      "Firewall : Port $port rule added [OK]"
    } catch {
      "Firewall : Could not add port $port rule."
      "Firewall : Re-run this script ONCE as Administrator to let phones reach the QR URLs."
    }
  } else {
    "Firewall : Port $port rule already present [OK]"
  }
}

if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
  Start-Process node -ArgumentList 'scripts\start-mongo.mjs' -WorkingDirectory "$root\backend" `
    -RedirectStandardOutput "$log\mongo.out.log" -RedirectStandardError "$log\mongo.err.log" -WindowStyle Hidden
}

Start-Process cmd -ArgumentList "/c","npm start > `"$log\backend.log`" 2>&1" -WorkingDirectory "$root\backend" -WindowStyle Hidden
Start-Process $py -ArgumentList @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000') `
  -WorkingDirectory "$root\ai-service" -RedirectStandardOutput "$log\ai.log" -RedirectStandardError "$log\ai.err.log" -WindowStyle Hidden

# Plain HTTP dev server - this machine's browser only.
Start-Process cmd -ArgumentList "/c","npm run dev > `"$log\frontend.log`" 2>&1" -WorkingDirectory "$root\frontend" -WindowStyle Hidden
# HTTPS dev server - everything that is not this machine (QR, phones, tablets).
Start-Process cmd -ArgumentList "/c","npm run dev:https > `"$log\frontend-https.log`" 2>&1" -WorkingDirectory "$root\frontend" -WindowStyle Hidden

Start-Sleep -Seconds 12
function Test-Port([int]$p) {
  $t = New-Object Net.Sockets.TcpClient
  try { return $t.ConnectAsync('127.0.0.1', $p).Wait(2000) } catch { return $false } finally { $t.Dispose() }
}
$lan = if (Test-Path (Join-Path $root 'frontend\certs\lan-ip.txt')) { (Get-Content (Join-Path $root 'frontend\certs\lan-ip.txt') -Raw).Trim() } else { '<ip>' }

"MongoDB  : 27017" + $(if (Test-Port 27017) { ' [OK]' } else { ' [down]' })
"Backend  : http://localhost:5000/api" + $(if (Test-Port 5000) { ' [OK]' } else { ' [down]' })
"AI       : http://localhost:8000" + $(if (Test-Port 8000) { ' [OK]' } else { ' [down]' })
"Frontend : http://localhost:5173" + $(if (Test-Port 5173) { ' [OK]' } else { ' [down]' })
"HTTPS    : https://$lan`:5174" + $(if (Test-Port 5174) { ' [OK]  <- scan this one (accept the cert warning once)' } else { ' [down]' })
