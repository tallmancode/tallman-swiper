#Requires -Version 5.1
<#
.SYNOPSIS
  Print the next patch version (X.Y.Z, no v prefix) from the newest vX.Y.Z tag.
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& git fetch origin --tags 2>$null | Out-Null
$ErrorActionPreference = $prev

$tags = @(& git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname)
if ($LASTEXITCODE -ne 0) {
  Write-Error 'git tag failed.'
  exit 1
}

$latest = $tags | Where-Object { $_ -match '^v[0-9]+\.[0-9]+\.[0-9]+$' } | Select-Object -First 1
if ([string]::IsNullOrWhiteSpace($latest)) {
  Write-Error 'No vX.Y.Z tag found. Pass an explicit version.'
  exit 1
}

if ($latest -notmatch '^v([0-9]+)\.([0-9]+)\.([0-9]+)$') {
  Write-Error "Unparseable tag $latest"
  exit 1
}

$patch = [int] $Matches[3] + 1
Write-Output "$($Matches[1]).$($Matches[2]).$patch"
