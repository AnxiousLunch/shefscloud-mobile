export type RootStackParamList = {
  Home: undefined;
  FoodDetail: { foodId: number };
};

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
  tags: string;
  total_reviews: number;
  updated_at: string;
  user: {
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
  };
  user_id: number;
};


export type Chef = {
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

export type DishList = Dish[];
