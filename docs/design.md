# Resonance Design

## Status

This document describes Resonance's current design direction.

The interface is still exploratory. Layout dimensions, visual styling and individual interactions may change as the application develops and receives design feedback.

## Design Principles

### Structurally Complete Before Functionally Complete

Core application concepts should occupy their intended place from the beginning, even when their behavior is not implemented yet.

A control that is unavailable should be visibly disabled rather than omitted when its presence is fundamental to the application layout.

### Search Is a Global Action

Search belongs in the persistent top bar because users should be able to initiate it from anywhere. It is not modeled as a sidebar destination.
In the current UI foundation, submitting a global search displays its results in the Home content region.
Search remains an action rather than a sidebar destination. This presentation may evolve as the model develops.

### Playback Is Persistent

The player is part of the application shell, rather than an individual page.
Navigation and content changes must not displace it.

### Provider-Agnostic Interface

The interface consumes Resonance Core models and provider capabilities. It must not change behavior by checking for a specific provider identity.

### Desktop First

Resonance is currently designed as a desktop application. Window resizing should be handled intentionally, but mobile layout is not presently a design target.

### Personalization Without Component Coupling

Colors should be expressed through semantic design tokens rather than embedded throughout individual components. This leaves room for future built-in and user-created themes without requiring components to understand theme identities.

### Accessible by Default

Core application interactions should be operable by keyboard and expose clear semantics to assistive technologies. Visible focus states are part of the interface design rather than optional visual polish.

## Application Shell

The foundational shell consists of:

- A persistent top bar containing application identity and global Search.
- A sidebar containing Home, Library, and Settings.
- A scrollable main-content region.
- A persistent player containing track information, playback controls, progress, and volume.

## Session Restoration

Resonance should eventually restore useful local application state between launches where that state does not conflict with playback state reported by the active provider.
Provider-reported playback remains authoritative.

## Current Design Status

The current interface is a proof of concept used to validate application structure, component boundaries, and provider integration. It is not the final visual design.

```
┌──────────────────────────────────────────────────────────────┐
│ Resonance                                      [ Search... ] │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  Home        │                                               │
│              │                Main Content                   │
│  Library     │                                               │
│              │                                               │
│  Settings    │                                               │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ artwork │ track / artist │   ◀   ▶/❚❚   ▶   │ progress/vol │
└──────────────────────────────────────────────────────────────┘
```
