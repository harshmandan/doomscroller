export type Slot = { id: string; boundIndex: number };

let nextId = 0;

export function makeSlots(indexes: number[]): Slot[] {
	return indexes.map((boundIndex) => ({ id: `slot-${nextId++}`, boundIndex }));
}

/** The feed indexes that should have a video: `size` of them, centred on `idx`. */
export function computeWindow(idx: number, len: number, size = 3): number[] {
	const count = Math.min(size, len);
	if (count <= 0) return [];
	const start = Math.min(Math.max(0, idx - Math.floor(count / 2)), len - count);
	return Array.from({ length: count }, (_, i) => start + i);
}

export function reassign(slots: Slot[], desired: number[]): void {
	// Pool shrank: drop slots that show nothing we want first.
	for (let i = slots.length - 1; i >= 0 && slots.length > desired.length; i--) {
		if (!desired.includes(slots[i].boundIndex)) slots.splice(i, 1);
	}
	if (slots.length > desired.length) slots.length = desired.length;

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
	// Pool grew: the rest get new slots.
	slots.push(...makeSlots(missing.slice(free.length)));
}
