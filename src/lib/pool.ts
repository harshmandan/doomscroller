export type Slot = { id: string; boundIndex: number };

export function computeWindow(idx: number, len: number): number[] {
	if (len <= 0) return [];
	if (len <= 3) return Array.from({ length: len }, (_, i) => i);
	if (idx <= 0) return [0, 1, 2];
	if (idx >= len - 1) return [len - 3, len - 2, len - 1];
	return [idx - 1, idx, idx + 1];
}

export function reassign(slots: Slot[], desired: number[]): void {
	const used = new Set<number>();
	const free: Slot[] = [];
	for (const slot of slots) {
		if (desired.includes(slot.boundIndex) && !used.has(slot.boundIndex)) {
			used.add(slot.boundIndex);
		} else {
			free.push(slot);
		}
	}
	const missing = desired.filter((i) => !used.has(i));
	for (let i = 0; i < free.length && i < missing.length; i++) {
		free[i].boundIndex = missing[i];
	}
}
