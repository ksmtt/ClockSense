import StyleDictionary from "style-dictionary";
import { watch } from "fs";
import { join } from "path";

// Register custom name transform for better CSS variable names
StyleDictionary.registerTransform({
  name: "name/cti/kebab-semantic",
  type: "name",
  transform: function (token) {
    const path = token.path.slice(1); // Remove 'global'

    if (path[0] === "basic-color-palette") {
      // Handle special naming cases to avoid collisions
      if (path[1] === "light-green") return "color-light-green";
      if (path[1] === "light-blue") return "color-light-blue";
      if (path[1] === "deep-orange") return "color-deep-orange";
      if (path[1] === "deep-purple") return "color-deep-purple";
      return `color-${path[1]}`;
    }
    if (path[0] === "blue-gray-color-palette") {
      return `${path[1]}`;
    }
    if (path[0] === "primary-color-palette") {
      return `${path[1]}`;
    }
    if (path[0] === "semantic-color-palette") {
      return `${path[1]}`;
    }
    if (path[0] === "text-color-palette") {
      return `text-${path[1]}`;
    }
    if (path[0] === "alert-color-palette-light-mode") {
      return `alert-light-${path[1]}`;
    }
    if (path[0] === "alert-color-palette-dark-mode") {
      return `alert-dark-${path[1]}`;
    }
    if (path[0] === "fontfamilies") {
      return `font-family-${path[1]}`;
    }
    if (path[0] === "lineheights") {
      return `line-height-${path[1]}`;
    }
    if (path[0] === "fontweights") {
      return `font-weight-${path[1]}`;
    }
    if (path[0] === "fontsize") {
      return `font-size-${path[1]}`;
    }
    if (path[0] === "letterspacing") {
      return `letter-spacing-${path[1]}`;
    }
    if (path[0] === "paragraphspacing") {
      return `paragraph-spacing-${path[1]}`;
    }

    return `${path.join("-")}`;
  },
});

const buildTokens = async () => {
  const sd = new StyleDictionary({
    source: ["src/tokens.json"],
    log: {
      verbosity: "verbose",
    },
    platforms: {
      css: {
        transforms: ["attribute/cti", "name/cti/kebab-semantic", "color/hex"],
        buildPath: "src/styles/",
        files: [
          {
            destination: "tokens.css",
            format: "css/variables",
            options: {
              outputReferences: false,
            },
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
  console.log("✅ Tokens built successfully!");
};

// Initial build
await buildTokens();

// Watch for changes if --watch flag is passed
if (process.argv.includes("--watch")) {
  console.log("👀 Watching for token changes...");

  const tokensPath = join(process.cwd(), "src/tokens.json");

  // Watch the main tokens file
  watch(tokensPath, async (eventType) => {
    if (eventType === "change") {
      console.log(`📝 Token file changed, rebuilding...`);
      try {
        await buildTokens();
      } catch (error) {
        console.error("❌ Error rebuilding tokens:", error.message);
      }
    }
  });
}
