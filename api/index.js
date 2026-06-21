const appPromise = import("../artifacts/api-server/dist/app.mjs");

module.exports = async (req, res) => {
  const appModule = await appPromise;
  const app = appModule.default || appModule;
  return app(req, res);
};
