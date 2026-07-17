# Kaolin — Build Loop Queue

The `kaolin-build-loop` skill builds the **top unchecked** `- [ ]` task below.

**Safety rules the loop always follows:**
- Works on a branch `hermes/<slug>` cut from the current branch — never `main`/`design/botanical` directly.
- Commits locally only. **Never pushes, never deploys.** You review the branch and merge yourself.
- Marks a built task `- [x]` so it won't run twice.

## Queue

<!-- Add one task per line below. The loop builds the topmost unchecked one. Examples: -->
<!-- - [ ] Add a "Contact" section to the About page with an email link -->
<!-- - [ ] Extract the footer into a reusable component -->
<!-- - [ ] Add alt text to all images in the gallery -->
