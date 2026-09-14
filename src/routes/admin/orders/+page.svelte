<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const statusColor: Record<string, string> = {
		not_created: 'bg-line text-ink/60',
		created: 'bg-marigold text-ink',
		pickup_scheduled: 'bg-teal text-paper',
		failed: 'bg-rust text-paper'
	};
</script>

<svelte:head>
	<title>Orders — Loka Admin</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-6 py-12">
	<div class="flex items-center justify-between">
		<h1 class="font-display text-2xl">Orders ({data.orders.length})</h1>
		<a href="/admin" class="text-sm text-teal underline">← Products</a>
	</div>

	{#if form?.message}
		<p class="mt-4 rounded-lg bg-rust/10 px-4 py-2 text-sm text-rust">{form.message}</p>
	{/if}

	<div class="mt-8 space-y-4">
		{#each data.orders as order (order.id)}
			<div class="rounded-2xl border border-line p-5">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-medium">{order.customer_name ?? 'Unknown'}</p>
						<p class="text-sm text-ink/60">{order.customer_phone}</p>
						<p class="mt-1 text-sm text-ink/60">{order.delivery_address}</p>
					</div>
					<div class="text-right">
						<p class="font-medium">₹{order.total_inr}</p>
						<span class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium {statusColor[order.shipment_status] ?? statusColor.not_created}">
							{order.shipment_status ?? 'not_created'}
						</span>
					</div>
				</div>

				{#if order.awb_code}
					<p class="mt-3 text-sm">
						<span class="text-ink/50">AWB:</span> {order.awb_code}
						{#if order.courier_name}<span class="text-ink/50"> via</span> {order.courier_name}{/if}
					</p>
				{/if}

				{#if order.shipment_error}
					<p class="mt-2 text-sm text-rust">{order.shipment_error}</p>
				{/if}

				<div class="mt-4 flex flex-wrap gap-3">
					{#if order.shipment_status === 'not_created' || order.shipment_status === 'failed'}
						<form method="POST" action="?/retryShipment" use:enhance>
							<input type="hidden" name="orderId" value={order.id} />
							<button class="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper">
								Create shipment
							</button>
						</form>
					{/if}

					{#if order.shiprocket_shipment_id && order.shipment_status === 'created'}
						<form method="POST" action="?/retryPickup" use:enhance>
							<input type="hidden" name="orderId" value={order.id} />
							<input type="hidden" name="shipmentId" value={order.shiprocket_shipment_id} />
							<button class="rounded-full bg-teal px-4 py-1.5 text-sm font-medium text-paper">
								Retry courier assignment
							</button>
						</form>
					{/if}

					{#if order.shiprocket_shipment_id && !order.label_url}
						<form method="POST" action="?/fetchLabel" use:enhance>
							<input type="hidden" name="orderId" value={order.id} />
							<input type="hidden" name="shipmentId" value={order.shiprocket_shipment_id} />
							<button class="rounded-full border border-line px-4 py-1.5 text-sm font-medium">
								Get shipping label
							</button>
						</form>
					{/if}

					{#if order.label_url}
						<a href={order.label_url} target="_blank" rel="noopener" class="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-teal">
							Download label
						</a>
					{/if}
				</div>
			</div>
		{/each}

		{#if data.orders.length === 0}
			<p class="text-ink/50">No orders yet.</p>
		{/if}
	</div>
</section>
