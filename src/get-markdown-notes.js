const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const generateSlug = require("./generate-slug");

function toRegExp(value) {
  if (typeof value === "string") {
    return new RegExp(`^${value}$`);
  }
  return value;
}

const matches = (filename) => (regExp) => regExp.test(filename);
const doesNotMatchAny = (regExps) => (filename) =>
  !regExps.some(matches(filename));

module.exports = (pluginOptions) => {
  let notesDirectory = pluginOptions.notesDirectory || "content/brain/";
  let notesFileExtensions = pluginOptions.notesFileExtensions || [
    ".md",
    ".mdx",
  ];
  let exclusions =
    (pluginOptions.exclude && pluginOptions.exclude.map(toRegExp)) || [];

  let filenames = fs.readdirSync(notesDirectory);

  return filenames
    .filter((filename) => {
      return notesFileExtensions.includes(path.extname(filename).toLowerCase());
    })
    .filter(doesNotMatchAny(exclusions))
    .map((filename) => {
      let fullPath = notesDirectory + filename;

      let rawFile = fs.readFileSync(fullPath, "utf-8");

      let frontmatter = matter(rawFile).data;

      // Because I would like to use numbers in filename to indicate the sequence of notes.
      const slugStr = frontmatter.title || filename;

      let slug = pluginOptions.generateSlug
        ? pluginOptions.generateSlug(slugStr)
        : generateSlug(path.parse(filename).name);

      return {
        filename: filename,
        fullPath: fullPath,
        slug: slug,
        rawFile: rawFile,
      };
    });
};
