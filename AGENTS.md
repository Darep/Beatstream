# Agent instructions

When the user says “run it”, “start it”, or equivalent, immediately run
`.agents/skills/verify-beatstream/scripts/beatstream.sh preview`. It builds the current checkout with `Dockerfile.hub`,
replaces the `beatstream-branch-preview` container, populates `beatstream-branch-music` with demo WAV tracks, mounts it
at `/music`, and publishes `0.0.0.0:8080` with restart policy `unless-stopped`. Do not ask questions or run
preflight/status checks. Report `http://ajktux:8080` and the default `admin` / `admin` login.

To verify a change in the running app, use the `verify-beatstream` skill (`.agents/skills/verify-beatstream/SKILL.md`),
which starts isolated instances and never touches the preview.

After changing code or build configuration, run `make format` and `make check` before reporting completion.

Use semantic commit messages matching the repository history: `type(scope): description`, with the scope omitted when
unnecessary.
