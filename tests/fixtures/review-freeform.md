# Code Review — `001-fix-data-fetching`

**Branch**: `001-fix-data-fetching`
**Base**: `master` (`6107fc4`)
**Reviewed**: 2026-03-30
**Diff**: 23 files changed, +1788 / -123

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MEDIUM | 1 |
| LOW | 1 |

---

## Findings

### HIGH-1: SSE progress events are batched, not streamed

- **Rule**: Code Quality — functions should do one thing; Architecture — separation of concerns tradeoff
- **File**: `planner/progress.py:29-66` (new `fetch_all_sources`) and `planner/progress.py:115-145` (refactored `generate_month_progress`)
- **Summary**: The refactoring extracted `fetch_all_sources()` as a regular function with a callback, but `generate_month_progress()` accumulates progress events in a list and yields them all at once after fetching completes, instead of streaming them incrementally.
- **Why this matters**: The SSE progress endpoint (`/api/month/progress`) exists specifically so the UI shows a live progress bar as each source completes during cold-cache calendar loads. With the current code, the client receives zero events while sources are fetching, then gets all progress events in a burst immediately followed by `done`. The progress bar is functionally useless — the user sees no incremental feedback.
- **What you gain by fixing**: Restored real-time progress feedback during cold-cache loads, which is the primary UX motivation for SSE in this app.

```python
# Current (broken streaming):
progress_events = []
def _on_progress(src, step, total):
    progress_events.append(...)       # <-- accumulates, doesn't yield

source_data = fetch_all_sources(...)  # <-- blocks until ALL sources done
yield from progress_events            # <-- all events at once
```

---

### HIGH-2: Refresh polling cannot distinguish old data from new data

- **Rule**: Code Quality — error paths handled explicitly
- **File**: `planner/server/templates/calendar.html:548-570` (`pollForFreshData`)
- **Summary**: After POST `/api/refresh` triggers a background pipeline run, the client polls `GET /api/month` every second. The success check is `data.days && data.days.length > 0`, which is true for the *existing* cached data. The poll resolves immediately with stale data.
- **Why this matters**: Clicking "Refresh" appears to succeed instantly, but the data displayed is the old cache — the background pipeline hasn't finished yet. The user has no way to know whether the refresh actually completed.
- **What you gain by fixing**: The refresh button provides actual feedback about fresh data availability. Options: (a) include a timestamp/generation-id in the cache and compare, (b) have the refresh endpoint return a job ID and poll a status endpoint, or (c) use SSE for refresh progress.

```javascript
// Current — always truthy when any cache exists:
if (data.days && data.days.length > 0) {
  clearInterval(refreshPollId);
  populateCalendar(data);  // <-- shows OLD data
  showToast('Data refreshed');
}
```

---

### MEDIUM-1: Circular import workaround — deferred import from blueprint to app

- **Rule**: Architecture — no circular dependencies between modules; minimal coupling
- **File**: `planner/server/blueprints/calendar.py:131`
- **Summary**: The `/api/refresh` endpoint uses `from ..app import trigger_refresh` inside the handler function to avoid a circular import (`app.py` → blueprints → `app.py`).
- **Why this matters**: Deferred imports are a working solution but indicate the function is in the wrong module. `trigger_refresh` manages pipeline state, which is app-level concern — but routing it through a blueprint handler creates a circular dependency. If more endpoints need app-level operations, this pattern proliferates.
- **What you gain by fixing**: Moving `trigger_refresh` (and the refresh lock/state) to a shared module (e.g. `planner/pipeline.py` or extending `planner/progress.py`) eliminates the circularity. Both `app.py` and the blueprint can cleanly import from the shared module.

---

### LOW-1: TOCTOU race in `trigger_refresh`

- **Rule**: Code Quality — error handling
- **File**: `planner/server/app.py:68-75`
- **Summary**: `trigger_refresh()` checks `_refresh_lock.locked()` then starts a new thread. Between the check and the thread's `acquire()`, a concurrent call could also pass the check.
- **Why this matters**: In practice, the worst case is a redundant thread that immediately returns `False` from `_run_full_pipeline()` — the lock itself prevents concurrent execution. No data corruption risk.
- **What you gain by fixing**: Cleaner code — acquire the lock in the calling function, pass it to the thread, or use a different coordination primitive.

```python
# Current:
def trigger_refresh() -> bool:
    if _refresh_lock.locked():       # <-- check
        return False
    t = threading.Thread(...)        # <-- gap: another call could pass
    t.start()
    return True
```

---

## Cross-Vertical Observations

1. **Refactoring trade-off**: The extraction of `fetch_all_sources()` and `compute_and_cache_month()` from `progress.py` is architecturally sound — it enables reuse by `app.py`'s eager startup and manual refresh. However, the generator-to-callback conversion broke real-time SSE streaming.

2. **Cache versioning is well-implemented**: `MONTH_CACHE_SCHEMA_VERSION` propagated consistently through `planner.py`, `progress.py`, and `calendar.py`.

3. **Test coverage is good**: Three new test files cover the pipeline integration, server endpoints, and source contracts.

## Next Actions

Branch mergeable but HIGH findings strongly recommended for fixing.

Run `/spec.heal` to apply fixes.
