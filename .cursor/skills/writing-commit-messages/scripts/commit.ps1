#Requires -Version 5.1
<#
.SYNOPSIS
  Stage optional paths and create a git commit with a PowerShell here-string message.

.DESCRIPTION
  Fragile commit mechanics for Windows PowerShell 5.x. Does not invent messages,
  amend, skip hooks, or push. Prefer this over bash HEREDOC patterns.

.PARAMETER Message
  Full commit message (subject + optional body). Required.

.PARAMETER Paths
  Optional paths to git add before committing. If omitted, commits already-staged
  changes only and fails when the index is empty.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $Message,

  [Parameter(Mandatory = $false)]
  [string[]] $Paths
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-SecretPath {
  param([string] $Path)
  $normalized = ($Path -replace '\\', '/').TrimStart('./')
  $leaf = Split-Path -Path $normalized -Leaf
  if ($leaf -eq '.env') { return $true }
  if ($leaf -like '.env.*' -and $leaf -notlike '.env.*.example' -and $leaf -ne '.env.example') { return $true }
  if ($leaf -eq 'credentials.json') { return $true }
  # deploy/.env and nested env files (allow *.example templates)
  if ($normalized -like 'deploy/.env' -or $normalized -like 'deploy/**/.env') { return $true }
  if (
    ($normalized -like 'deploy/.env.*' -or $normalized -like 'deploy/**/.env.*') -and
    $leaf -notlike '*.example'
  ) { return $true }
  return $false
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  Write-Error 'Message is required and cannot be empty.'
  exit 1
}

if ($Paths -and $Paths.Count -gt 0) {
  foreach ($p in $Paths) {
    if (Test-SecretPath -Path $p) {
      Write-Error "Refusing to stage secret path: $p"
      exit 1
    }
  }
  & git add -- $Paths
  if ($LASTEXITCODE -ne 0) {
    Write-Error 'git add failed.'
    exit $LASTEXITCODE
  }
}

$staged = & git diff --cached --name-only
if ($LASTEXITCODE -ne 0) {
  Write-Error 'git diff --cached failed.'
  exit $LASTEXITCODE
}
if (-not $staged) {
  Write-Error 'Nothing staged to commit. Stage files first or pass -Paths.'
  exit 1
}

# PowerShell here-string — never bash $(cat <<'EOF')
$commitMessage = @"
$Message
"@
& git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
  Write-Error 'git commit failed.'
  exit $LASTEXITCODE
}

Write-Output 'Commit created.'
& git status -sb
