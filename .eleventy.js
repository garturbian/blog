module.exports = function(eleventyConfig) {
  const isProd = process.env.NODE_ENV === "production";
  const baseUrl = isProd ? '/blog' : '/';

  // Define a currentYear shortcode
  eleventyConfig.addShortcode("currentYear", () => new Date().getFullYear());

  // Markdown configuration
  const markdownIt = require("markdown-it");
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
  
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Asset URL filter
  eleventyConfig.addFilter("assetUrl", (url) => {
    if (typeof url !== 'string') {
      console.warn(`assetUrl filter received non-string url: ${url}`);
      return ''; // or return a default URL
    }
    return isProd ? `${baseUrl}${url.startsWith('/') ? url : '/' + url}` : url;
  });

  // Passthrough file copy for assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // Collections for english and blog posts
  eleventyConfig.addCollection("englishPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/english/*.md");
  });

  eleventyConfig.addCollection("post", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md");
  });

  return {
    pathPrefix: baseUrl,
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
