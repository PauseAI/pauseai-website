<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium'
	export let color: string = 'currentColor'
</script>

<div class="spinner {size}" style="color: {color}">
	<div class="spinner-circle"></div>
</div>

<style>
	.spinner {
		display: inline-block;
		position: relative;
	}

	.spinner.small {
		width: 16px;
		height: 16px;
	}

	.spinner.medium {
		width: 20px;
		height: 20px;
	}

	.spinner.large {
		width: 24px;
		height: 24px;
	}

	.spinner-circle {
		width: 100%;
		height: 100%;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.spinner.small .spinner-circle {
		border-width: 1.5px;
		border-top-width: 1.5px;
	}

	.spinner.large .spinner-circle {
		border-width: 2.5px;
		border-top-width: 2.5px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
