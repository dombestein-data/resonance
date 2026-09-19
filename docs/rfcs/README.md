# Resonance RFCs

This directory contains Requests for Comments (RFCs) describing significant
architectural decisions, public contracts, and proposed changes to Resonance.

RFCs are intended for changes where documenting the reasoning is useful beyond
the implementation itself. They provide a historical record of why important
parts of Resonance work the way they do.

## When to write an RFC

An RFC should generally be considered when a change:

- introduces or significantly changes a public API or provider contract;
- affects multiple parts of the Resonance architecture;
- establishes a convention future implementations are expected to follow;
- introduces a decision that would be difficult or disruptive to reverse; or
- benefits from preserving the reasoning and alternatives considered.

Small implementation details, bug fixes, and changes local to a single
component generally do not require an RFC.

## Status

RFCs may have one of the following statuses:

- **Draft** — Proposed and open for discussion.
- **Accepted** — Approved as part of the Resonance architecture.
- **Implemented** — Accepted and implemented in Resonance.
- **Rejected** — Considered but not adopted.
- **Superseded** — Replaced by another RFC.
- **Withdrawn** — Withdrawn by its author before acceptance.

An accepted RFC describes the intended architecture at the time it was
accepted. Later changes should normally be recorded through a new RFC rather
than rewriting the historical reasoning of the original.

## Numbering

RFCs use sequential three-digit identifiers:

    001-provider-identity.md
    002-playback-coordination.md
    003-provider-sdk.md

The identifier is permanent once assigned.

Some specifications may belong to a separately designated standards track and
therefore use a different identifier namespace.

## RFC structure

RFCs should generally contain:

- **Summary** — What is being proposed or specified.
- **Motivation** — Why the change is needed.
- **Design** — The proposed architecture or behaviour.
- **Alternatives** — Other approaches considered, where relevant.
- **Compatibility** — Effects on existing APIs, providers, or stored data.
- **Implementation** — Relevant implementation considerations.
- **Unresolved questions** — Decisions that remain open.

Not every RFC needs every section. The structure should serve the decision,
rather than becoming bureaucracy for its own sake.

## RFC index

| RFC | Title | Status |
| --- | --- | --- |
| HN-001 | Human Nature Compliance | Accepted |

## Contributing

RFCs should be discussed before being marked as Accepted. Once accepted, the
document should generally be treated as a historical record of the decision.

If an accepted design needs to change substantially, prefer a new RFC that
supersedes the previous one.

---

For requirements concerning Human Nature compliance, see HN-001.

Further context is unavailable.