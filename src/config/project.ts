const creatorCredit = import.meta.env.PUBLIC_CREATOR_CREDIT?.trim();
const repositoryUrl = (
  import.meta.env.PUBLIC_REPOSITORY_URL?.trim() ||
  "https://github.com/elkaioum/GraphRoots"
).replace(/\/+$/, "");
const correctionsUrl =
  import.meta.env.PUBLIC_CORRECTIONS_URL?.trim() ||
  `${repositoryUrl}/issues/new?template=corpus-correction.yml`;

export const projectMetadata = {
  name: "GraphRoots",
  descriptor: "A public map of Blues roots and branches",
  attribution: "An independent public research and visualization project.",
  legalName: "Elkaïoum M. Moutuou",
  copyrightYear: 2026,
  creatorCredit: creatorCredit || undefined,
  repositoryUrl,
  correctionsUrl,
} as const;
