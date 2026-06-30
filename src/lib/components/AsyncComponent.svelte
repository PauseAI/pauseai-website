<script lang="ts" generics="T extends Component = Component">
	import { type Component, type ComponentProps, type Snippet } from 'svelte'

	interface Props<T extends Component> {
		children?: Snippet
		component: Promise<T>
		props?: ComponentProps<T>
	}

	let { component, children, props }: Props<T> = $props()
</script>

{#await component}
	{#if children}
		{@render children()}
	{/if}
{:then Component}
	<Component {...props}>
		{#if children}
			{@render children()}
		{/if}
	</Component>
{/await}
