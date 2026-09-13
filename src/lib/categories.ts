export type Category = {
	slug: string;
	name: string;
	tagline: string;
	color: string;
	shape: 'torusKnot' | 'icosahedron' | 'capsule' | 'octahedron' | 'dodecahedron';
};

// Each category gets a distinct procedural geometry + color so the 3D hero
// never depends on product photography or external model files.
export const categories: Category[] = [
	{
		slug: 'home-care',
		name: 'Home Care',
		tagline: 'Everyday upkeep, sorted.',
		color: '#1F4B4A',
		shape: 'torusKnot'
	},
	{
		slug: 'personal-care',
		name: 'Personal Care',
		tagline: 'Small rituals, done well.',
		color: '#B4552F',
		shape: 'capsule'
	},
	{
		slug: 'kitchen-accessories',
		name: 'Kitchen Accessories',
		tagline: 'Tools that earn their drawer space.',
		color: '#E7A93C',
		shape: 'icosahedron'
	},
	{
		slug: 'kids-section',
		name: 'Kids Section',
		tagline: 'Built for small hands.',
		color: '#3A6EA5',
		shape: 'octahedron'
	},
	{
		slug: 'electronics',
		name: 'Electronics',
		tagline: 'Useful gadgets, honestly priced.',
		color: '#5B4B8A',
		shape: 'dodecahedron'
	}
];

export function getCategory(slug: string): Category | undefined {
	return categories.find((c) => c.slug === slug);
}
