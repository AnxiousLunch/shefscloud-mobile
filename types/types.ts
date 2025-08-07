import { store } from "@/store/store";

export type RootStackParamList = {
  Home: undefined;
  FoodDetail: { foodId: number };
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export type Dish = {
  auto_applied_active_discounts: any[];
  availability_time_slots: any[]; // Replace `any` with a proper type if structure is known
  average_rating: number | string;
  base_type_id: number;
  chef_earning_fee: number;
  comments: string | null;
  created_at: string;
  deleted_at: string | null;
  delivery_price: number;
  description: string;
  expiry_days: number;
  food_type_id: number;
  id: number;
  instruction_template_id: number;
  is_friday: number;
  is_live: number;
  is_monday: number;
  is_saturday: number;
  is_sunday: number;
  is_thursday: number;
  is_tuesday: number;
  is_wednesday: number;
  item_limit: string;
  limit_end: string | null;
  limit_item_availability: string | null;
  limit_start: string | null;
  logo: string;
  name: string;
  packaging: number;
  phone: string | null;
  pivot: {
    city_id: number;
    user_menu_id: number;
  };
  platform_price: number;
  platform_rate_id: number | null;
  portion_size: number;
  portion_type_id: number;
  reheating_instruction: string;
  spice_level_id: number;
  spice_level: SpiceLevel;
  tags: string;
  total_reviews: number;
  updated_at: string;
  user: User;
  user_id: number;
};


export type User = {
  bio: string | null;
  contract_signed: string | null;
  cover_pic: string;
  created_at: string;
  deleted_at: string | null;
  email: string;
  email_verified_at: string;
  first_name: string;
  food_handle_certificate: string | null;
  id: number;
  is_active: number;
  is_admin: number;
  is_chef: number;
  last_name: string;
  order_capacity: number | null;
  phone: string;
  profile_pic: string;
  updated_at: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  image: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export type DishList = Dish[];


export type City = {
  countries: {
    id: number, 
    name: string
  },
  country_id: number,
  created_at: string, 
  deleted_at: string | null, 
  id: number, 
  name: string, 
  updated_at: string
}

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  chef_earning: number;
  // add other item properties as needed
};

export type Order = {
  id: string;
  order_number: string;
  order_code: string;
  customer: {
    name: string;
    phone: string;
  };
  delivery_address: string;
  delivery_date: string;
  delivery_time: string;
  delivery_date_time: string;
  created_at: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'delivered' | 'canceled';
  // add other order properties as needed
};

interface Ingredient {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Ingredient pivot (user_menu_ingredient)
interface UserMenuIngredient {
  id: number;
  user_menu_id: number;
  ingredient_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ingredient: Ingredient;
}

// Food type
interface FoodType {
  id: number;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Portion type
interface PortionType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Spice level
interface SpiceLevel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Instruction template
interface InstructionTemplate {
  id: number;
  title: string;
  instruction: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// Time slot
export interface TimeSlot {
  id: string;
  time_start: string;
  time_end: string;
}

// Menu item in the cart
interface CartMenu {
  id: number;
  user_id: number;
  instruction_template_id: number;
  platform_rate_id: number | null;
  logo: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  availability_time_slots: TimeSlot[];
  average_rating: string | number;
  base_type_id: number;
  chef_earning_fee: number;
  comments: string | null;
  delivery_price: number;
  expiry_days: number;
  food_type_id: number;
  food_type: FoodType;
  ingredients: UserMenuIngredient[];
  instruction_template: InstructionTemplate;
  is_friday: number;
  is_live: number;
  is_monday: number;
  is_saturday: number;
  is_sunday: number;
  is_thursday: number;
  is_tuesday: number;
  is_wednesday: number;
  item_limit: string;
  limit_start: string | null;
  limit_end: string | null;
  limit_item_availability: string | null;
  packaging: number;
  phone: string | null;
  platform_price: number;
  portion_size: number;
  portion_type_id: number;
  portion_type: PortionType;
  quantity: number;
  reheating_instruction: string;
  spice_level_id: number;
  spice_level: SpiceLevel;
  tags: string;
  total_reviews: number;
  unit_price: number;
}

// Other menu entries
interface OtherMenu {
  id: number;
  user_id: number;
  platform_rate_id: number | null;
  logo: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  availability_time_slots: TimeSlot[];
  average_rating: string | number;
  base_type_id: number;
  chef_earning_fee: number;
  comments: string | null;
  delivery_price: number;
  expiry_days: number;
  food_type_id: number;
  instruction_template_id: number;
  is_friday: number;
  is_live: number;
  is_monday: number;
  is_saturday: number;
  is_sunday: number;
  is_thursday: number;
  is_tuesday: number;
  is_wednesday: number;
  item_limit: string;
  limit_start: string | null;
  limit_end: string | null;
  limit_item_availability: string | null;
  packaging: number;
  phone: string | null;
  platform_price: number;
  portion_size: number;
  portion_type_id: number;
  reheating_instruction: string;
  spice_level_id: number;
  tags: string;
  total_reviews: number;
}

// Final cart response type
export interface CartItemResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string;
  phone: string | null;
  profile_pic: string;
  cover_pic: string;
  bio: string | "null";
  is_active: number;
  is_admin: number;
  is_chef: number;
  contract_signed: string | null;
  food_handle_certificate: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  delivery_date: string;
  delivery_slot: string;
  order_capacity: number | null;
  menu: CartMenu[]; // Array with single cart item
  menus: OtherMenu[]; // Possibly other available menus from the chef
}

export type ChefInCart = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_pic: string;
  cover_pic: string;
  bio: string | null;
  is_admin: number;
  is_chef: number;
  is_active: number;
  email_verified_at: string;
  contract_signed: string | null;
  food_handle_certificate: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  delivery_date: string;
  delivery_slot: string;
  menus: any[]; // Not used in cart
  order_capacity: number | null;
  menu: OtherMenu[];
};

export type CartState = {
  cart: CartItemResponse[];
  currentUserId: string | null;
  cartInitialized: boolean;
};