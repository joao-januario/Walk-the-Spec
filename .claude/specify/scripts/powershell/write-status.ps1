#!/usr/bin/env pwsh
# Writes a status.json file to the current feature's specs directory.
# Used by speckit commands to signal start/completion to the Walk the Spec app.
#
# Usage:
#   write-status.ps1 -Command "speckit.plan" -Status "started"
#   write-status.ps1 -Command "speckit.plan" -Status "completed" -Json

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

# Exit silently if no feature directory found (not all commands run inside a feature branch)
if (-not (Test-Path $paths.FEATURE_DIR)) {
    if ($Json) {
        Write-Output '{"ok":false,"reason":"no feature directory"}'
    }
    exit 0
}

$statusFile = Join-Path $paths.FEATURE_DIR 'status.json'
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

$statusObj = @{
    command   = $Command
    status    = $Status
    timestamp = $timestamp
}

$jsonContent = $statusObj | ConvertTo-Json -Compress
Set-Content -Path $statusFile -Value $jsonContent -Encoding UTF8 -NoNewline

if ($Json) {
    Write-Output $jsonContent
}
