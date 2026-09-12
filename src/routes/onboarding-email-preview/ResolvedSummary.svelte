<script lang="ts">
	// Mirrors OnboardingEmailResolution in $lib/server/onboardingEmail, which client code
	// cannot import.
	type Resolved = {
		bucket: string
		group: string
		language: string
		override: string | null
		chapter: { name: string; links: unknown[] } | null
	}

	let { resolved }: { resolved: Resolved } = $props()
</script>

bucket <code>{resolved.bucket}</code> ({resolved.group}) · language <code>{resolved.language}</code>
·
{#if resolved.override}
	override <code>{resolved.override}</code>{#if resolved.chapter}, chapter data for
		<code>{resolved.chapter.name}</code> ({resolved.chapter.links.length} links){/if}
{:else if resolved.chapter}
	chapter <code>{resolved.chapter.name}</code>, {resolved.chapter.links.length} link{resolved
		.chapter.links.length === 1
		? ''
		: 's'}
{:else}
	no chapter block
{/if}
