#Requires -Version 5.1
<#
.SYNOPSIS
  Poll a GitHub Actions run until it finishes. Print nothing while it is healthy.

.DESCRIPTION
  Prefer -RunId (from the URL `gh workflow run` prints). Otherwise picks the newest
  matching run created after -StartedAfter (minus 2 minutes of clock skew) and
  optionally after -AfterRunId / on -HeadBranch.
  Sleeps 60s between gh API calls. Writes a single sentinel line only when the
  run is waiting on an environment, or when it succeeds or fails.

  WAITING_APPROVAL <id> <url>
  SUCCEEDED <id> <url>
  FAILED <reason> <id> <url>

.PARAMETER Workflow
  Workflow name (the `name:` value), e.g. "Promote to staging" or "Deploy".

.PARAMETER RunId
  Database id of the run to watch (recommended). `gh workflow run` prints a run URL.

.PARAMETER StartedAfter
  UTC timestamp recorded immediately before `gh workflow run`. ISO-8601.

.PARAMETER AfterRunId
  Ignore runs whose databaseId is less than or equal to this id.

.PARAMETER HeadBranch
  Optional head branch or tag (for example the release tag on Deploy).
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $Workflow,

  [Parameter(Mandatory = $false)]
  [long] $RunId = 0,

  [Parameter(Mandatory = $false)]
  [string] $StartedAfter = '',

  [Parameter(Mandatory = $false)]
  [long] $AfterRunId = 0,

  [Parameter(Mandatory = $false)]
  [string] $HeadBranch
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-Utc([string] $Value) {
  return [DateTimeOffset]::Parse(
    $Value,
    [Globalization.CultureInfo]::InvariantCulture,
    [Globalization.DateTimeStyles]::AssumeUniversal
  ).UtcDateTime
}

function Write-Sentinel([string] $Line) {
  Write-Output $Line
}

function Get-Prop($Object, [string] $Name) {
  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop -or $null -eq $prop.Value) { return '' }
  return [string] $prop.Value
}

function ConvertFrom-GhJsonArray([string] $Raw) {
  if ([string]::IsNullOrWhiteSpace($Raw)) { return @() }
  $parsed = $Raw | ConvertFrom-Json
  if ($null -eq $parsed) { return @() }
  if ($parsed -is [System.Array]) { return @($parsed) }
  return @($parsed)
}

$htmlBase = $null

function Get-RunHtml([long] $Id, [string] $Url) {
  if ($Url -and $Url.StartsWith('https://github.com/')) {
    return $Url
  }
  if (-not $script:htmlBase) {
    $script:htmlBase = & gh repo view --json nameWithOwner --jq .nameWithOwner
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($script:htmlBase)) {
      $script:htmlBase = 'unknown/unknown'
    }
  }
  return "https://github.com/$($script:htmlBase)/actions/runs/$Id"
}

function Get-RunFromView([long] $Id) {
  $ErrorActionPreference = 'Continue'
  $raw = & gh run view $Id --json databaseId,status,conclusion,url,createdAt,headBranch,event 2>$null
  $viewExit = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($viewExit -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) { return $null }
  return $raw | ConvertFrom-Json
}

function Get-RunFromList {
  param(
    [string] $StartedAfterUtc,
    [long] $AfterRunId,
    [string] $HeadBranch
  )

  if ([string]::IsNullOrWhiteSpace($StartedAfterUtc)) {
    return $null
  }

  $started = (ConvertTo-Utc $StartedAfterUtc).AddMinutes(-2)
  $ErrorActionPreference = 'Continue'
  $raw = & gh run list --workflow $Workflow --limit 20 --json databaseId,status,conclusion,url,createdAt,headBranch,event 2>$null
  $listExit = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'

  if ($listExit -ne 0) {
    return @{ Error = 'gh-list' }
  }

  $runs = ConvertFrom-GhJsonArray $raw
  $candidates = @()
  foreach ($run in $runs) {
    if ($null -eq $run -or [string]::IsNullOrWhiteSpace((Get-Prop $run 'databaseId'))) { continue }
    $id = [long] (Get-Prop $run 'databaseId')
    if ($id -le $AfterRunId) { continue }
    $created = ConvertTo-Utc (Get-Prop $run 'createdAt')
    if ($created -lt $started) { continue }
    if (-not [string]::IsNullOrWhiteSpace($HeadBranch) -and (Get-Prop $run 'headBranch') -ne $HeadBranch) {
      continue
    }
    $candidates += $run
  }

  if ($candidates.Count -eq 0) { return $null }
  return $candidates | Sort-Object { [long] $_.databaseId } -Descending | Select-Object -First 1
}

if ($RunId -le 0 -and [string]::IsNullOrWhiteSpace($StartedAfter)) {
  Write-Sentinel "FAILED args 0 $Workflow"
  exit 1
}

$deadline = [DateTime]::UtcNow.AddHours(6)
$missingDeadline = [DateTime]::UtcNow.AddMinutes(15)
$announcedWaiting = $false
$consecutiveListErrors = 0

while ([DateTime]::UtcNow -lt $deadline) {
  $match = $null

  if ($RunId -gt 0) {
    $match = Get-RunFromView $RunId
    if ($null -eq $match) {
      if ([DateTime]::UtcNow -ge $missingDeadline) {
        Write-Sentinel "FAILED gh-view $RunId $Workflow"
        exit 1
      }
      Start-Sleep -Seconds 60
      continue
    }
  }
  else {
    $listResult = Get-RunFromList -StartedAfterUtc $StartedAfter -AfterRunId $AfterRunId -HeadBranch $HeadBranch
    if ($null -ne $listResult -and $listResult -is [hashtable] -and $listResult.Error -eq 'gh-list') {
      $consecutiveListErrors++
      if ($consecutiveListErrors -ge 5) {
        Write-Sentinel "FAILED gh-list 0 $Workflow"
        exit 1
      }
      Start-Sleep -Seconds 60
      continue
    }
    $consecutiveListErrors = 0
    $match = $listResult

    if ($null -eq $match) {
      if ([DateTime]::UtcNow -ge $missingDeadline) {
        Write-Sentinel "FAILED missing 0 $Workflow"
        exit 1
      }
      Start-Sleep -Seconds 60
      continue
    }
  }

  $runId = [long] (Get-Prop $match 'databaseId')
  $html = Get-RunHtml $runId (Get-Prop $match 'url')
  $status = Get-Prop $match 'status'
  $conclusion = Get-Prop $match 'conclusion'

  if ($status -eq 'completed') {
    if ($conclusion -eq 'success') {
      Write-Sentinel "SUCCEEDED $runId $html"
      exit 0
    }
    if ([string]::IsNullOrWhiteSpace($conclusion)) { $conclusion = 'failed' }
    Write-Sentinel "FAILED $conclusion $runId $html"
    exit 1
  }

  if (-not $announcedWaiting -and ($status -eq 'waiting' -or $conclusion -eq 'action_required')) {
    Write-Sentinel "WAITING_APPROVAL $runId $html"
    $announcedWaiting = $true
  }

  Start-Sleep -Seconds 60
}

Write-Sentinel 'FAILED timeout 0 exceeded-6h'
exit 1
