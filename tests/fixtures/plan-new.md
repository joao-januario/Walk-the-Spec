# Implementation Plan: Test Feature V2

**Branch**: `002-test-v2` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)

## Summary

A restructured plan for testing the new engineering-focused format with prose Technical Approach and explicit Architecture Decisions.

## Technical Approach

This feature uses TypeScript 5.x with React 19 in an Electron shell. The main process handles filesystem operations via IPC, while the renderer displays structured data. Vitest is used for unit and integration testing with TDD for parsers.

The key integration point is between the markdown parsers in the main process and the React components in the renderer — parsed data flows over IPC as typed objects.

## Constitution Check

All principles pass. No violations.

## Architecture Decisions

### 1. Use heading blocks for review findings

**Decision**: Change review.md from pipe-delimited table rows to heading blocks per finding.

**Rationale**: Tables cannot contain fenced code blocks or multi-line content. Heading blocks support full markdown.

**Alternatives rejected**: Keep table + expanded section below — duplicates data. HTML details collapse — renders poorly.

**Impact**: Review parser needs block-based extraction with table fallback.

### 2. CSS-styled code rendering

**Decision**: Use styled pre/code elements with Tokyo Night theme instead of a syntax highlighting library.

**Rationale**: Short snippets (5-20 lines) only need visual distinction from prose. No dependency needed.

**Alternatives rejected**: shiki — too heavy. highlight.js — unnecessary runtime cost.

## Project Structure

### Files modified

```text
src/main/parser/plan-parser.ts
src/main/parser/review-parser.ts
src/renderer/src/components/artifacts/PlanView.tsx
src/renderer/src/components/artifacts/ReviewView.tsx
```
