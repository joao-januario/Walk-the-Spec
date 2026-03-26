#!/usr/bin/env pwsh
# Sends a phase notification to the Walk the Spec app via HTTP API.
#
# Usage:
#   write-status.ps1 -Command "spec.plan" -Status "started"
#   write-status.ps1 -Command "spec.plan" -Status "completed" -Json

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(Mandatory=$true)]
    [ValidateSet('started', 'completed')]
    [string]$Status,

    [switch]$Json
)

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'common.ps1')

$paths = Get-FeaturePathsEnv

Send-PhaseNotify -Command $Command -Status $Status -RepoRoot $paths.REPO_ROOT

if ($Json) {
    Write-Output "{`"ok`":true,`"command`":`"$Command`",`"status`":`"$Status`"}"
}
