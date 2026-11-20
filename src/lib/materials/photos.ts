/**
 * Photos volunteers can use without bringing their own: PauseAI protests and events from around the world, from the
 * site's own images. Imported, so the build fingerprints them and makes the small versions for the picker.
 */
import heroLondon from '$assets/images/protests/Home_Hero_-_London_June_2025.jpg?url'
import heroLondonThumb from '$assets/images/protests/Home_Hero_-_London_June_2025.jpg?w=360&format=webp&url'
import aiRaceMarch from '$assets/images/stop-the-ai-race-march.jpg?url'
import aiRaceMarchThumb from '$assets/images/stop-the-ai-race-march.jpg?w=360&format=webp&url'
import sanFrancisco from '$assets/images/protests-san-francisco.jpeg?url'
import sanFranciscoThumb from '$assets/images/protests-san-francisco.jpeg?w=360&format=webp&url'
import melbourne from '$assets/images/australia/20250208_144134_MelbProtest.jpg?url'
import melbourneThumb from '$assets/images/australia/20250208_144134_MelbProtest.jpg?w=360&format=webp&url'
import parliamentSquare from '$assets/images/13-may-2024-parliament-square-cropped.jpg?url'
import parliamentSquareThumb from '$assets/images/13-may-2024-parliament-square-cropped.jpg?w=360&format=webp&url'

export interface LibraryPhoto {
	id: string
	label: string
	/** Full-size original, so print formats stay sharp. */
	src: string
	/** Small version for the picker. */
	thumb: string
}

export const LIBRARY_PHOTOS: LibraryPhoto[] = [
	{
		id: 'london-2025',
		label: 'London protest, June 2025',
		src: heroLondon,
		thumb: heroLondonThumb
	},
	{
		id: 'ai-race-march',
		label: 'Stop the AI race march',
		src: aiRaceMarch,
		thumb: aiRaceMarchThumb
	},
	{
		id: 'san-francisco',
		label: 'San Francisco protest',
		src: sanFrancisco,
		thumb: sanFranciscoThumb
	},
	{ id: 'melbourne', label: 'Melbourne protest', src: melbourne, thumb: melbourneThumb },
	{
		id: 'parliament-square',
		label: 'Parliament Square protest',
		src: parliamentSquare,
		thumb: parliamentSquareThumb
	}
]
