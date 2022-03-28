## 0.4.2 March 28, 2022

- Fix for new netdata install location
- Restart netdata after updating python config instead of before

## 0.4.1 August 27, 2020

- Switch to using Netdata's new `dbengine multihost disk space` option

## 0.4.0 July 9, 2020

- Add option to disable alarms for specific servers
- Add updateEvery option
- Add dbEngineDiskSpace option

## 0.3.1 May 12, 2020

- Fix slack alerts

## 0.3.0 April 30, 2020

- Fix documentation for apiKey
- Add `mup netdata generate-api-key` command
- Disable all python collectors since on many servers they use a large amount of CPU

## 0.2.0 April 29, 2020

- Fix error when setting up
- Add `mup netdata error-logs` command
- Setup servers in parallel

## 0.1.0 April 23, 2020

- Initial version
