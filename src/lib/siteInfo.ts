// Centralized business/contact details — used in the footer, /contact page,
// and trust signals near checkout. Edit here once, it updates everywhere.
export const siteInfo = {
	businessName: 'Sky Computer',
	operatedByLine: 'Loka is operated by Sky Computer',
	address: {
		line1: 'Soro Station Road, Mangalpur',
		line2: 'Purubai Kanyashram Chhaka, Soro',
		city: 'Balasore',
		state: 'Odisha',
		pincode: '756045'
	},
	phone: '+919776333310',
	phoneDisplay: '+91 97763 33310',
	servicesNote: 'Computer accessory dealer and digital solutions',
	get fullAddress() {
		return `${this.address.line1}, ${this.address.line2}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
	},
	get mapsEmbedUrl() {
		return `https://www.google.com/maps?q=${encodeURIComponent(this.fullAddress)}&output=embed`;
	},
	get mapsLinkUrl() {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.fullAddress)}`;
	},
	get whatsappUrl() {
		return `https://wa.me/${this.phone.replace('+', '')}`;
	},
	get telUrl() {
		return `tel:${this.phone}`;
	}
};