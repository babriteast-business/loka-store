<script lang="ts">
	import { siteInfo } from '$lib/siteInfo';
</script>

<svelte:head>
	<title>Contact & Support — Loka</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-6 py-12">
	<h1 class="font-display text-3xl">Contact & Support</h1>
	<p class="mt-3 text-ink/70">{siteInfo.operatedByLine}. Questions about an order, a return, or
		anything else — reach us directly.</p>

	<div class="mt-8 grid gap-6 sm:grid-cols-2">
		<div class="space-y-4">
			<div>
				<h2 class="text-sm font-medium text-ink/50">Address</h2>
				<p class="mt-1">{siteInfo.address.line1}</p>
				<p>{siteInfo.address.line2}</p>
				<p>{siteInfo.address.city}, {siteInfo.address.state} - {siteInfo.address.pincode}</p>
				<a href={siteInfo.mapsLinkUrl} target="_blank" rel="noopener" class="mt-1 inline-block text-sm text-teal underline">
					Get directions
				</a>
			</div>

			<div>
				<h2 class="text-sm font-medium text-ink/50">Phone</h2>
				<a href={siteInfo.telUrl} class="mt-1 block text-lg font-medium">{siteInfo.phoneDisplay}</a>
				<div class="mt-2 flex gap-3">
					<a href={siteInfo.telUrl} class="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper">Call</a>
					<a href={siteInfo.whatsappUrl} target="_blank" rel="noopener" class="rounded-full bg-teal px-4 py-2 text-sm font-medium text-paper">WhatsApp</a>
				</div>
			</div>

			<div>
				<h2 class="text-sm font-medium text-ink/50">What we do</h2>
				<p class="mt-1 text-ink/75">{siteInfo.servicesNote}</p>
			</div>
		</div>

		<div class="overflow-hidden rounded-2xl border border-line">
			<iframe
				title="Store location"
				src={siteInfo.mapsEmbedUrl}
				width="100%"
				height="280"
				style="border:0"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			></iframe>
		</div>
	</div>
</section>
