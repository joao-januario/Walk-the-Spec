#!/usr/bin/env pwsh
# Consolidated phase teardown script
# Replaces separate write-status "completed" + extensions.yml after-hooks check.
#
# Usage:
#   teardown-phase.ps1 -Command "spec.plan" -Json

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Output @"
Usage: teardown-phase.ps1 -Command <cmd> [OPTIONS]

Consolidated phase teardown: status signal "completed" + extensions check.

OPTIONS:
  -Command   The spec command name (e.g., "spec.plan")
  -Json      Output in JSON format
  -Help      Show this help message
"@
    exit 0
}

# Source common functions
. "$PSScriptRoot/common.ps1"

$paths = Get-FeaturePathsEnv

# --- 1. Notify app: phase completed ---
Send-PhaseNotify -Command $Command -Status 'completed' -RepoRoot $paths.REPO_ROOT

# --- 2. Check extensions.yml for after-hooks ---
$hasExtensions = $false
$extensionsPath = Join-Path $paths.REPO_ROOT '.claude/specify/extensions.yml'
if (Test-Path $extensionsPath) {
    $hasExtensions = $true
}

# --- 3. Output ---
if ($Json) {
    [PSCustomObject]@{
        STATUS         = 'completed'
        HAS_EXTENSIONS = $hasExtensions
    } | ConvertTo-Json -Compress
} else {
    Write-Output "Status: completed"
    Write-Output "HAS_EXTENSIONS: $hasExtensions"
}
