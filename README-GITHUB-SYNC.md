# GitHub ↔ Vercel safe sync

This branch reconstructs the current production site from `site-text.tar.gz` during the Vercel build.

Existing artwork image files are temporarily served through rewrites from the immutable production deployment that preceded the Git migration. This avoids any loss or image recompression while the Git workflow is being verified.

Do not delete the referenced immutable Vercel deployment until the artwork assets have been migrated to a permanent Git/CDN source.

Branch: `agent/sync-production-source`.
