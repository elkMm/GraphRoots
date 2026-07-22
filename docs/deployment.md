# GitHub Pages Deployment

GraphRoots is a fully static Astro application. The repository workflow validates and deploys the generated `dist/` directory without a server, database, CMS, or authentication layer.

## First publication

1. Create or select the GitHub repository `elkMm/GraphRoots`.
2. Push this project to the `main` branch, including `pnpm-lock.yaml`.
3. In the repository, open **Settings → Pages**.
4. Set **Source** to **GitHub Actions**.
5. Open **Actions → Verify and deploy GitHub Pages** and run the workflow, or push a commit to `main`.

The expected project-site URL is `https://elkMm.github.io/GraphRoots/`. GitHub creates the `github-pages` deployment environment when the workflow first deploys.

## Workflow behavior

- Pull requests run formatting checks, linting, type checks, corpus validation, unit tests, Playwright tests, the production build, and built-site validation.
- Pushes to `main` run the same gate, upload `dist/` as a Pages artifact, and deploy it with the `github-pages` environment.
- Manual runs are available through `workflow_dispatch`.
- The deploy job receives only `pages: write` and `id-token: write`; the build job has read-only repository access.

## Base-path handling

GitHub project sites are served below the repository name. During GitHub Actions builds, `astro.config.mjs` derives:

- `site` from the owner segment of `GITHUB_REPOSITORY`;
- `base` from the repository name;
- `/` as the base for special `<owner>.github.io` repositories.

`PUBLIC_BASE_PATH` overrides the derived base. `SITE_URL` overrides the derived production origin and defaults the base to `/`, which is appropriate for a custom domain.

To simulate the GitHub project build locally:

```sh
GITHUB_REPOSITORY=elkMm/GraphRoots \
GITHUB_REPOSITORY_OWNER=elkMm \
pnpm run build
```

To run browser tests through the same subpath:

```sh
PUBLIC_BASE_PATH=/GraphRoots PLAYWRIGHT_PORT=4343 pnpm run test:e2e
```

## Custom domain

1. Configure the custom domain in **Settings → Pages** and with the DNS provider.
2. Add `public/CNAME` containing only the custom hostname.
3. Add a repository Actions variable named `SITE_URL`, such as `https://music.example.org`.
4. Set `PUBLIC_BASE_PATH` to `/` only if a repository-level variable already supplies a different base.

GitHub's Pages settings remain authoritative for the custom domain; adding `CNAME` alone does not configure DNS or the repository setting.

## References

- [Astro GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
