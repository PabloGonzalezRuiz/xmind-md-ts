# GitHub Release preflight — AUD-010

## Purpose and security boundary

The workflow `.github/workflows/aud-010-release-preflight.yml` prepares and verifies a downloadable release candidate. It deliberately does **not** create a GitHub Release, create or move a tag, publish to npm, or write to repository contents.

It is a preparation/preflight workflow, not the final publishing workflow. A separate publishing workflow and a separate explicit authorization decision are required before any public release.

## Trigger and modes

- Push on `feature/aud-003-runtime-schema` when this workflow or its tracking documentation changes: automatic dry-run.
- Manual `workflow_dispatch` without `release_tag`: dry-run on `feature/aud-003-runtime-schema`.
- Manual `workflow_dispatch` with `release_tag`: validation-only tag mode, allowed only when the workflow is run from `main`; the supplied tag must be exactly `v<package.json version>` and resolve to the exact checked-out commit.
- No tag is created by either mode. The tag mode only fetches and reads an existing tag.

The package version and CLI version are checked using `npm run check:version`. The current IR contract is recorded as `1.0.0`, independently of the package version.

## Validation and artifact contents

The workflow runs on Ubuntu with Node.js 24 and:

1. Checks that the checkout is clean and that package/CLI versions agree.
2. Installs the lockfile with `npm ci`.
3. Runs the full `npm run verify` pipeline (format, version, lint, generated types, typecheck, tests, build, examples and package-install verification).
4. Builds the exact npm tarball with `npm pack`.
5. Installs that tarball into a new temporary directory and tests the installed CLI with `--help`, `--version` and validation of `examples/quick-start.md`.
6. Calculates a SHA-256 checksum and emits a build manifest containing package version, IR contract, source commit and workflow run.
7. Uploads the tarball, checksum, manifest and draft changelog as a temporary GitHub Actions artifact with 30-day retention.

The artifact is evidence for inspection and distribution testing. It is not a permanent GitHub Release asset.

## Permissions and credentials

- Workflow/job permissions are restricted to `contents: read`.
- Checkout uses `persist-credentials: false`; the workflow does not retain a write-capable Git credential.
- No repository secrets, npm token, environment approval, `id-token: write`, or release-writing permission is required.
- `actions/checkout@v5`, `actions/setup-node@v6` and `actions/upload-artifact@v4` follow the repository's existing action-major convention. Before enabling a public publishing job, pin every third-party action to a reviewed full commit SHA and automate update review.

## Deliberately deferred

The following are not implemented or authorized by this workflow:

- Creating, editing or publishing a GitHub Release.
- Creating tags.
- Publishing to npm or configuring npm provenance.
- Granting `contents: write`, `packages: write` or `id-token: write`.
- Merging the feature branch into `main`.

A future publisher must be a separate job/workflow, gated on a reviewed tag and successful CI for the exact tag SHA, with least-privilege write permission scoped only to that publishing job, protected environment approval, immutable action pinning, and a documented recovery procedure. npm remains out of scope while `package.json` has `private: true`.

## Current project constraints

- Package: `xmind-md-ts@0.1.0`.
- IR contract: exactly `1.0.0`; package and IR versions are independent.
- Runtime: Node.js 24 or later.
- Distribution channel selected: GitHub Releases.
- npm publication: deferred.
- Public release: not authorized.
