# Working rules for Claude

This site is deployed on Vercel from the `main` branch. Every push to `main` goes live.
The owner sometimes edits in Cursor too, so always sync before and after working.

## Every task
1. **Sync first:** `git fetch origin main && git pull --rebase origin main` before making any change.
2. Make the requested changes. Run `npm run build` to make sure it compiles before committing.
3. **Sync again before pushing:** `git pull --rebase origin main`.
   - If there is a merge conflict, STOP. Do not force-push or discard either side. Explain the conflict to the owner and ask how to resolve it.
4. Commit with a clear message and `git push origin main`. Never use `--force`.
5. Tell the owner the push is done and that Vercel will deploy it in a minute or two.
