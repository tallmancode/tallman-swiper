#Requires -Version 5.1
<#
.SYNOPSIS
  Create a type/slug feature branch when on an integration branch.

.DESCRIPTION
  If HEAD is develop, main, or master → git switch -c <type>/<slug>.
  Otherwise leave the current branch unchanged (unless -Force).

.PARAMETER Type
  Conventional Commit type used as the branch prefix.

.PARAMETER Slug
  Kebab-case slug for the branch name.

.PARAMETER Force
  Always create/switch to <type>/<slug>, even when already on a feature branch.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'revert')]
  [string] $Type,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]
  [string] $Slug,

  [Parameter(Mandatory = $false)]
  [switch] $Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$branchName = "$Type/$Slug"
$current = & git branch --show-current
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($current)) {
  Write-Error 'Could not determine current branch.'
  exit 1
}

$integration = @('develop', 'main', 'master')
$shouldCreate = $Force -or ($integration -contains $current)

if (-not $shouldCreate) {
  Write-Output "Keeping current branch: $current"
  exit 0
}

if ($current -eq $branchName) {
  Write-Output "Already on $branchName"
  exit 0
}

& git show-ref --verify --quiet "refs/heads/$branchName" 2>$null
$existsLocally = ($LASTEXITCODE -eq 0)

if ($existsLocally) {
  & git switch $branchName
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to switch to $branchName"
    exit $LASTEXITCODE
  }
  Write-Output "Switched to existing branch: $branchName"
  exit 0
}

& git switch -c $branchName
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to create branch $branchName"
  exit $LASTEXITCODE
}

Write-Output "Created and switched to: $branchName"
