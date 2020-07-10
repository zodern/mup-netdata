var joi = require('joi');

var schema = joi.object().keys({
  servers: joi.object().keys().pattern(/.*/, {
    master: joi.bool()
  }),
  slack: joi.object().keys({
    webhookUrl: joi.string(),
    recipient: joi.string()
  }),
  apiKey: joi.string().required(),
  updateEvery: joi.number(),
  dbEngineDiskSpace: joi.number()
});

module.exports = function(config, utils) {
  var details = [];

  var validationErrors = joi.validate(config.netdata, schema, utils.VALIDATE_OPTIONS);
  details = utils.combineErrorDetails(details, validationErrors);

  details = utils.combineErrorDetails(
    details,
    utils.serversExist(config.servers, config.netdata.servers)
  );

  const masters = Object.values(config.netdata.servers).filter(server => server.master);
  if (masters.length !== 1) {
    details.push({
      message: 'There must be exactly one netdata master',
      path: 'servers.master'
    });
  }

  return utils.addLocation(details, 'netdata');
};
