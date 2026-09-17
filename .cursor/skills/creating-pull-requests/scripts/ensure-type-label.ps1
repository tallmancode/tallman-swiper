#Requires -Version 5.1
<#
.SYNOPSIS
  Ensure a Conventional Commit type label exists on the GitHub repo.

.PARAMETER Type
  One of: feat, fix, refactor, docs, test, chore, perf, ci, revert.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'revert')]
  [string] $Type
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$descriptions = @{
  feat     = 'New user-facing feature'
  fix      = 'Bug fix'
  refactor = 'Restructure without behavior change'
  docs     = 'Documentation only'
  test     = 'Tests'
  chore    = 'Build, tooling, deps'
  perf     = 'Performance'
  ci       = 'GitHub Actions / workflows'
  revert   = 'Revert a previous commit'
}

$existingJson = & gh label list --json name --jq '.[].name'
if ($LASTEXITCODE -ne 0) {
  Write-Error 'gh label list failed. Is gh authenticated?'
  exit $LASTEXITCODE
}

$names = @()
if ($existingJson) {
  $names = $existingJson -split "`r?`n" | Where-Object { $_ }
}

if ($names -contains $Type) {
  Write-Output "Label already exists: $Type"
  exit 0
}

$description = $descriptions[$Type]
& gh label create $Type --description $description
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to create label: $Type"
  exit $LASTEXITCODE
}

Write-Output "Created label: $Type"
