const { DateTime } = require("luxon");
const path = require('path');
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {
  const isProd = process.env.NODE_ENV === "production";
  const baseUrl = isProd ? '/blog' : '/';  // Set baseUrl based on environment

  // Define a currentYear shortcode
  eleventyConfig.addShortcode("currentYear", () => new Date().getFullYear());

  // Define the assetUrl filter
  eleventyConfig.addFilter("assetUrl", (url) => {
    // Ensure the path starts with a single slash but doesn't have double slashes
    return isProd ? `${baseUrl}${url.startsWith('/') ? url : '/' + url}` : url;
  });

  // Markdown configuration with markdown-it and markdown-it-attrs
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs);

  // Custom rule for audio elements
  markdownLibrary.renderer.rules.audio = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');

    if (srcIndex !== -1) {
      const src = token.attrs[srcIndex][1];
      const newSrc = isProd ? `${baseUrl}${src}` : src;
      token.attrs[srcIndex][1] = newSrc;  // Update the src attribute
    }

    return self.renderToken(tokens, idx, options);  // Render the updated audio tag
  };

  // Set the Markdown library
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Passthrough file copy for assets
  eleventyConfig.addPassthroughCopy("src/assets");
  console.log("Assets passthrough copy configured");

  // Define a paired markdown shortcode
  eleventyConfig.addPairedShortcode("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  // Add useful filters
  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));
  eleventyConfig.addFilter("date", (date, format) => DateTime.fromJSDate(date).toFormat(format));
  eleventyConfig.addFilter("truncate", (text, length) => text.length <= length ? text : text.slice(0, length) + "...");
  eleventyConfig.addFilter("markdown", (content) => markdownLibrary.render(content));

  // Collections
  eleventyConfig.addCollection("post", (collectionApi) => collectionApi.getFilteredByGlob("src/blog/*.md"));
  eleventyConfig.addCollection("englishPosts", (collectionApi) => collectionApi.getFilteredByGlob("src/english/*.md"));

  // Debug information
  console.log("Assets source:", path.resolve("src/assets"));
  console.log("Assets destination:", path.resolve("public/assets"));
  console.log("Current working directory:", process.cwd());
  console.log("Input directory:", path.resolve("src"));
  console.log("Assets directory:", path.resolve("src/assets"));
  console.log("Output directory:", path.resolve("public"));

  return {
    pathPrefix: baseUrl,  // Let Eleventy handle the path prefix
    dir: {
      input: "src",
      output: "docs",  // Output to the 'docs' folder
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
