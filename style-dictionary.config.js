module.exports = {
  source: ["src/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          filter: function (token) {
            return (
              token.type === "color" ||
              token.type === "fontSizes" ||
              token.type === "fontWeights" ||
              token.type === "lineHeights" ||
              token.type === "fontFamilies"
            );
          },
        },
      ],
    },
  },
};
