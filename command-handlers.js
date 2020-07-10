const uuid = require('uuid');

function addSharedSetupTasks (taskList, api) {
  taskList.executeScript('Restart Netdata', {
    script: api.resolvePath(__dirname, './assets/restart.sh')
  });

  taskList.copy('Copy python.d.conf', {
    src: api.resolvePath(__dirname, './assets/python.d.conf'),
    dest: '/etc/netdata/python.d.conf'
  });
}

function setupMaster(api, nodemiral, masterName) {
  let {
    netdata
  } = api.getConfig();

  const {
    webhookUrl: slackWebhookUrl,
    recipient: slackRecipient
  } = netdata.slack || {};

  var masterSession = api.getSessionsForServers([masterName])
    // When using the --servers option, some sessions can be undefined
    // TODO: this should be filtered by Mup
    .filter(session => session);

  var taskList = nodemiral.taskList('Setup Master Server');
  taskList.executeScript('install', {
    script: api.resolvePath(__dirname, './assets/install.sh')
  });

  taskList.copy('Copy Netdata Config', {
    src: api.resolvePath(__dirname, './assets/netdata-master.conf'),
    dest: '/etc/netdata/netdata.conf',
    vars: {
      updateEvery: netdata.updateEvery || 1,
      dbEngineDiskSpace: netdata.dbEngineDiskSpace || 512
    }
  });

  taskList.copy('Copy Stream Config', {
    src: api.resolvePath(__dirname, './assets/stream-master.conf'),
    dest: '/etc/netdata/stream.conf',
    vars: {
      apiKey: netdata.apiKey,
    }
  });

  taskList.copy('Copy Notify Config', {
    src: api.resolvePath(__dirname, './assets/health_alarm_notify.conf'),
    dest: '/etc/netdata/health_alarm_notify.conf',
    vars: {
      slackWebhookUrl,
      slackRecipient,
    }
  });

  addSharedSetupTasks(taskList, api);

  return api.runTaskList(taskList, masterSession, {
    series: false,
    verbose: api.getVerbose()
  });
}

function setupSlaves (api, nodemiral, masterName) {
  const {
    apiKey,
    servers: netdataServers,
    updateEvery
  } = api.getConfig().netdata;
  const servers = api.getConfig().servers;

  const slaveNames = Object.entries(netdataServers)
    .filter(([, { master }]) => {
      return !master;
    })
    .map(([name]) => name);

  var sessions = api.getSessionsForServers(slaveNames)
    // When using the --servers option, some sessions can be undefined
    // TODO: this should be filtered by Mup
    .filter(session => session);

  var taskList = nodemiral.taskList('Setup Netdata Servers');

  taskList.executeScript('install', {
    script: api.resolvePath(__dirname, './assets/install.sh')
  });

  taskList.copy('Copy Netdata Config', {
    src: api.resolvePath(__dirname, './assets/netdata-slave.conf'),
    dest: '/etc/netdata/netdata.conf',
    vars: {
      updateEvery: updateEvery || 1
    }
  });

  taskList.copy('Copy Stream Config', {
    src: api.resolvePath(__dirname, './assets/stream-slave.conf'),
    dest: '/etc/netdata/stream.conf',
    vars: {
      apiKey,
      // TODO: should prefer the private IP address
      masterHost: servers[masterName].host
    }
  });

  addSharedSetupTasks(taskList, api);

  return api.runTaskList(taskList, sessions, {
    series: false,
    verbose: api.getVerbose()
  });
}


module.exports = {
  generateApiKey () {
    console.log(uuid.v4());
  },
  async setup (api, nodemiral) {
    const netdataConfig = api.getConfig().netdata;
    if (!netdataConfig) {
      console.log(
        'Not setting up netdata since there is no config'
      );
      return;
    }

    var masterName = Object.entries(netdataConfig.servers).filter(([, { master }]) => {
      return master;
    }).map(entry => entry[0]);

    await setupMaster(api, nodemiral, masterName);
    await setupSlaves(api, nodemiral, masterName);
  },
  async errorLogs (api) {
    const servers = api.getConfig().netdata.servers;
    const serverNames = Object.keys(servers);

    for (let i = 0; i < serverNames.length; i++) {
      const [ session ] = api.getSessionsForServers([serverNames[i]]);
      if (!session) {
        // server was excluded by --servers option
        continue;
      }

      console.log(`--------- Logs for ${serverNames[i]} ---------`);
      const result = await api.runSSHCommand(session, 'tail /var/log/netdata/error.log -n 100');
      console.log(result.output);
    }
  }
};
