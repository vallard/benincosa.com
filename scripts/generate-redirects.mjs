import { readFile, writeFile } from "node:fs/promises";

const posts = JSON.parse(
  await readFile(new URL("../content/posts.json", import.meta.url), "utf8"),
);

const lines = [
  "# Generated from content/posts.json. Include this map in nginx's http context.",
  "map $arg_p $benincosa_legacy_redirect {",
  '    default "";',
  ...posts.map(
    (post) => `    "${post.id}" "/notes/${post.slug}/";`,
  ),
  "}",
  "",
  "# In the benincosa.com server block:",
  "# if ($benincosa_legacy_redirect != \"\") {",
  "#     return 301 $benincosa_legacy_redirect;",
  "# }",
  "",
];

await writeFile(
  new URL("../redirects/nginx-post-ids.map", import.meta.url),
  lines.join("\n"),
);

console.log(`Generated ${posts.length} legacy post redirects.`);
