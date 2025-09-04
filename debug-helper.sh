#!/bin/bash

# BT LE Controller Stream Deck Plugin Debug Helper
# This script provides convenient commands for debugging

PLUGIN_ID="com.cael-gomes.bt-controller"
LOG_DIR="com.cael-gomes.bt-controller.sdPlugin/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show menu
show_menu() {
    echo
    print_color "$BLUE" "===== Stream Deck Plugin Debug Helper ====="
    echo "1. Build plugin"
    echo "2. Start watch mode (auto-rebuild)"
    echo "3. Start debug mode (Chrome DevTools)"
    echo "4. View latest logs"
    echo "5. Clear all logs"
    echo "6. Restart Stream Deck plugin"
    echo "7. Show plugin info"
    echo "8. Monitor logs (tail -f)"
    echo "9. Check Bluetooth status"
    echo "0. Exit"
    echo
}

# Function to build plugin
build_plugin() {
    print_color "$YELLOW" "Building plugin..."
    npm run build
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Build successful!"
    else
        print_color "$RED" "✗ Build failed!"
    fi
}

# Function to start watch mode
start_watch() {
    print_color "$YELLOW" "Starting watch mode..."
    print_color "$BLUE" "Press Ctrl+C to stop"
    npm run watch
}

# Function to start debug mode
start_debug() {
    print_color "$YELLOW" "Starting debug mode..."
    print_color "$BLUE" "Open chrome://inspect in Chrome to connect"
    print_color "$BLUE" "Press Ctrl+C to stop"
    npm run start:debug
}

# Function to view latest logs
view_logs() {
    if [ -d "$LOG_DIR" ]; then
        latest_log=$(ls -t $LOG_DIR/*.log 2>/dev/null | head -1)
        if [ -n "$latest_log" ]; then
            print_color "$BLUE" "Showing latest log: $latest_log"
            echo "---"
            cat "$latest_log"
            echo "---"
        else
            print_color "$YELLOW" "No log files found"
        fi
    else
        print_color "$RED" "Log directory not found"
    fi
}

# Function to clear logs
clear_logs() {
    if [ -d "$LOG_DIR" ]; then
        print_color "$YELLOW" "Clearing log files..."
        rm -f $LOG_DIR/*.log
        print_color "$GREEN" "✓ Logs cleared!"
    else
        print_color "$RED" "Log directory not found"
    fi
}

# Function to restart plugin
restart_plugin() {
    print_color "$YELLOW" "Restarting Stream Deck plugin..."
    if command -v streamdeck &> /dev/null; then
        streamdeck restart $PLUGIN_ID
        print_color "$GREEN" "✓ Plugin restarted!"
    else
        print_color "$RED" "✗ streamdeck CLI not found. Install with: npm install -g @elgato/cli"
    fi
}

# Function to show plugin info
show_info() {
    print_color "$BLUE" "Plugin Information:"
    echo "---"
    echo "Plugin ID: $PLUGIN_ID"
    echo "Log Directory: $LOG_DIR"
    echo "Build Output: com.cael-gomes.bt-controller.sdPlugin/bin/plugin.js"
    echo
    if [ -f "com.cael-gomes.bt-controller.sdPlugin/manifest.json" ]; then
        print_color "$BLUE" "Manifest Info:"
        cat com.cael-gomes.bt-controller.sdPlugin/manifest.json | grep -E '"(Name|Version|UUID)"' | sed 's/^/  /'
    fi
}

# Function to monitor logs
monitor_logs() {
    if [ -d "$LOG_DIR" ]; then
        print_color "$YELLOW" "Monitoring logs (Press Ctrl+C to stop)..."
        tail -f $LOG_DIR/*.log
    else
        print_color "$RED" "Log directory not found"
    fi
}

# Function to check Bluetooth status
check_bluetooth() {
    print_color "$BLUE" "Checking Bluetooth status..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        bt_status=$(system_profiler SPBluetoothDataType 2>/dev/null | grep -i "state" | head -1)
        if [[ $bt_status == *"On"* ]] || [[ $bt_status == *"Enabled"* ]]; then
            print_color "$GREEN" "✓ Bluetooth is enabled"
        else
            print_color "$RED" "✗ Bluetooth is disabled or not found"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v bluetoothctl &> /dev/null; then
            bt_status=$(bluetoothctl show | grep "Powered" | awk '{print $2}')
            if [[ $bt_status == "yes" ]]; then
                print_color "$GREEN" "✓ Bluetooth is enabled"
            else
                print_color "$RED" "✗ Bluetooth is disabled"
            fi
        else
            print_color "$YELLOW" "bluetoothctl not found"
        fi
    else
        print_color "$YELLOW" "Bluetooth status check not implemented for this OS"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Select an option: " choice
    
    case $choice in
        1) build_plugin ;;
        2) start_watch ;;
        3) start_debug ;;
        4) view_logs ;;
        5) clear_logs ;;
        6) restart_plugin ;;
        7) show_info ;;
        8) monitor_logs ;;
        9) check_bluetooth ;;
        0) print_color "$GREEN" "Goodbye!"; exit 0 ;;
        *) print_color "$RED" "Invalid option" ;;
    esac
    
    if [[ $choice =~ ^[2,3,8]$ ]]; then
        # These options run continuously, so exit after they're done
        continue
    else
        echo
        read -p "Press Enter to continue..."
    fi
done
