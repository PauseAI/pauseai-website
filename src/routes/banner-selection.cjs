/* global mainBannerRules, campaignBannerRules */
// Banner selection: picks the active main banner and campaign banner before first paint.
// Reads geo from cookie, checks dates + dismissals, sets data-active-banner,
// data-is-active-banner-geo, and data-active-campaign-banner on <html>.
// Exposed as window.selectBanners to allow re-runs.
window.selectBanners = function () {
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

	function findActiveBannerRule(rules, dismissalPrefix) {
		return rules.find(function (rule) {
			var countryMatches = !rule.countries || rule.countries.indexOf(country) !== -1
			if (
				countryMatches &&
				inDateRange(...rule.dateRange) &&
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
	var activeMainBannerRule = findActiveBannerRule(mainBannerRules, 'banner')
	if (activeMainBannerRule) {
		document.documentElement.dataset.activeBanner = activeMainBannerRule.id
		if (activeMainBannerRule.countries) {
			document.documentElement.dataset.isActiveBannerGeo = 'true'
		}
	}

	// Campaign banner: shown if eligible
	delete document.documentElement.dataset.activeCampaignBanner
	var activeCampaignBannerRule = findActiveBannerRule(campaignBannerRules, 'campaign_banner')
	if (activeCampaignBannerRule) {
		document.documentElement.dataset.activeCampaignBanner = activeCampaignBannerRule.id
	}
}
window.selectBanners()
