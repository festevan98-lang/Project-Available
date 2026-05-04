# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository is currently a blank slate. The only tracked file besides `CLAUDE.md` is `README.md`, which contains a single heading (`# Project-Available`). There is no source code, no build system, no test suite, no language toolchain, and no CI configuration committed yet.

As a result, there are no build, lint, test, or run commands to document at this time, and there is no architecture to summarize.

## What to do when the project takes shape

When real code is added, update this file to capture what a future Claude Code instance would otherwise have to reverse-engineer:

- **Commands**: how to install dependencies, build, run the app locally, run the full test suite, and run a single test. Include only commands that actually exist in the repo (e.g. defined in `package.json`, `Makefile`, `pyproject.toml`, etc.).
- **Architecture**: the cross-file structure that isn't obvious from any single file — entry points, module boundaries, how data flows between layers, and any non-standard conventions the codebase relies on.
- **Conventions**: project-specific rules that contradict defaults or aren't discoverable from a quick read (custom lint rules, required commit format, branch naming, code generation steps that must be re-run).

Pull anything important from a populated `README.md`, `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` into this file when those appear.

## Branching

Active development branch for Claude-authored work: `claude/add-claude-documentation-1w57r`. Push changes to this branch unless told otherwise.
