# mup-netdata

Plugin for Meteor Up to setup [Netdata](https://www.netdata.cloud/).

This is a very early version of the plugin and is missing some basic features.

## Use

Install with `npm i -g mup-netdata`.
Then, add `mup-netdata` to the `plugins` array in your mup config, and add a `netdata` object.

```js
module.exports = {
  // rest of config

  plugins: ['netdata'],
  netdata: {
    servers: {
      one: {},
      two: {},
      netdataMaster: {
        // One server must be a master. All other servers send their metrics
        // to this one.
        master: true
      }
    },
    // Key used for authentication with the master instance.
    // Can be set to any string value.
    apiKey: 'set-to-a-long-random-string',

    slack: {
      // Create an incoming webhook using the "Incoming Webhooks" App: https://slack.com/apps/A0F7XDUAZ-incoming-webhooks
      webhookUrl: 'https://hooks.slack.com/services/example/example',
      // Set to where the slack messages are sent:
      // - '#channel'
      // - '@user'
      recipient: '#system-status'
    }
  }
}
```

This plugin only supports the configuration where there is a single master that stores the metrics, and all other instances are headless collectors that send the metrics to the master. If you need a different configuration, please create an issue or submit a pull request.

Next, run

```bash
mup setup
```

After it is setup, you can visit port `19999` on the server that is the master instance.

This plugin currently does not setup any authentication or access control. Netdata does not allow modifying data, but it does show information that could be helpful to a hacker. More information is available in the Netdata [docs](https://learn.netdata.cloud/docs/agent/netdata-security/#netdata-viewers-authentication). The master netdata instance must be accessible to the other instances, but you can use a firewall or reverse proxy to block access from the internet.
