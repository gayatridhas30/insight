# Generates the self-signed dev certificate for the HTTPS frontend (port 5174)
# and installs it into *your user account's* trusted root store so Chrome/Edge
# stop showing "Your connection is not private" on this machine.
#
#   powershell -ExecutionPolicy Bypass -File scripts\gen-cert.ps1          (reuse)
#   powershell -ExecutionPolicy Bypass -File scripts\gen-cert.ps1 -Force   (regenerate)
#
# Other devices (phones, tablets) cannot be trusted automatically - they only
# need a one-time "Advanced -> Proceed" tap.
param([switch]$Force)

$ErrorActionPreference = 'Stop'

$certsDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'certs'
$pfxPath  = Join-Path $certsDir 'dev.pfx'
$cerPath  = Join-Path $certsDir 'dev.cer'
$ipFile   = Join-Path $certsDir 'lan-ip.txt'
$pass     = 'insightloop'
$portNote = '5174'
$subject  = 'CN=InsightLoop Dev HTTPS'

New-Item -ItemType Directory -Path $certsDir -Force | Out-Null

# ------------------------------------------------------------------ LAN IP ---
$skip = @('vethernet','hyper-v','vmware','virtualbox','vboxnet','wsl','loopback',
          'teredo','isatap','bridge','bluetooth','npcap','docker','minikube',
          'tailscale','zerotier','hamachi','vpn')

$candidates = @()
foreach ($ni in @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue)) {
  $alias = "$($ni.InterfaceAlias)".ToLower()
  $hit = $false
  foreach ($s in $skip) { if ($alias -like "*$s*") { $hit = $true; break } }
  if ($hit) { continue }
  $ip = $ni.IPAddress
  if ($ip -eq '127.0.0.1' -or $ip.StartsWith('169.254.')) { continue }
  if ($ip.StartsWith('192.168.') -or $ip.StartsWith('10.') -or
      $ip -match '^172\.(1[6-9]|2[0-9]|3[01])\.') { $candidates += $ip }
}

$lanIp = '127.0.0.1'
if ($candidates.Count -gt 0) {
  $lanIp = ($candidates | Sort-Object {
    if ($_ -like '192.168.*') { 0 } elseif ($_ -like '10.*') { 1 } else { 2 }
  } | Select-Object -First 1)
}

$existingIp = if (Test-Path $ipFile) { (Get-Content $ipFile -Raw).Trim() } else { '' }
$needGen = $Force -or -not (Test-Path $pfxPath) -or ($existingIp -ne $lanIp) -or -not (Test-Path $cerPath)

# --------------------------------------------------------------- generate ---
if ($needGen) {
  foreach ($c in @(Get-ChildItem Cert:\CurrentUser\My -ErrorAction SilentlyContinue |
      Where-Object { $_.Subject -eq $subject })) {
    try { Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($c.Thumbprint)" -Force } catch { }
  }

  $san = "2.5.29.17={text}DNS=localhost&DNS=$($env:COMPUTERNAME)&IPAddress=$lanIp&IPAddress=127.0.0.1"
  # Basic Constraints CA:TRUE is what makes the cert acceptable as a trust root.
  $basic = '2.5.29.19={text}CA:TRUE'
  $eku   = '2.5.29.37={text}1.3.6.1.5.5.7.3.1'
  $cert = New-SelfSignedCertificate `
    -Subject $subject `
    -CertStoreLocation 'Cert:\CurrentUser\My' `
    -NotAfter (Get-Date).AddYears(2) `
    -KeyLength 2048 `
    -KeyExportPolicy Exportable `
    -KeyUsage DigitalSignature,KeyEncipherment `
    -HashAlgorithm SHA256 `
    -TextExtension @($basic, $san, $eku)

  $pw = ConvertTo-SecureString -String $pass -Force -AsPlainText
  Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" `
    -FilePath $pfxPath -Password $pw | Out-Null
  Export-Certificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" `
    -FilePath $cerPath -Type CERT | Out-Null
  Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force -ErrorAction SilentlyContinue
  Set-Content -Path $ipFile -Value $lanIp -Encoding ascii
  "cert      : generated $pfxPath + $cerPath ($lanIp)"
} else {
  $lanIp2 = (Get-Content $ipFile -Raw).Trim()
  "cert      : reusing existing ($lanIp2)"
  if (-not (Test-Path $cerPath)) {
    $c = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, $pass)
    [System.IO.File]::WriteAllBytes($cerPath, $c.RawData)
    "cer       : exported $cerPath"
  }
}

# ------------------------------------------------------- trust on this PC ---
if (Test-Path $cerPath) {
  $already = $false
  try {
    $already = @(Get-ChildItem Cert:\CurrentUser\Root -ErrorAction Stop |
      Where-Object { $_.Thumbprint -eq (New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cerPath)).Thumbprint }).Count -gt 0
  } catch { }

  if ($already) {
    "trusted   : already in your user Root store [OK]"
  } else {
    & certutil.exe -user -addstore Root $cerPath | Out-Null
    if ($LASTEXITCODE -eq 0) {
      "trusted   : installed into your user Root store [OK]"
      "            Fully close Chrome (all windows) and reopen it."
    } else {
      "trusted   : could not install automatically."
      "            Run once as Administrator:"
      "            certutil -user -addstore Root `"$cerPath`""
    }
  }
}

"lan ip    : $lanIp"
"open this : https://${lanIp}:$portNote/feedback/<CODE>"
