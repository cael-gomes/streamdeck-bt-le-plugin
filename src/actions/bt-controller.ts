import * as sdk from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, PropertyInspectorDidAppearEvent, SendToPluginEvent, JsonObject } from "@elgato/streamdeck";
import { btDeviceManager } from "../services/bt-device-manager";
import { BTCommandExecutor, BTCommand } from "../services/bt-command-executor";

export interface BTControllerSettings extends JsonObject {
	deviceId?: string;
	deviceName?: string;
	deviceAddress?: string;
	serviceUuid?: string;
	characteristicUuid?: string;
	command?: BTCommand;
	withoutResponse?: boolean;
	[key: string]: any;
}

@action({ UUID: "com.cael-gomes.bt-controller.control" })
export class BTController extends SingletonAction<BTControllerSettings> {
	private isExecuting = false;

	override async onWillAppear(ev: WillAppearEvent<BTControllerSettings>): Promise<void> {
		const { settings } = ev.payload;
		
		// Set initial title
		if (settings.deviceName) {
			await ev.action.setTitle(settings.deviceName);
		} else {
			await ev.action.setTitle("BT Control");
		}

		// Send current settings to property inspector
		const streamDeck: any = ((sdk as any).default ?? (sdk as any));
		await streamDeck.ui.current?.sendToPropertyInspector({
			event: "settingsUpdate",
			settings: settings as any
		});
	}

	override async onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent<BTControllerSettings>): Promise<void> {
		// Send current settings when PI appears
		const settings = await ev.action.getSettings<BTControllerSettings>();
		const streamDeck: any = ((sdk as any).default ?? (sdk as any));
		await streamDeck.ui.current?.sendToPropertyInspector({
			event: "settingsUpdate",
			settings: settings as any
		});
	}

	override async onSendToPlugin(ev: SendToPluginEvent<any, BTControllerSettings>): Promise<void> {
		const { event, payload } = ev.payload;

		switch (event) {
			case "scanDevices":
				await this.handleScanDevices(ev);
				break;
			case "getServices":
				await this.handleGetServices(ev, payload.deviceId);
				break;
			case "saveSettings":
				await this.handleSaveSettings(ev, payload);
				break;
			case "testCommand":
				await this.handleTestCommand(ev);
				break;
		}
	}

	override async onKeyDown(ev: KeyDownEvent<BTControllerSettings>): Promise<void> {
		if (this.isExecuting) {
			console.log("Command already executing, skipping...");
			return;
		}

		const { settings } = ev.payload;
		
		if (!settings.deviceId || !settings.serviceUuid || !settings.characteristicUuid || !settings.command) {
			await ev.action.showAlert();
			console.warn("BT Controller not properly configured");
			return;
		}

		try {
			this.isExecuting = true;
			await ev.action.setTitle("⏳");

			const commandBuffer = BTCommandExecutor.parseCommand(settings.command);
			
			console.log(`🔧 Executing BT command...`);
			console.log(`📱 Device: ${settings.deviceName} (${settings.deviceAddress})`);
			console.log(`🔍 Service: ${settings.serviceUuid} | Characteristic: ${settings.characteristicUuid}`);
			console.log(`📤 Command: ${BTCommandExecutor.formatCommandForDisplay(settings.command)}`);

			await btDeviceManager.executeCommand(
				settings.deviceId,
				settings.serviceUuid,
				settings.characteristicUuid,
				commandBuffer,
				settings.withoutResponse ?? false
			);

			await ev.action.showOk();
			await ev.action.setTitle(settings.deviceName || "BT Control");
			console.log("✅ Command executed successfully");

		} catch (error) {
			console.error("❌ BT command failed:", error);
			await ev.action.showAlert();
			await ev.action.setTitle("❌ Error");
			
			// Reset title after a delay
			setTimeout(async () => {
				await ev.action.setTitle(settings.deviceName || "BT Control");
			}, 2000);
		} finally {
			this.isExecuting = false;
		}
	}

	private async handleScanDevices(ev: SendToPluginEvent<any, BTControllerSettings>): Promise<void> {
		try {
			// Listen for discovered devices
			const deviceListener = (device: any) => {
				const streamDeck: any = ((sdk as any).default ?? (sdk as any));
				streamDeck.ui.current?.sendToPropertyInspector({
					event: "deviceDiscovered",
					device: {
						id: device.id,
						name: device.name,
						address: device.address,
						rssi: device.rssi,
						connectable: device.connectable
					}
				});
			};

			btDeviceManager.on("deviceDiscovered", deviceListener);

			// Start scanning
			await btDeviceManager.startScanning(10000);

			// Clean up listener when scan stops
			btDeviceManager.once("scanStopped", () => {
				btDeviceManager.off("deviceDiscovered", deviceListener);
				const streamDeck: any = ((sdk as any).default ?? (sdk as any));
				streamDeck.ui.current?.sendToPropertyInspector({
					event: "scanComplete"
				});
			});

		} catch (error) {
			console.error("Failed to scan devices:", error);
			const streamDeck: any = ((sdk as any).default ?? (sdk as any));
			await streamDeck.ui.current?.sendToPropertyInspector({
				event: "error",
				message: `Scan failed: ${String(error)}`
			});
		}
	}

	private async handleGetServices(ev: SendToPluginEvent<any, BTControllerSettings>, deviceId: string): Promise<void> {
		try {
			const services = await btDeviceManager.discoverServices(deviceId);
			const streamDeck: any = ((sdk as any).default ?? (sdk as any));
			await streamDeck.ui.current?.sendToPropertyInspector({
				event: "servicesDiscovered",
				services: (services as unknown) as any
			});
		} catch (error) {
			console.error("Failed to discover services:", error);
			const streamDeck: any = ((sdk as any).default ?? (sdk as any));
			await streamDeck.ui.current?.sendToPropertyInspector({
				event: "error", 
				message: `Service discovery failed: ${String(error)}`
			});
		}
	}

	private async handleSaveSettings(ev: SendToPluginEvent<any, BTControllerSettings>, settings: BTControllerSettings): Promise<void> {
		// Update settings
		await ev.action.setSettings(settings);
		
		// Update title
		if (settings.deviceName) {
			if ((ev.action as any).isKey?.()) {
				await (ev.action as any).setTitle(settings.deviceName);
			} else if ((ev.action as any).isDial?.()) {
				await (ev.action as any).setTitle(settings.deviceName);
			}
		}

		// Confirm save
		const streamDeck: any = ((sdk as any).default ?? (sdk as any));
		await streamDeck.ui.current?.sendToPropertyInspector({
			event: "settingsSaved"
		});
	}

	private async handleTestCommand(ev: SendToPluginEvent<any, BTControllerSettings>): Promise<void> {
		// Simply trigger the command with current settings
		await this.onKeyDown({
			action: ev.action as any,
			payload: { settings: await ev.action.getSettings<BTControllerSettings>() } as any
		} as KeyDownEvent<BTControllerSettings>);
	}
}
