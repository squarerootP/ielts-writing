# IELTS Writing

My IELTS writing notebook, reconstructed from a Notion Markdown export. It contains **42 pages and 14 images**: writing practice, model answers, my attempts, grammar notes and vocabulary tables. Original wording is preserved, including mistakes and feedback.

**[Browse all notes](INDEX.md)** — the full hierarchy works directly on GitHub. The searchable reader is in `index.html`; download the repository and open that file, or view it through GitHub Pages. It works offline and requires no Notion account.

## Collections

See [the workspace index](INDEX.md) for Task 1 (bar charts, line graphs, maps, pie charts, processes and tables), Task 2 (cause–solution and opinion), Cambridge practice, sample essays and vocabulary.

## Share through GitHub Pages

After pushing this repository to GitHub, open **Settings → Pages**, and choose **GitHub Actions** as the publishing source. Run the **Publish study library** workflow from the Actions tab (or push another change to `main`). GitHub displays the published link in Settings → Pages. Share that link with friends.

The workflow follows [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Public repositories support Pages on GitHub Free; private repository support depends on the account plan. Publishing this reader makes the included study notes viewable at its website address.

## Edit the notes

Edit the Markdown files under `notes/`. The reader rebuilds automatically when changes are pushed. For a local rebuild, install Node.js 20 or newer, then run:

```sh
npm run build
npm run check
```

`workspace.json` records the page titles, original Notion page IDs and parent relationships. Add a new page there when adding a new Markdown file. Images belong in `assets/`.

The Markdown renderer (Marked 17.0.5) is included under `scripts/vendor/` with its MIT license, so building requires no package downloads.

## Reconstruction

- The ZIP was read directly, avoiding long-path extraction failures.
- Page filenames are short, stable and compatible with Windows. Original page hierarchy is kept in the index, navigation and manifest.
- Links between pages and all 14 local images were rewritten and verified.
- Tables, emphasis, prompts, model answers and attempts are preserved.
- An empty Untitled page is retained to avoid silently dropping exported pages.
- The other 9 workspace pages and the People database are preserved in a separate local backup. They are outside this study repository.

This is a reconstruction of the exported content. Notion editing features, permissions, revision history and comments absent from the export cannot be recovered. Study material retains its original source references; no new content license is assigned.
