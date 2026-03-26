# Trackline

A browser-based tool for authoring and playing branching text games built with plain HTML, CSS, and JavaScript.

## Features

- Shared single-file game format for both play mode and create mode
- Ordered chapters, message nodes, rule-bearing options, integers, integer groups, enums, profiles, and string variables
- Unified variable-check and set-variable builders for paragraphs and options
- Profile variables with state-level set-variable mappings
- Dynamic text interpolation with `{{Variable Name}}` tokens in authored text
- Three-pane play interface with transcript, notes, integer/enum display, save export/import, and validation-aware startup
- Graph-based editor with draggable message nodes, connection lines, inline editing, and system tabs
- Draft persistence in browser `localStorage`
- Downloadable game files and save files
- No build step required

## Run locally

Open [index.html](./index.html) in a browser.

For a local web server, you can also run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
