# How the data becomes sound

Each scene declares a value range, historical baseline, and largest observed year-to-year change. Values are clamped and linearly normalized to 0-1. Temperature's baseline is a 0 °C anomaly relative to GISTEMP's published 1951-1980 reference period.

The normalized value moves a melody through three octaves of a five-note pentatonic scale (C, D, E, G, A). That melody stays consonant. Distance from the scene's baseline raises a tension control from 0 to 1; the audio engine uses it to increase detuning and filter brightness, creating a more chromatic edge without changing the melody's pitch order.

The absolute change from the previous observation is divided by the largest annual change in the series. That rate sets 1-8 note pulses per step and scales a soft noise layer from silence to a gain of 0.18. The first observation has no previous-year change, so it starts with one pulse and no noise.

All mapping functions are deterministic and have unit tests for bounds, monotonic pitch, quiet baseline behavior, and change-driven rhythm/texture. Audio playback is started only by an explicit user gesture.
