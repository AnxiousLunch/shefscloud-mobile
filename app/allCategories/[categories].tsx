import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, Text, Image, View, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function AllCategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categories = params.categories ? JSON.parse(params.categories as string) : [];

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {categories.map((category: any) => (
        <TouchableOpacity
          key={category.id}
          style={styles.card}
          onPress={() => router.push(`/foodCategoryScreen/${category.id}`)}
        >
          <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
          <Text style={styles.name}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: (width - width * 0.18) / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  image: {
    width: "100%",
    height: width * 0.28,
    borderRadius: 15,
    marginBottom: 15,
  },
  name: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: width * 0.04,
    marginBottom: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
});
