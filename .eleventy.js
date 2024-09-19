const { DateTime } = require("luxon");
const path = require('path');
const markdownIt = require("markdown-it");

const helpers = {
  currentYear() {
    return new Date().getFullYear();
  }
};

module.exports = function(eleventyConfig) {
  // Markdown configuration
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
  
  // Passthrough file copy
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.setLibrary("md", markdownLibrary);
  
  // Add markdown shortcode
  eleventyConfig.addPairedShortcode("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  // Add limit filter
  eleventyConfig.addFilter("limit", function(arr, limit) {
    return arr.slice(0, limit);
  });

  // Add date filter
  eleventyConfig.addFilter("date", function(date, format) {
    return DateTime.fromJSDate(date).toFormat(format);
  });

  // Add Nunjucks global for helpers
  eleventyConfig.addNunjucksGlobal('helpers', helpers);

  // Collections
  eleventyConfig.addCollection("post", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md");
  });

  eleventyConfig.addCollection("englishPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/english/*.md");
  });

  // Debug: Log all collections
  eleventyConfig.on('eleventy.collections', collections => {
    console.log('All collections:', Object.keys(collections));
    console.log('Blog posts:', collections.post?.length);
    console.log('English posts:', collections.englishPosts?.length);
  });

  // Add truncate filter if not already present
  eleventyConfig.addFilter("truncate", function(text, length) {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  });

  // Add this line to process markdown within Nunjucks templates
  eleventyConfig.addFilter("markdown", (content) => markdownLibrary.render(content));

  console.log("Current working directory:", process.cwd());
  console.log("Input directory:", path.resolve("src"));
  console.log("Assets directory:", path.resolve("src/assets"));
  console.log("Image file exists:", require('fs').existsSync(path.resolve("src/assets/images/shadow-self.jpg")));

  return {
    pathPrefix: "/gart/", // Adjust for GitHub Pages subdirectory
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
