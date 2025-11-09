import { writable } from 'svelte/store'
import { browser } from '$app/environment'

// Configuration
export const MAX_SELECTIONS = 3

// Types
export interface SelectionHistoryEntry {
	dayId: number
	action: 'selected' | 'deselected'
	timestamp: number
}

export interface AdventCalendarState {
	selectedDays: number[]
	history: SelectionHistoryEntry[]
}

// Storage keys
const STORAGE_KEY = 'advent_calendar_state'

// Initialize state from localStorage
function getInitialState(): AdventCalendarState {
	if (!browser) {
		return { selectedDays: [], history: [] }
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			return JSON.parse(stored)
		}
	} catch (e) {
		console.error('Failed to load advent calendar state:', e)
	}

	return { selectedDays: [], history: [] }
}

// Create the store
function createAdventCalendarStore() {
	const { subscribe, update } = writable<AdventCalendarState>(getInitialState())

	// Persist to localStorage on changes
	subscribe((value) => {
		if (browser) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
			} catch (e) {
				console.error('Failed to save advent calendar state:', e)
			}
		}
	})

	return {
		subscribe,
		toggleSelection: (dayId: number) => {
			update((state) => {
				const isSelected = state.selectedDays.includes(dayId)
				let newSelectedDays: number[]

				if (isSelected) {
					// Deselect
					newSelectedDays = state.selectedDays.filter((id) => id !== dayId)
				} else {
					// Select (if under limit)
					if (state.selectedDays.length >= MAX_SELECTIONS) {
						// Already at max, don't add
						return state
					}
					newSelectedDays = [...state.selectedDays, dayId]
				}

				// Add to history
				const historyEntry: SelectionHistoryEntry = {
					dayId,
					action: isSelected ? 'deselected' : 'selected',
					timestamp: Date.now()
				}

				return {
					selectedDays: newSelectedDays,
					history: [...state.history, historyEntry]
				}
			})
		},
		reset: () => {
			update(() => ({ selectedDays: [], history: [] }))
		}
	}
}

export const adventCalendar = createAdventCalendarStore()
