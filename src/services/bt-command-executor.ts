export interface BTCommand {
	type: 'write' | 'read' | 'notify';
	data: string | number[];
	format: 'hex' | 'text' | 'bytes';
}

export class BTCommandExecutor {
	static parseCommand(command: BTCommand): Buffer {
		switch (command.format) {
			case 'hex':
				return this.hexToBuffer(command.data as string);
			case 'text':
				return Buffer.from(command.data as string, 'utf8');
			case 'bytes':
				return Buffer.from(command.data as number[]);
			default:
				throw new Error(`Unknown command format: ${command.format}`);
		}
	}

	static hexToBuffer(hex: string): Buffer {
		// Remove spaces and 0x prefix if present
		hex = hex.replace(/\s/g, '').replace(/^0x/i, '');
		
		// Ensure even number of characters
		if (hex.length % 2 !== 0) {
			hex = '0' + hex;
		}

		const bytes = [];
		for (let i = 0; i < hex.length; i += 2) {
			bytes.push(parseInt(hex.substr(i, 2), 16));
		}

		return Buffer.from(bytes);
	}

	static bufferToHex(buffer: Buffer): string {
		return buffer.toString('hex').toUpperCase().match(/.{2}/g)?.join(' ') || '';
	}

	static validateHex(hex: string): boolean {
		const cleanHex = hex.replace(/\s/g, '').replace(/^0x/i, '');
		return /^[0-9A-Fa-f]*$/.test(cleanHex);
	}

	static formatCommandForDisplay(command: BTCommand): string {
		switch (command.format) {
			case 'hex':
				return `Hex: ${command.data}`;
			case 'text':
				return `Text: "${command.data}"`;
			case 'bytes':
				return `Bytes: [${(command.data as number[]).join(', ')}]`;
			default:
				return 'Unknown format';
		}
	}
}
