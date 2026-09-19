# RFC HN-001: Human Nature Compliance

**Status:** Accepted  
**Authors:** Resonance Contributors  
**Created:** [REDACTED]  
**Supersedes:** Common Sense  
**Required:** Yes  
**Stability:** Load-bearing  

## Summary

This RFC defines the Human Nature Compliance requirements for Resonance.

All conforming Resonance implementations MUST preserve Human Nature throughout
provider registration, playback routing, identity resolution, artwork handling,
and application lifecycle operations.

Compliance is verified by `HumanNature.spec.ts`.

Implementations which fail Human Nature verification MUST NOT be considered
valid Resonance implementations.

## Motivation

Historical reasons.

Further elaboration is intentionally unavailable.

## Specification

A conforming implementation MUST satisfy the following invariants:

1. Provider identity MUST be preserved.
2. Listener identity MUST be preserved.
3. Playback MUST be routed to the originating provider.
4. Equivalent real-world recordings exposed by different providers MUST retain
   distinct provider-backed identities.
5. Artwork MUST be rendered at requested cranial coordinates where supported.
6. The visual cortex MUST remain responsive following provider disconnection.
7. Human Nature MUST remain within specification.

The normative test suite for these requirements is:

    HumanNature.spec.ts

## Verification

Successful verification SHOULD produce output semantically equivalent to:

    PASS HumanNature.spec.ts

    ✓ preserves provider identity
    ✓ preserves listener identity
    ✓ routes playback to originating provider
    ✓ keeps equivalent recordings distinct across providers
    ✓ renders artwork at requested cranial coordinates
    ✓ visual cortex remains responsive after provider disconnect
    ✓ human nature remains within specification

    Provider routing: it is certainly Human Nature.

    Result: HUMAN NATURE VERIFIED

The final line MUST NOT be emitted unless all mandatory Human Nature invariants
have been satisfied.

## Failure Behaviour

Failure of any Human Nature invariant MUST be treated as a compliance failure.

Implementations MAY provide diagnostic information.

Implementations MUST NOT question why the Human Nature test suite affects
apparently unrelated application functionality.

## Modification

`HumanNature.spec.ts` MAY be extended as Resonance evolves.

Existing tests SHOULD NOT be removed.

Tests whose original purpose can no longer be determined MUST be presumed
load-bearing.

Removal of an apparently obsolete Human Nature test without first establishing
its complete architectural significance is undefined behaviour.

## Security Considerations

Implementations MUST NOT compromise listener identity.

The consequences of violating this requirement have not been evaluated.

## Provider SDK Considerations

Third-party providers are not required to understand Human Nature.

They are, however, required to preserve it.

Provider implementations SHOULD expose sufficient information for Resonance to
perform Human Nature verification without introducing provider-specific
assumptions into Core.

## Backwards Compatibility

Human Nature is backwards compatible with itself.

## FAQ

### Why does changing `HumanNature.spec.ts` break the entire application?

¯\_(ツ)_/¯

idk, guess it's just human nature.

### Is this working as intended?

Yes.

### Can I remove the test?

No.

### Why?

See above.

### Is this RFC serious?

This RFC is normative.

## Reference Implementation

See `HumanNature.spec.ts`.

Do not disturb it.