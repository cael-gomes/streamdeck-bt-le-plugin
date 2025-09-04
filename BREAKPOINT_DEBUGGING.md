# Debugging with Breakpoints - Stream Deck Plugin

## ✅ Current Status
The plugin is now configured to automatically include node_modules during build, and debugging is working properly!

## Quick Start - Chrome DevTools

1. **Ensure nothing is using port 9229:**
   ```bash
   lsof -ti:9229 | xargs kill -9 2>/dev/null || true
   ```

2. **Build and start debug mode:**
   ```bash
   npm run build
   npm run start:debug
   ```
   You'll see: `Starting inspector on 127.0.0.1:9229`

3. **Open Chrome DevTools:**
   - Open Chrome browser
   - Navigate to: **`chrome://inspect`**
   - Click **"inspect"** under your plugin target

4. **Setting Breakpoints:**
   - In the Sources tab, navigate to your source files
   - Click on line numbers to set breakpoints (blue dots)
   - The debugger will pause when these lines are executed

## Recommended Breakpoint Locations

### 1. Plugin Initialization
```typescript:src/plugin.ts
streamDeck.actions.registerAction(new BTController()); // Line 11 - Debug action registration
streamDeck.connect(); // Line 15 - Debug connection to Stream Deck
```

### 2. Action Event Handlers
```typescript:src/actions/bt-controller.ts
// Debug when action appears on Stream Deck
override async onWillAppear(ev: WillAppearEvent<BTControllerSettings>): Promise<void> {
    const { settings } = ev.payload; // Set breakpoint here

// Debug button presses
override async onKeyDown(ev: KeyDownEvent<BTControllerSettings>): Promise<void> {
    if (this.isExecuting) { // Set breakpoint here

// Debug property inspector communication
override async onSendToPlugin(ev: SendToPluginEvent<any, BTControllerSettings>): Promise<void> {
    const { event, payload } = ev.payload; // Set breakpoint here
```

### 3. Bluetooth Operations
```typescript:src/services/bt-device-manager.ts
// Debug device scanning
async startScanning(duration = 5000): Promise<void> {
    console.log("🔍 Starting BLE scan..."); // Set breakpoint here

// Debug command execution
async executeCommand(...): Promise<void> {
    const peripheral = this.getPeripheral(deviceId); // Set breakpoint here
```

## VS Code Debugging (Alternative)

1. **Kill any existing debug processes:**
   ```bash
   lsof -ti:9229 | xargs kill -9
   ```

2. **Press F5 in VS Code**
   - Select "Debug Stream Deck Plugin" from the dropdown
   - VS Code will build and attach to the plugin

3. **Set breakpoints in VS Code:**
   - Click in the gutter (left of line numbers)
   - Red dots indicate active breakpoints

## Debugging Tips

### 1. Console Logging
The plugin already has extensive logging:
```bash
# Monitor logs in real-time
tail -f com.cael-gomes.bt-controller.sdPlugin/logs/*.log
```

### 2. Conditional Breakpoints
Right-click on a breakpoint to add conditions:
- Example: `settings.deviceId === "specific-device"`
- Useful for debugging specific scenarios

### 3. Watch Expressions
Add variables to the Watch panel to monitor their values:
- `ev.payload`
- `settings`
- `this.isExecuting`

### 4. Call Stack
Use the Call Stack panel to understand the execution flow and navigate between functions.

### 5. Alternative Port
If port 9229 is consistently in use:
```bash
npm run start:debug:alt  # Uses port 9230
```

## Common Issues and Solutions

### Port Already in Use
```bash
# Find and kill the process
lsof -i :9229
kill -9 <PID>

# Or use the one-liner
lsof -ti:9229 | xargs kill -9
```

### Breakpoints Not Hit
1. Ensure the plugin is running in debug mode
2. Check that sourcemaps are enabled (they are in this config)
3. Verify the code path is actually being executed

### Module Not Found Errors
The build now automatically copies node_modules, but if issues persist:
```bash
# Clean build
rm -rf com.cael-gomes.bt-controller.sdPlugin/node_modules
npm run build
```

## Testing Your Breakpoints

1. **Add the action to Stream Deck:**
   - Open Stream Deck application
   - Drag "BT Control" to a button

2. **Trigger breakpoints:**
   - **onWillAppear**: Action appears on Stream Deck
   - **onKeyDown**: Press the button
   - **Property Inspector**: Click the button's settings (i)

3. **Debug workflow:**
   - Execution pauses at breakpoints
   - Inspect variables in the Scope panel
   - Step through code with F10 (step over) or F11 (step into)
   - Continue with F5 or the play button

## Advanced Debugging

### Remote Debugging
If debugging on a different machine:
```bash
node --inspect=0.0.0.0:9229 ./com.cael-gomes.bt-controller.sdPlugin/bin/plugin.js
```

### Memory Profiling
In Chrome DevTools:
1. Go to Memory tab
2. Take heap snapshots
3. Compare snapshots to find memory leaks

### Performance Profiling
1. Go to Performance tab
2. Start recording
3. Perform actions
4. Stop and analyze the timeline

## Summary

✅ **Build automatically includes node_modules**
✅ **Debug mode works on port 9229**
✅ **Chrome DevTools and VS Code both supported**
✅ **Extensive logging already in place**

Happy debugging! 🐛🔍
