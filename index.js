var commandHandlers = require('./command-handlers');
var validate = require('./validate');

module.exports = {
  name: 'netdata',
  description: 'Setup and manage netdata',
  commands: {
    setup: {
      description: 'Sets up netdata',
      handler: commandHandlers.setup
    },
  },
  validate: {
    netdata: validate
  },
  hooks: {
    'post.setup': function(api) {
      if (!api.getConfig().netdata) {
        return;
      }

      return api.runCommand('netdata.setup');
    }
  }
};
