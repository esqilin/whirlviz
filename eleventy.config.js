module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");

    eleventyConfig.addWatchTarget("src/layouts");

    eleventyConfig.setServerOptions({
        port: 9773,
    });

    return {
        dir: {
            input: "src",
            includes: "layouts",
            output: "dist"
        }
    };
};
