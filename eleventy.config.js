module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");

    eleventyConfig.addWatchTarget("src/layouts");

    return {
        dir: {
            input: "src",
            includes: "layouts",
            output: "dist"
        }
    };
};
