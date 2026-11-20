/** "1 format", "3 formats". */
export function count(n: number, one: string, many: string): string {
	return `${n} ${n === 1 ? one : many}`
}
