# Debugging the BT LE Controller Stream Deck Plugin

This guide covers multiple methods to debug your Stream Deck plugin during development.

## Prerequisites

- Node.js v20 or higher
- Stream Deck application installed
- VS Code (recommended) or any Node.js debugger

## Method 1: Console Logging

The plugin is already configured with extensive logging:

1. **View logs in real-time:**
   ```bash
   # Monitor the latest log file
   tail -f com.cael-gomes.bt-controller.sdPlugin/logs/com.cael-gomes.bt-controller.*.log
   
   # Or monitor the current log
   tail -f logs/current.log
   ```

2. **Log levels:** The plugin uses TRACE level logging (see `src/plugin.ts`), which captures all messages between Stream Deck and the plugin.

3. **Add custom logs:** The code already includes console.log statements. Add more as needed:
   ```typescript
   console.log("[BT-CONTROLLER] Your debug message here", variableToInspect);
   ```

## Method 2: Node.js Inspector (Chrome DevTools)

1. **Build the plugin first:**
   ```bash
   npm run build
   ```

2. **Start the plugin with debugging:**
   ```bash
   npm run start:debug
   ```
   This will start the plugin with `--inspect-brk=9229` flag and pause at the first line.

3. **Connect Chrome DevTools:**
   - Open Chrome and navigate to `chrome://inspect`
   - Click "Configure" and ensure `localhost:9229` is listed
   - Click "inspect" under the Remote Target that appears

4. **Debug your code:**
   - Set breakpoints in the Chrome DevTools Sources tab
   - Step through code, inspect variables, and use the console

## Method 3: VS Code Debugging

Create a `.vscode/launch.json` file (see next section) to debug directly in VS Code:

1. Set breakpoints in your TypeScript files
2. Press F5 or go to Run > Start Debugging
3. VS Code will compile and attach to the plugin process

## Method 4: Watch Mode with Auto-Restart

For rapid development without full debugging:

```bash
npm run watch
```

This will:
- Watch for file changes
- Rebuild automatically
- Restart the Stream Deck plugin

## Method 5: Stream Deck Developer Mode

1. **Enable Developer Mode in Stream Deck:**
   - Open Stream Deck application
   - Go to Preferences > Plugins
   - Enable "Developer Mode"

2. **View plugin logs in Stream Deck:**
   - Right-click on the Stream Deck icon in system tray
   - Select "Settings..." 
   - Go to "Developer" tab
   - You can see logs and reload plugins here

## Common Debugging Scenarios

### 1. Plugin Not Loading
- Check `manifest.json` for syntax errors
- Verify the CodePath points to the correct file: `bin/plugin.js`
- Check the build output exists

### 2. Bluetooth Issues
- Ensure Bluetooth is enabled on your system
- Check permissions (macOS may require Bluetooth access)
- Monitor logs for noble/Bluetooth errors

### 3. Property Inspector Issues
- Open Chrome DevTools for the Property Inspector:
  - Right-click in the Property Inspector window
  - Select "Inspect Element"
- Check for JavaScript errors in the console

### 4. Action Not Working
- Verify the action UUID matches in:
  - `manifest.json`
  - `@action` decorator in TypeScript
  - Property Inspector HTML

## Debugging Commands Reference

```bash
# Build the plugin
npm run build

# Watch mode with auto-restart
npm run watch

# Debug mode with Node inspector
npm run start:debug

# View logs
tail -f com.cael-gomes.bt-controller.sdPlugin/logs/*.log

# Clear logs
rm com.cael-gomes.bt-controller.sdPlugin/logs/*.log

# Restart Stream Deck manually
streamdeck restart com.cael-gomes.bt-controller
```

## Troubleshooting Tips

1. **Clear old logs:** The plugin keeps up to 10 log files. Clear them periodically.

2. **Check manifest.json:** Ensure `"Debug": "enabled"` is set under `Nodejs` section.

3. **Verify file paths:** The plugin expects specific directory structure. Don't rename folders.

4. **Monitor system resources:** Bluetooth operations can be CPU intensive.

5. **Test with simple commands first:** Start with basic Bluetooth commands before complex ones.

## Environment Variables

You can set these for additional debugging:

```bash
# Enable verbose noble logging
export DEBUG=noble*

# Enable all debug output
export DEBUG=*
```

## Getting Help

- Check the Stream Deck SDK documentation
- Review the @elgato/streamdeck npm package docs
- Look at the noble Bluetooth library documentation
