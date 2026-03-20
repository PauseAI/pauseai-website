// Prevent dismissed banners from flashing on reload by hiding them before first paint
try {
	const bannerTypes = [
		{ pattern: /^banner_(.+)_hidden$/, attr: 'data-banner-id' },
		{ pattern: /^campaign_banner_(.+)_hidden$/, attr: 'data-campaign-banner-id' }
	]
	let css = ''
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)
		if (!key || localStorage.getItem(key) !== 'true') continue
		for (let j = 0; j < bannerTypes.length; j++) {
			const m = key.match(bannerTypes[j].pattern)
			if (m) css += `[${bannerTypes[j].attr}="${m[1]}"]{display:none!important}`
		}
	}
	if (css) {
		const s = document.createElement('style')
		s.textContent = css
		document.head.appendChild(s)
	}
} catch (e) {
	console.error(e)
}
