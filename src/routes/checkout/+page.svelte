<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cart';
	import { PUBLIC_RAZORPAY_KEY_ID } from '$env/static/public';
	import { siteInfo } from '$lib/siteInfo';

	let name = '';
	let phone = '';
	let address = '';
	let paying = false;
	let scriptLoaded = false;

	$: total = $cart.reduce((sum, i) => sum + i.price_inr * i.qty, 0);

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://checkout.razorpay.com/v1/checkout.js';
		script.onload = () => (scriptLoaded = true);
		document.body.appendChild(script);
	});

	async function pay() {
		if (!name || !phone || !address) {
			alert('Fill in your name, phone, and delivery address first.');
			return;
		}
		paying = true;

		const res = await fetch('/api/create-order', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: $cart.map((i) => ({ id: i.id, qty: i.qty })) })
		});
		if (!res.ok) {
			alert('Could not start checkout — ' + (await res.text()));
			paying = false;
			return;
		}
		const { order } = await res.json();

		// @ts-expect-error Razorpay is loaded globally by the checkout.js script
		const rzp = new Razorpay({
			key: PUBLIC_RAZORPAY_KEY_ID,
			amount: order.amount,
			currency: order.currency,
			order_id: order.id,
			name: 'Loka',
			description: 'Order payment',
			prefill: { name, contact: phone },
			handler: async (response: any) => {
				const verifyRes = await fetch('/api/verify-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...response, customer: { name, phone, address } })
				});
				const { valid } = await verifyRes.json();
				if (valid) {
					cart.clear();
					goto('/?order=success');
				} else {
					alert('Payment verification failed. Please contact support before retrying.');
				}
			},
			modal: {
				ondismiss: () => (paying = false)
			}
		});
		rzp.open();
	}
</script>

<svelte:head>
	<title>Checkout — Loka</title>
</svelte:head>

<section class="mx-auto max-w-xl px-6 py-12">
	<h1 class="font-display text-3xl">Checkout</h1>

	<div class="mt-8 space-y-4">
		<input bind:value={name} placeholder="Full name" class="w-full rounded-lg border border-line px-4 py-3" />
		<input bind:value={phone} placeholder="Phone number" class="w-full rounded-lg border border-line px-4 py-3" />
		<textarea
			bind:value={address}
			placeholder="Delivery address"
			rows="3"
			class="w-full rounded-lg border border-line px-4 py-3"
		/>
	</div>

	<div class="mt-8 flex items-center justify-between border-t border-line pt-6">
		<span class="text-lg font-medium">Total: ₹{total}</span>
		<button
			on:click={pay}
			disabled={!scriptLoaded || paying || $cart.length === 0}
			class="rounded-full bg-ink px-8 py-3 font-medium text-paper hover:opacity-90 disabled:opacity-40"
		>
			{paying ? 'Processing…' : 'Pay with Razorpay'}
		</button>
	</div>

	<p class="mt-6 text-center text-xs text-ink/50">
		Questions before you pay? Call or WhatsApp
		<a href={siteInfo.telUrl} class="text-teal underline">{siteInfo.phoneDisplay}</a>
	</p>
</section>
