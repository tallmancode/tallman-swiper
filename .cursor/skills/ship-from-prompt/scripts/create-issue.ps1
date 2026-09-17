#Requires -Version 5.1
<#
.SYNOPSIS
  Create a GitHub issue and print its URL.

.PARAMETER Title
  Issue title.

.PARAMETER Body
  Issue body.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $Title,

  [Parameter(Mandatory = $true)]
  [string] $Body
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$url = & gh issue create --title $Title --body $Body
if ($LASTEXITCODE -ne 0) {
  Write-Error 'gh issue create failed.'
  exit $LASTEXITCODE
}

Write-Output $url
