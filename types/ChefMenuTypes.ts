export type FoodType = {
  id: number;
  name: string;
  image: string;
};

export type SpiceLevel = {
  id: number;
  name: string;
};

export type TagOption = {
  id: number;
  value: string;
  label: string;
};

export type PortionType = {
  id: number;
  name: string;
};

export type HeatInstruction = {
  id: number;
  title: string;
};

export type IngredientOption = {
  id: number;
  name: string;
  value: string;
  label: string;
};

export type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
  label: string;
};

export type ChefMenuState = {
  id?: number;
  name: string;
  description: string;
  food_type_id: number;
  side_item: number;
  spice_level_id: number;
  tags: string;
  base_type_id: number;
  portion_size: string;
  portion_type_id: number;
  chef_earning_fee: number;
  platform_price: number;
  delivery_price: number;
  heating_instruction_id: number;
  prep_time: number;
  shelf_life: number;
  is_vegetarian: number;
  is_vegan: number;
  is_gluten_free: number;
  is_halal: number;
  item_limit?: number | null;
  is_monday?: boolean;
  is_tuesday?: boolean;
  is_wednesday?: boolean;
  is_thursday?: boolean;
  is_friday?: boolean;
  is_saturday?: boolean;
  is_sunday?: boolean;
  availability_time_slots?: string[];
  limit_item_availibility?: boolean;
  limit_start?: string | null;
  limit_end?: string | null;
  logo?: {
    uri: string;
    type: string;
    fileName: string;
  };
};

// Props types for step components
export type StepProps = {
  updateFields: (fields: Partial<ChefMenuState>) => void;
  isEdit?: boolean;
  // Add all other possible props used in steps here
  foodType?: FoodType[];
  spiceLevel?: SpiceLevel[];
  tagOptions?: TagOption[];
  cusineSelectedOptions?: TagOption[];
  setCusineSelectedOptions?: (options: TagOption[]) => void;
  portionTypes?: PortionType[];
  grams?: string;
  pieces?: string;
  customPortion?: string;
  setGrams?: (grams: string) => void;
  setPieces?: (pieces: string) => void;
  setCustomPortion?: (customPortion: string) => void;
  isServSizeModalOpen?: boolean;
  setServSizeModalOpen?: (open: boolean) => void;
  heatInstruction?: HeatInstruction[];
  ingredientOptions?: IngredientOption[];
  selectedIngredients?: IngredientOption[];
  setSelectedIngredients?: (ingredients: IngredientOption[]) => void;
  timeSlot?: TimeSlot[];
  selectedAvailabilitySlot?: TimeSlot[];
  setSelectedAvailabilitySlot?: (slots: TimeSlot[]) => void;
} & Partial<ChefMenuState>;