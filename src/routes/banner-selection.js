// Banner selection: picks the active main banner and campaign banner before first paint.
// Reads geo from cookie, checks dates + dismissals, sets data-active-banner,
// data-is-active-banner-geo, and data-active-campaign-banner on <html>.
// Exposed as window.selectBanners to allow re-runs.
//
// `inDateRange` is injected as a global by +layout.svelte before this script runs.

/** @typedef {import('$lib/types').BannerRule} BannerRule */
/** @type {BannerRule[]} */
// eslint-disable-next-line no-unassigned-vars -- Injected by +layout.svelte at runtime
var mainBannerRules
/** @type {BannerRule[]} */
// eslint-disable-next-line no-unassigned-vars -- Injected by +layout.svelte at runtime
var campaignBannerRules
/** @type {(now: Date, startsOn: string | null, endsOn: string | null) => boolean} */
// eslint-disable-next-line no-unassigned-vars -- Injected by +layout.svelte at runtime
var inDateRange

window.selectBanners = function () {
	var now = new Date()

	var country = ''
	var m = document.cookie.match(/(?:^|; )geo_country=([^;]*)/)
	if (m) country = m[1]

	/**
	 * @param {string} prefix
	 * @param {string} id
	 * @returns {boolean}
	 */
	function dismissed(prefix, id) {
		try {
			return localStorage.getItem(prefix + '_' + id + '_hidden') === 'true'
		} catch {
			return false
		}
	}

	/**
	 * @param {BannerRule[]} rules
	 * @param {string} dismissalPrefix
	 * @returns {BannerRule | undefined}
	 */
	function findActiveBannerRule(rules, dismissalPrefix) {
		return rules.find(function (rule) {
			var countryMatches = !rule.countries || rule.countries.indexOf(country) !== -1
			if (
				countryMatches &&
				inDateRange(now, rule.dateRange[0], rule.dateRange[1]) &&
				!dismissed(dismissalPrefix, rule.id)
			) {
				return true
			}
			return false
		})
	}

	// Main banner: first matching rule wins
	delete document.documentElement.dataset.activeBanner
	delete document.documentElement.dataset.isActiveBannerGeo
	/** @type {BannerRule | undefined} */
	var activeMainBannerRule = findActiveBannerRule(mainBannerRules, 'banner')
	if (activeMainBannerRule) {
		document.documentElement.dataset.activeBanner = activeMainBannerRule.id
		if (activeMainBannerRule.countries) {
			document.documentElement.dataset.isActiveBannerGeo = 'true'
		}
	}

	// Campaign banner: shown if eligible
	delete document.documentElement.dataset.activeCampaignBanner
	/** @type {BannerRule | undefined} */
	var activeCampaignBannerRule = findActiveBannerRule(campaignBannerRules, 'campaign_banner')
	if (activeCampaignBannerRule) {
		document.documentElement.dataset.activeCampaignBanner = activeCampaignBannerRule.id
	}
}
window.selectBanners()
