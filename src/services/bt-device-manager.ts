import noble from "@stoprocent/noble";
import { EventEmitter } from "events";

export interface BLEDevice {
	id: string;
	name: string;
	address: string;
	rssi: number;
	advertisement: any;
	connectable: boolean;
}

export interface BLEService {
	uuid: string;
	name?: string;
	characteristics?: BLECharacteristic[];
}

export interface BLECharacteristic {
	uuid: string;
	name?: string;
	properties: string[];
}

export class BTDeviceManager extends EventEmitter {
	private discoveredDevices: Map<string, BLEDevice> = new Map();
	private scanTimeout?: NodeJS.Timeout;
	private isScanning = false;

	constructor() {
		super();
		this.setupNobleListeners();
	}

	private setupNobleListeners(): void {
		noble.on("stateChange", (state) => {
			this.emit("stateChange", state);
			if (state !== "poweredOn" && this.isScanning) {
				this.stopScanning();
			}
		});

		noble.on("discover", (peripheral) => {
			const device: BLEDevice = {
				id: peripheral.id,
				name: peripheral.advertisement.localName || "Unknown Device",
				address: peripheral.address,
				rssi: peripheral.rssi,
				advertisement: peripheral.advertisement,
				connectable: peripheral.connectable
			};

			this.discoveredDevices.set(device.id, device);
			this.emit("deviceDiscovered", device);
		});
	}

	async startScanning(duration: number = 10000): Promise<void> {
		if (this.isScanning) {
			return;
		}

		if (noble.state !== "poweredOn") {
			throw new Error("Bluetooth is not powered on");
		}

		this.discoveredDevices.clear();
		this.isScanning = true;
		
		await noble.startScanningAsync([], true);
		this.emit("scanStarted");

		// Auto-stop after duration
		this.scanTimeout = setTimeout(() => {
			this.stopScanning();
		}, duration);
	}

	async stopScanning(): Promise<void> {
		if (!this.isScanning) {
			return;
		}

		if (this.scanTimeout) {
			clearTimeout(this.scanTimeout);
			this.scanTimeout = undefined;
		}

		await noble.stopScanningAsync();
		this.isScanning = false;
		this.emit("scanStopped", Array.from(this.discoveredDevices.values()));
	}

	async connectToDevice(deviceId: string): Promise<any> {
		const peripheral = await this.getPeripheral(deviceId);
		if (!peripheral) {
			throw new Error(`Device ${deviceId} not found`);
		}

		await peripheral.connectAsync();
		return peripheral;
	}

	async discoverServices(deviceId: string): Promise<BLEService[]> {
		const peripheral = await this.getPeripheral(deviceId);
		if (!peripheral) {
			throw new Error(`Device ${deviceId} not found`);
		}

		const { services, characteristics } = await peripheral.discoverAllServicesAndCharacteristicsAsync();
		
		const bleServices: BLEService[] = services.map(service => ({
			uuid: service.uuid,
			name: this.getServiceName(service.uuid),
			characteristics: characteristics
				.filter(char => char._serviceUuid === service.uuid)
				.map(char => ({
					uuid: char.uuid,
					name: this.getCharacteristicName(char.uuid),
					properties: char.properties
				}))
		}));

		return bleServices;
	}

	async executeCommand(
		deviceId: string,
		serviceUuid: string,
		characteristicUuid: string,
		command: Buffer,
		withoutResponse: boolean = false
	): Promise<void> {
		const peripheral = await this.getPeripheral(deviceId);
		if (!peripheral) {
			throw new Error(`Device ${deviceId} not found`);
		}

		try {
			if (peripheral.state !== "connected") {
				await peripheral.connectAsync();
			}

			const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
				[serviceUuid],
				[characteristicUuid]
			);

			if (characteristics.length === 0) {
				throw new Error("Characteristic not found");
			}

			await characteristics[0].writeAsync(command, withoutResponse);
		} finally {
			await peripheral.disconnectAsync();
		}
	}

	private async getPeripheral(deviceId: string): Promise<any> {
		// Scan briefly to ensure device is discoverable if not present
		if (noble.state === "poweredOn") {
			await noble.startScanningAsync([], true);
			await new Promise((r) => setTimeout(r, 500));
			await noble.stopScanningAsync();
		}
		// Attempt direct connection by id
		try {
			const peripheral = await (noble as any).connectAsync?.(deviceId);
			if (peripheral) {
				return peripheral;
			}
		} catch {}
		throw new Error("Peripheral cache lookup not supported by noble on this platform");
	}

	private getServiceName(uuid: string): string {
		// Common BLE service names
		const knownServices: Record<string, string> = {
			"1800": "Generic Access",
			"1801": "Generic Attribute",
			"180a": "Device Information",
			"180f": "Battery Service",
			"1805": "Current Time Service",
			// Add more as needed
		};

		return knownServices[uuid.toLowerCase()] || uuid;
	}

	private getCharacteristicName(uuid: string): string {
		// Common BLE characteristic names
		const knownCharacteristics: Record<string, string> = {
			"2a00": "Device Name",
			"2a01": "Appearance",
			"2a19": "Battery Level",
			// Add more as needed
		};

		return knownCharacteristics[uuid.toLowerCase()] || uuid;
	}

	getDiscoveredDevices(): BLEDevice[] {
		return Array.from(this.discoveredDevices.values());
	}

	getIsScanning(): boolean {
		return this.isScanning;
	}
}

// Singleton instance
export const btDeviceManager = new BTDeviceManager();
