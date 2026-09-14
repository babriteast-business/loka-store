import {
	SHIPROCKET_EMAIL,
	SHIPROCKET_PASSWORD,
	SHIPROCKET_PICKUP_LOCATION
} from '$env/static/private';

const BASE = 'https://apiv2.shiprocket.in/v1/external';

// Token lives for 10 days per Shiprocket's docs. We keep it in memory for
// this server process rather than re-logging in on every request — cheap
// and avoids hammering their auth endpoint. If the process restarts
// (a Render redeploy), it just logs in again on the next call.
let cachedToken: { value: string; fetchedAt: number } | null = null;
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // refresh a day early

async function getToken(): Promise<string> {
	if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_TTL_MS) {
		return cachedToken.value;
	}

	const res = await fetch(`${BASE}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD })
	});

	if (!res.ok) {
		throw new Error(`Shiprocket login failed: ${res.status} ${await res.text()}`);
	}

	const data = await res.json();
	cachedToken = { value: data.token, fetchedAt: Date.now() };
	return data.token;
}

async function sr(path: string, body: unknown) {
	const token = await getToken();
	const res = await fetch(`${BASE}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(body)
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(`Shiprocket ${path} failed: ${res.status} ${JSON.stringify(data)}`);
	}
	return data;
}

export type ShipmentItem = {
	name: string;
	sku: string;
	units: number;
	selling_price: number;
	weight_grams: number;
	length_cm: number;
	breadth_cm: number;
	height_cm: number;
};

export type ShipmentInput = {
	orderId: string; // your own order UUID, used as Shiprocket's order_id reference
	customerName: string;
	customerPhone: string;
	deliveryAddress: string; // free-text address as collected at checkout
	items: ShipmentItem[];
	totalInr: number;
	paymentMethod: 'Prepaid' | 'COD';
};

// Splits a free-text address into what Shiprocket's create-order API expects.
// This is a best-effort parse since our checkout form collects one address
// field rather than separate city/state/pincode inputs. It looks for a
// trailing 6-digit PIN code and otherwise puts everything in address line 1.
function parseAddress(raw: string) {
	const pinMatch = raw.match(/(\d{6})/);
	const pincode = pinMatch ? pinMatch[1] : '';
	return {
		address: raw,
		pincode,
		// City/state aren't reliably extractable from free text — Shiprocket
		// still accepts the order and resolves serviceability from the pincode.
		// If you want cleaner data, switch the checkout form to separate
		// city/state/pincode fields and pass them through directly here.
		city: 'NA',
		state: 'NA'
	};
}

export async function generateLabel(shipmentId: string): Promise<string> {
	const res = await sr('/courier/generate/label', { shipment_id: [shipmentId] });
	return res.label_url;
}

export async function requestPickup(shipmentId: string) {
	return sr('/courier/generate/pickup', { shipment_id: [shipmentId] });
}
	const addr = parseAddress(input.deliveryAddress);
	if (!addr.pincode) {
		throw new Error('Could not find a 6-digit pincode in the delivery address');
	}

	const totalWeight = input.items.reduce((sum, i) => sum + (i.weight_grams * i.units) / 1000, 0);
	const maxDims = input.items.reduce(
		(m, i) => ({
			length: Math.max(m.length, i.length_cm),
			breadth: Math.max(m.breadth, i.breadth_cm),
			height: Math.max(m.height, i.height_cm)
		}),
		{ length: 10, breadth: 10, height: 5 }
	);

	const orderRes = await sr('/orders/create/adhoc', {
		order_id: input.orderId,
		order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
		pickup_location: SHIPROCKET_PICKUP_LOCATION,
		billing_customer_name: input.customerName,
		billing_last_name: '',
		billing_address: addr.address,
		billing_city: addr.city,
		billing_pincode: addr.pincode,
		billing_state: addr.state,
		billing_country: 'India',
		billing_email: 'orders@loka.store',
		billing_phone: input.customerPhone.replace(/\D/g, '').slice(-10),
		shipping_is_billing: true,
		order_items: input.items.map((i) => ({
			name: i.name,
			sku: i.sku,
			units: i.units,
			selling_price: i.selling_price
		})),
		payment_method: input.paymentMethod,
		sub_total: input.totalInr,
		length: maxDims.length,
		breadth: maxDims.breadth,
		height: maxDims.height,
		weight: Math.max(totalWeight, 0.1)
	});

	const shipmentId = orderRes.shipment_id;
	const shiprocketOrderId = orderRes.order_id;

	// Assign a courier + AWB automatically (Shiprocket picks the best option
	// for the route when no specific courier_id is passed).
	let awbCode: string | null = null;
	let courierName: string | null = null;
	try {
		const awbRes = await sr('/courier/assign/awb', { shipment_id: shipmentId });
		awbCode = awbRes.response?.data?.awb_code ?? null;
		courierName = awbRes.response?.data?.courier_name ?? null;
	} catch (err) {
		// Order was created even if AWB assignment fails (e.g. no courier
		// serviceable for that pincode yet) — surface this so /admin can retry.
		return {
			shiprocketOrderId,
			shipmentId,
			awbCode: null,
			courierName: null,
			labelUrl: null,
			status: 'created',
			error: `AWB assignment failed: ${(err as Error).message}`
		};
	}

	// Request pickup — best-effort, doesn't block on failure.
	try {
		await sr('/courier/generate/pickup', { shipment_id: [shipmentId] });
	} catch {
		// non-fatal — pickup can be scheduled manually from the Shiprocket panel
	}

	return {
		shiprocketOrderId,
		shipmentId,
		awbCode,
		courierName,
		labelUrl: null as string | null,
		status: 'pickup_scheduled',
		error: null as string | null
	};
}
