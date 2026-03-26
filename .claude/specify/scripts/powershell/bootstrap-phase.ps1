#!/usr/bin/env pwsh
# Consolidated phase bootstrap script
# Replaces separate write-status + check-prerequisites + setup-plan calls at the start of each phase.
# Returns a single JSON blob with all context needed to begin a phase.
#
# Usage:
#   bootstrap-phase.ps1 -Command "spec.plan" -Phase plan -Json
#   bootstrap-phase.ps1 -Command "spec.implement" -Phase implement -Json
#   bootstrap-phase.ps1 -Command "spec.specify" -Phase specify -Json -SkipPrereqs

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(Mandatory=$true)]
    [ValidateSet('specify', 'clarify', 'plan', 'tasks', 'implement', 'review', 'heal', 'conclude', 'analyze', 'checklist', 'dive', 'constitution', 'taskstoissues')]
    [string]$Phase,

    [switch]$Json,
    [switch]$SkipPrereqs,
    [switch]$CopyPlanTemplate,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Output @"
Usage: bootstrap-phase.ps1 -Command <cmd> -Phase <phase> [OPTIONS]

Consolidated phase startup: status signal + prerequisites + extensions check.

OPTIONS:
  -Command          The spec command name (e.g., "spec.plan")
  -Phase            The phase type (plan, implement, review, etc.)
  -Json             Output in JSON format
  -SkipPrereqs      Skip prerequisite validation (for specify/constitution)
  -CopyPlanTemplate Copy plan template to feature dir (for plan phase)
  -Help             Show this help message
"@
    exit 0
}

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get feature paths (called ONCE for the entire bootstrap)
$paths = Get-FeaturePathsEnv

# --- 1. Write status "started" ---
if (Test-Path $paths.FEATURE_DIR) {
    $statusFile = Join-Path $paths.FEATURE_DIR 'status.json'
    $timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    $statusObj = @{ command = $Command; status = 'started'; timestamp = $timestamp }
    $jsonContent = $statusObj | ConvertTo-Json -Compress
    Set-Content -Path $statusFile -Value $jsonContent -Encoding UTF8 -NoNewline
}

# --- 2. Validate branch ---
if ($paths.HAS_GIT -and -not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit $paths.HAS_GIT)) {
    Write-Output "ERROR: Not on a feature branch. Current branch: $($paths.CURRENT_BRANCH)"
    exit 1
}

# --- 3. Prerequisite checks (unless skipped) ---
if (-not $SkipPrereqs) {
    if (-not (Test-Path $paths.FEATURE_DIR -PathType Container)) {
        Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
        Write-Output "Run /spec.specify first to create the feature structure."
        exit 1
    }

    # Plan phase needs plan.md for implement/review/heal/etc.
    $requiresPlan = @('implement', 'review', 'heal', 'conclude', 'analyze', 'dive', 'taskstoissues')
    if ($Phase -in $requiresPlan -and -not (Test-Path $paths.IMPL_PLAN -PathType Leaf)) {
        Write-Output "ERROR: plan.md not found in $($paths.FEATURE_DIR)"
        Write-Output "Run /spec.plan first to create the implementation plan."
        exit 1
    }
}

# --- 4. Copy plan template if requested (plan phase) ---
if ($CopyPlanTemplate) {
    New-Item -ItemType Directory -Path $paths.FEATURE_DIR -Force | Out-Null
    $template = Resolve-Template -TemplateName 'plan-template' -RepoRoot $paths.REPO_ROOT
    if ($template -and (Test-Path $template)) {
        Copy-Item $template $paths.IMPL_PLAN -Force
    } else {
        Write-Warning "Plan template not found"
        New-Item -ItemType File -Path $paths.IMPL_PLAN -Force | Out-Null
    }
}

# --- 5. Scan available docs ---
$docs = @()
if (Test-Path $paths.FEATURE_SPEC) { $docs += 'spec.md' }
if (Test-Path $paths.IMPL_PLAN) { $docs += 'plan.md' }
if (Test-Path $paths.RESEARCH) { $docs += 'research.md' }
if (Test-Path $paths.DATA_MODEL) { $docs += 'data-model.md' }
if ((Test-Path $paths.CONTRACTS_DIR) -and (Get-ChildItem -Path $paths.CONTRACTS_DIR -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    $docs += 'contracts/'
}
if (Test-Path $paths.QUICKSTART) { $docs += 'quickstart.md' }

# --- 6. Check extensions.yml ---
$hasExtensions = $false
$beforeHooks = @()
$afterHooks = @()
$extensionsPath = Join-Path $paths.REPO_ROOT '.claude/specify/extensions.yml'
if (Test-Path $extensionsPath) {
    $hasExtensions = $true
    # Parse hooks if needed — skill definitions handle hook execution,
    # we just report whether extensions exist so they can skip the Read call
}

# --- 7. Output ---
if ($Json) {
    [PSCustomObject]@{
        REPO_ROOT       = $paths.REPO_ROOT
        BRANCH          = $paths.CURRENT_BRANCH
        HAS_GIT         = $paths.HAS_GIT
        FEATURE_DIR     = $paths.FEATURE_DIR
        FEATURE_SPEC    = $paths.FEATURE_SPEC
        IMPL_PLAN       = $paths.IMPL_PLAN
        AVAILABLE_DOCS  = $docs
        HAS_EXTENSIONS  = $hasExtensions
    } | ConvertTo-Json -Compress
} else {
    Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
    Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS: $($docs -join ', ')"
    Write-Output "HAS_EXTENSIONS: $hasExtensions"
}
