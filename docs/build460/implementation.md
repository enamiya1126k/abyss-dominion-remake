# Build460 implementation notes

UI-only increment over the verified Build459 cumulative archive.

The camera projects the same Build459 course geometry and interpolated progress, including close-finish replays. `fitCamera460` bounds all eight track anchors with a margin and caps scale at 2.25. `separateRunners460` assigns nonoverlapping portrait rectangles in fixed entrant order. Tethers and colored anchor dots distinguish visual portrait separation from authoritative position. No sorting, settlement, physics, or history data is mutated.

Expanded view uses a CSS viewport layout rather than the browser Fullscreen API, retaining mobile browser controls and supporting `dvh` plus safe-area insets. It retains rank, camera controls, commentary and the original boost button. Exit restores the race scroll position, Escape exits, and the result phase clears expanded state. Existing five-command handling and latency behavior are unchanged.

Plain SVG arrow paths avoid the global `pixelizeUiEmoji` text replacement in `src/main.js`. No global icon behavior is modified. Rival details preserve focus restoration, keyboard closure and the existing modal focus loop. Distance controls retain host-only server-validated mutations.

Validation uses the local preview with original monster assets, Japanese QA fonts, native WebSocket authentication and isolated temporary save/server files. Browser requests are restricted to loopback. No production requests are sent. Physical iPhone Safari is not available in this environment.

The new pure layout tests cover 5 viewport sizes × 2 camera modes × 2 oval distances × 101 progress points × 3 spread values = 6,060 layouts, each with 8 portraits. The second test checks deterministic output and input immutability. Browser viewport checks include both portrait and landscape; final visual inspection caught and corrected camera controls overlapping the rank strip. Final layout checks explicitly guard that boundary.

Build459 simulation, wallet, coordinator, ticket, training, course rules and server entry point remain byte-identical; the cumulative package verifies these against its baseline along with frozen runtimes. No save-schema change.
