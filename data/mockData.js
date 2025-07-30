export const cuisines = [
  {
    id: '1',
    name: 'Mexican',
    image: require('../assets/images/download.jpeg'),
  },
  {
    id: '2',
    name: 'Chinese',
    image: require('../assets/images/download.jpeg'),
  },
  {
    id: '3',
    name: 'Italian',
    image: require('../assets/images/download.jpeg'),
  },
  {
    id: '4',
    name: 'Pakistani',
    image: require('../assets/images/download.jpeg'),
  },
];

export const customerFavorites = [
  {
    id: '1',
    name: 'Biryani',
    description: 'The best dish',
    rating: 4.9,
    reviews: 120,
    prepTime: 'READY IN 5 MIN',
    price: '$15.99',
    image: require('../assets/images/download.jpeg'),
    isPopular: true,
  },
  {
    id: '2',
    name: 'Biryani',
    description: 'Special fried dish',
    rating: 4.8,
    reviews: 98,
    prepTime: 'READY IN 10 MIN',
    price: '$18.99',
    image: require('../assets/images/download.jpeg'),
    isPopular: true,
  },
];

export const chefs = [
  {
    id: '1',
    name: 'Test Chef',
    title: 'Top Rated Chef',
    rating: 4.9,
    verified: true,
    signatureDish: {
      name: 'Biryani',
      price: '$15.99',
    image: require('../assets/images/download.jpeg'),
    },
    image: require('../assets/images/download.jpeg'),
  },
];

export const features = [
  {
    id: '1',
    title: 'Lightning Fast Delivery',
    description: 'Get your favorite dishes delivered in record time with our optimized delivery network.',
    icon: 'fast-food-outline',
  },
  {
    id: '2',
    title: 'Quality Guaranteed',
    description: 'We ensure the highest quality standards with regular quality checks and customer feedback.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: '3',
    title: 'Secure Payment',
    description: 'Your payment information is protected with industry-leading security measures.',
    icon: 'card-outline',
  },
];

export const stats = [
  { label: 'Active Users', value: '500+', icon: 'people-outline' },
  { label: 'Average Rating', value: '4.9', icon: 'star-outline' },
  { label: 'Happy Customers', value: '100K+', icon: 'heart-outline' },
  { label: 'Cities', value: '50+', icon: 'location-outline' },
];

export const additionalFeatures = [
  { title: 'Fresh & Timely', description: 'Always fresh, always on time', icon: 'time-outline' },
  { title: 'Quality Assured', description: 'Premium ingredients, expert preparation', icon: 'checkmark-circle-outline' },
  { title: 'Diverse Cuisine', description: 'Explore flavors from around the world', icon: 'restaurant-outline' },
];