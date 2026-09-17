#Requires -Version 5.1
<#
.SYNOPSIS
  Ensure type label, push branch if needed, and create a GitHub PR.

.PARAMETER Title
  PR title.

.PARAMETER Type
  Conventional Commit type label (feat, fix, ...).

.PARAMETER Summary
  Summary section body (bullets or prose).

.PARAMETER TestPlan
  Test plan checklist text.

.PARAMETER Base
  Base branch. Default: develop.

.PARAMETER IssueRef
  Optional issue line for the PR body (e.g. "Closes #12" or "Refs #12").
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $Title,

  [Parameter(Mandatory = $true)]
  [ValidateSet('feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'revert')]
  [string] $Type,

  [Parameter(Mandatory = $true)]
  [string] $Summary,

  [Parameter(Mandatory = $true)]
  [string] $TestPlan,

  [Parameter(Mandatory = $false)]
  [string] $Base = 'develop',

  [Parameter(Mandatory = $false)]
  [string] $IssueRef
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ensureLabel = Join-Path $scriptDir 'ensure-type-label.ps1'

& $ensureLabel -Type $Type
if ($LASTEXITCODE -ne 0) {
  Write-Error 'ensure-type-label.ps1 failed.'
  exit $LASTEXITCODE
}

# Missing upstream writes to stderr; with $ErrorActionPreference Stop that becomes terminating.
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$upstream = & git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
$upstreamExit = $LASTEXITCODE
$ErrorActionPreference = $prevEap

if ($upstreamExit -ne 0 -or [string]::IsNullOrWhiteSpace($upstream)) {
  & git push -u origin HEAD
  if ($LASTEXITCODE -ne 0) {
    Write-Error 'git push -u origin HEAD failed.'
    exit $LASTEXITCODE
  }
}
else {
  & git push
  if ($LASTEXITCODE -ne 0) {
    Write-Error 'git push failed.'
    exit $LASTEXITCODE
  }
}

$bodyLines = @(
  '## Summary',
  $Summary.TrimEnd(),
  '',
  '## Test plan',
  $TestPlan.TrimEnd()
)
if (-not [string]::IsNullOrWhiteSpace($IssueRef)) {
  $bodyLines += ''
  $bodyLines += $IssueRef.Trim()
}

$body = ($bodyLines -join "`n") + "`n"

& gh pr create --base $Base --title $Title --label $Type --body $body
if ($LASTEXITCODE -ne 0) {
  Write-Error 'gh pr create failed.'
  exit $LASTEXITCODE
}
