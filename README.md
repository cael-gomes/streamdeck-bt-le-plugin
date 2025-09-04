# Stream Deck Bluetooth LE Controller

Control Bluetooth Low Energy (BLE) devices from your Elgato Stream Deck. This plugin lets you scan for devices, discover services/characteristics, and send custom commands (hex/text/bytes) to a selected characteristic when you press the key.

- Action: BT Control (`com.cael-gomes.bt-controller.control`)
- Plugin UUID: `com.cael-gomes.bt-controller`
- Repo: https://github.com/cael-gomes/streamdeck-bt-le-plugin

## Requirements

- Node.js 20+
- Stream Deck app 6.5+ (macOS 12+ or Windows 10+)
- Bluetooth hardware enabled and permitted by the OS

## Quick start

```bash
# Install dependencies
npm ci

# Build the plugin (outputs to com.cael-gomes.bt-controller.sdPlugin/bin)
npm run build

# Optional: rapid dev loop with auto-restart (requires Elgato CLI in PATH)
npm run watch

# Debug the Node process with Chrome DevTools (pauses on first line)
npm run start:debug
```

If you use watch mode, the build will auto-run on file changes and attempt to restart the plugin via the Elgato CLI (`streamdeck restart com.cael-gomes.bt-controller`).

## Installing the plugin for development

The repository already contains a `.sdPlugin` folder (`com.cael-gomes.bt-controller.sdPlugin`) with a `manifest.json`. After building, the plugin entrypoint is `bin/plugin.js` inside that folder.

- Enable Developer Mode in Stream Deck (Preferences → Plugins → Developer Mode)
- Build the plugin: `npm run build`
- Restart the plugin (e.g., via Elgato CLI) or restart Stream Deck to pick up changes

> Tip: The build copies `node_modules` into the plugin folder so the runtime can resolve dependencies.

## Using the BT Control action

1. Add the "BT Control" action to a key.
2. Open the Property Inspector:
   - Click "Scan Devices" to discover nearby BLE devices, then select one.
   - Click "Get Services" to list services and characteristics for the selected device.
   - Choose a service and characteristic.
   - Configure a command:
     - Type: write/read/notify
     - Format: hex, text, or bytes
     - Data: the payload (e.g., `01 0A FF`, `Hello`, or `[1,10,255]`)
     - Without response: optional for write commands
3. Press the key to send the configured command. The key title updates and success/failure is shown on the device.

## Scripts

- `npm run build`: Bundle plugin to `com.cael-gomes.bt-controller.sdPlugin/bin/plugin.js`
- `npm run watch`: Rebuild on change and attempt `streamdeck restart com.cael-gomes.bt-controller`
- `npm run start:debug`: Launch the plugin with `--inspect-brk=9229` for step debugging
- `npm run clean`: Remove plugin `bin/` and `node_modules/` mirror
- `npm run rebuild`: Clean and build

## Debugging

See detailed guidance in [DEBUGGING.md](./DEBUGGING.md). Highlights:

- Logs: TRACE-level logging is enabled; check `logs/current.log` or the `.sdPlugin/logs` folder.
- Chrome DevTools: visit `chrome://inspect` and attach to port 9229 when using `start:debug`.
- Property Inspector: open DevTools for the Property Inspector to inspect UI events.

## Project structure

```
com.cael-gomes.bt-controller.sdPlugin/
  manifest.json
  bin/plugin.js              # build output
  imgs/                      # icons and category assets
  ui/bt-controller.html      # Property Inspector UI
src/
  actions/bt-controller.ts   # Stream Deck action logic
  services/                  # BLE command execution and device management
  plugin.ts                  # Plugin bootstrap and action registration
rollup.config.mjs            # Build configuration
```

## Technology

- @elgato/streamdeck — Stream Deck SDK (Node)
- @stoprocent/noble — BLE interactions
- Rollup + TypeScript

## Troubleshooting

- Ensure Bluetooth is enabled and OS permissions are granted
- Verify the Stream Deck version (6.5+) and Node.js (20+)
- Check that the selected device/service/characteristic and command are correct
- Review logs in `logs/` and `.sdPlugin/logs/`
- More tips: [DEBUGGING.md](./DEBUGGING.md)

## License

TBD
