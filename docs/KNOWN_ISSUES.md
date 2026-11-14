# Known Issues

## Arctic sea-ice and vegetation datasets are not bundled

- **Arctic sea ice:** the required NSIDC Sea Ice Index source is not available from this environment. Requests to the official NSIDC pages timed out from both the web reader and direct command-line access. The actual downloadable source file and its usage terms could not be verified, so no sea-ice values were fabricated or bundled.
- **Vegetation NDVI:** the NASA Earthdata catalog verifies MODIS/Terra MOD13C2.061 as monthly global NDVI from February 2000 onward, and NASA ESDIS open-data guidance provides its use/citation terms. CMR lists its HDF granule under `lp-prod-protected`; OPeNDAP redirects to Earthdata login. This environment has no Earthdata credentials or HDF processing runtime, so no regional NDVI series was downloaded.
- **Impact:** only global temperature currently has real bundled data. Arctic sea ice and vegetation must remain unavailable until their source data can be accessed and processed. Do not represent repeated temperature data, image-derived estimates, or generated values as those scenes.
- **Human follow-up:** verify NSIDC access and terms, and provide NASA Earthdata-authorized access plus an HDF4-capable extraction tool if a regional MODIS NDVI bundle is still required.
- **Acceptance impact:** the three-scene acceptance criterion is not met. The 90-second demo document starts with silence, but cannot move into the Arctic scene; it transparently explains the block and demonstrates the available temperature scene instead.
