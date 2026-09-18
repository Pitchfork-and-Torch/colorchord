# Deploy ColorChord Living Spectrum to Cloudflare Pages (play-colorchord.jonbailey.xyz)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Project = "colorchord-play-jonbailey"

Push-Location $Root
try {
  Write-Host "[DEPLOY] Building ColorChord instrument (cloudflare_pages)..." -ForegroundColor Cyan
  $env:NITRO_PRESET = "cloudflare_pages"
  $env:VITE_AUTH_ENABLED = "false"
  npx vite build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  py -3 $env:USERPROFILE\.grok\scripts\ensure-pages-seo-excludes.py (Join-Path $Root "dist")

  Write-Host "[DEPLOY] Pages deploy project=$Project" -ForegroundColor Cyan
  npx --yes wrangler pages deploy dist --project-name=$Project --commit-dirty=true
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Play:    https://play-colorchord.jonbailey.xyz/"
Write-Host "Preview: https://$Project.pages.dev/"
Write-Host "API:     https://play-colorchord.jonbailey.xyz/api/chord-color?q=Am7"
Write-Host "Landing: https://colorchord.jonbailey.xyz/"
