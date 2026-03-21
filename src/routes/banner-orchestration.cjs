// Banner orchestration: picks the active main banner and campaign banner before first paint.
// Reads geo from cookie, checks dates + dismissals, sets data attributes on <html>.
// Each banner self-registers its reveal CSS via <svelte:head>.
;(function () {
	var now = new Date()

	var country = ''
	var m = document.cookie.match(/(?:^|; )geo_country=([^;]*)/)
	if (m) country = m[1]

	function dismissed(prefix, id) {
		try {
			return localStorage.getItem(prefix + '_' + id + '_hidden') === 'true'
		} catch {
			return false
		}
	}

	function inDateRange(startsOn, endsOn) {
		if (startsOn) {
			var s = startsOn.split('-')
			if (now < new Date(+s[0], +s[1] - 1, +s[2])) return false
		}
		if (endsOn) {
			var e = endsOn.split('-')
			if (now > new Date(+e[0], +e[1] - 1, +e[2], 23, 59, 59, 999)) return false
		}
		return true
	}

	// Main banner: first matching rule wins
	if (
		country === 'GB' &&
		inDateRange(null, '2025-02-28') &&
		!dismissed('banner', 'gb-feb28-protest')
	) {
		document.documentElement.dataset.activeBanner = 'gb-feb28-protest'
	} else if (
		country === 'US' &&
		inDateRange(null, '2025-02-28') &&
		!dismissed('banner', 'us-state-sovereignty')
	) {
		document.documentElement.dataset.activeBanner = 'us-state-sovereignty'
	} else if (inDateRange(null, '2024-12-31') && !dismissed('banner', 'holiday-littlehelpers')) {
		document.documentElement.dataset.activeBanner = 'holiday-littlehelpers'
	}

	// Campaign banner: shown if eligible
	if (
		inDateRange(null, '2026-02-23') &&
		!dismissed('campaign_banner', 'brussels-ep-protest-2026')
	) {
		document.documentElement.dataset.activeCampaignBanner = 'brussels-ep-protest-2026'
	}
})()
