-- Run after schema.sql (and migration_001_bestseller.sql if you ran schema.sql
-- before that file existed). Replace image_url values with your own product
-- photos before going live — these placeholders just fill the demo.

insert into products
	(name, category, slug, price_inr, compare_at_inr, description, image_url, stock, bestseller, units_sold, source_note)
values

('Microfiber Cleaning Cloth Set (6-pack)', 'home-care', 'microfiber-cloth-set', 249, 399,
 'Lint-free microfiber cloths for glass, kitchen counters, and screens. Machine washable, reusable 300+ times.',
 'https://placehold.co/600x600/1F4B4A/F5F3EE?text=Home+Care', 120, true, 340, 'Generic 1688/AliExpress cleaning cloth supplier'),

('Foldable Silicone Storage Bags (Set of 4)', 'home-care', 'silicone-storage-bags', 599, 899,
 'Leak-proof, freezer and microwave safe. Replaces single-use plastic bags for pantry and fridge storage.',
 'https://placehold.co/600x600/1F4B4A/F5F3EE?text=Home+Care', 80, false, 62, 'AliExpress kitchen storage category'),

('Bamboo Face Cleansing Brush', 'personal-care', 'bamboo-cleansing-brush', 299, null,
 'Soft silicone bristles on a bamboo handle for gentle daily exfoliation.',
 'https://placehold.co/600x600/B4552F/F5F3EE?text=Personal+Care', 150, false, 88, 'AliExpress beauty tools supplier'),

('Portable UV Toothbrush Sanitizer Case', 'personal-care', 'uv-toothbrush-case', 449, 699,
 'USB-rechargeable UV case that sanitizes your toothbrush head while traveling.',
 'https://placehold.co/600x600/B4552F/F5F3EE?text=Personal+Care', 60, true, 210, 'AliExpress personal hygiene supplier'),

('Heat-Resistant Silicone Utensil Set (5-piece)', 'kitchen-accessories', 'silicone-utensil-set', 499, 749,
 'Spatula, spoon, whisk, ladle, and turner — non-stick safe up to 220°C.',
 'https://placehold.co/600x600/E7A93C/1C2321?text=Kitchen', 90, true, 402, '1688 kitchenware bulk supplier'),

('Adjustable Stainless Steel Pot Organizer Rack', 'kitchen-accessories', 'pot-organizer-rack', 799, 1199,
 'Expandable rack fits 4–6 pots and pans, keeps cabinets tidy.',
 'https://placehold.co/600x600/E7A93C/1C2321?text=Kitchen', 45, false, 37, 'AliExpress home organization supplier'),

('Educational Building Blocks Set (120 pcs)', 'kids-section', 'building-blocks-set', 649, 999,
 'Compatible with major block brands. Non-toxic ABS plastic, ages 3+.',
 'https://placehold.co/600x600/3A6EA5/F5F3EE?text=Kids', 70, true, 275, 'AliExpress toys supplier'),

('Kids Anti-Slip Silicone Feeding Set', 'kids-section', 'silicone-feeding-set', 549, null,
 'Suction plate, bowl, and utensils — BPA-free, dishwasher safe.',
 'https://placehold.co/600x600/3A6EA5/F5F3EE?text=Kids', 100, false, 54, 'AliExpress baby products supplier'),

('Mini Portable Bluetooth Speaker', 'electronics', 'mini-bluetooth-speaker', 899, 1499,
 'Compact speaker with 8-hour battery life and clear mid-range sound.',
 'https://placehold.co/600x600/5B4B8A/F5F3EE?text=Electronics', 55, true, 318, 'AliExpress electronics accessories supplier'),

('Wireless Charging Stand (15W)', 'electronics', 'wireless-charging-stand', 999, 1599,
 'Fast wireless charging stand compatible with all Qi-enabled phones.',
 'https://placehold.co/600x600/5B4B8A/F5F3EE?text=Electronics', 65, false, 71, 'AliExpress electronics accessories supplier');
