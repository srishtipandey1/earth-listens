# How the data becomes sound

Each scene declares an observed value range, a calm reference, and the largest observed year-to-year change. Values are clamped and linearly normalized to 0-1. Temperature uses GISTEMP's published 0 °C anomaly baseline relative to 1951-1980. Arctic sea ice uses the mean of this dataset's September extent values for 1981-2010: 6.413333 million square kilometers.

The normalized value moves a melody through three octaves of a five-note pentatonic scale (C, D, E, G, A). That melody stays ordered. For temperature, distance from the baseline raises tension from 0 to 1. For Arctic sea ice, the baseline and all larger extents have zero tension; as extent falls below the baseline, tension rises linearly to 1 at the dataset minimum. The audio engine uses tension to increase detuning and filter brightness, adding unease when ice is unusually low without changing the melody's pitch order.

The absolute change from the previous observation is divided by the largest annual change in the series. That rate sets 1-8 note pulses per step and scales a soft noise layer from silence to a gain of 0.18. The first observation has no previous-year change, so it starts with one pulse and no noise.

The Arctic series contains 48 consecutive September observations from 1979 to 2026. The NSIDC Version 4 user guide states that the monthly `source_dataset` field identifies the input product: NSIDC-0051 through 2024, then AMSR2/NSIDC-0803 from 2025. The guide says this change was driven by expected loss of SSMIS access and observed degradation of SSMIS data; pre-2025 Version 4 values are copies of Version 3. See the [official Version 4 user guide](https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf).

All mapping functions are deterministic and have unit tests for bounds, monotonic behavior, quiet baseline behavior, and change-driven rhythm/texture. The tests also check that the real 2012 Arctic extent is tenser than 1979. Audio playback is started only by an explicit user gesture.
