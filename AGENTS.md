# Agent instructions

When the user says “run it”, “start it”, or equivalent, immediately build the current checkout with
`Dockerfile.hub`, replace the `beatstream-branch-preview` container, populate `beatstream-branch-music` with demo WAV
tracks, mount it at `/music`, and publish `0.0.0.0:8080` with restart policy `unless-stopped`. Do not ask questions or
run preflight/status checks. Report `http://ajktux:8080` and the default `admin` / `admin` login.

After changing code or build configuration, run `make format` and `make check` before reporting completion.
