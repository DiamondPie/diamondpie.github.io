hexo.on("ready", () => {
  const { version } = require("../../package.json");
  hexo.log.info(`Blog theme version ${version} has loaded successfully
  ===================================================================`);
});
