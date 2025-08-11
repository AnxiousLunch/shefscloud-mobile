"use client"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { 
  Animated, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView,
  useWindowDimensions
} from "react-native"
import { signOutUser } from "@/store/user"
import { useDispatch } from "react-redux"
import { useRouter } from "expo-router"
import { loadUserFromStorage } from "@/store/user"
import { UserInfo } from "@/store/user"
import { clearCurrentUser, emptyCartThunk } from "@/store/cart"


export default function ProfileDropdown({ isVisible, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const dispatch = useDispatch();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [user, setUser] = useState(null);  
  // Responsive scaling factors
  const responsiveScale = Math.min(width / 400, 1);
  const baseFontSize = 16 * responsiveScale;
  const emailFontSize = Math.max(14 * responsiveScale, 12);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const res = await dispatch(loadUserFromStorage());
      if (loadUserFromStorage.fulfilled.match(res)) {
        const { userInfo } = res.payload;
        
        setUser(userInfo);
      } else {
        console.warn("Failed to load user:", res.error);
      }
    };
    
    console.log(user)
    if (isVisible) {
      fetchUserInfo();
    }
  }, [dispatch, isVisible]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible])

  const handleLogout = async () => {
    try {
      await dispatch(emptyCartThunk());
      await dispatch(signOutUser())
      router.replace('/(auth)');
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!isVisible) return null

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={onClose} 
        activeOpacity={1} 
      />
      
      <Animated.View
        style={[
          styles.dropdown,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            top: height * 0.08, // Responsive top position
            right: width * 0.05, // Responsive right margin
            maxWidth: width * 0.9, // Max 90% of screen width
            minWidth: Math.min(width * 0.7, 300), // Flexible min width
          },
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[
              styles.avatar, 
              { width: 40 * responsiveScale, height: 40 * responsiveScale }
            ]}>
              <Text style={[styles.avatarText, { fontSize: baseFontSize }]}>
                {user?.first_name?.charAt(0) || "U"}
              </Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { fontSize: baseFontSize }]}>
                {user?.first_name}
              </Text>
              <Text 
                style={[styles.userEmail, { fontSize: emailFontSize }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout}
          >
            <Ionicons 
              name="log-out-outline" 
              size={20 * responsiveScale} 
              color="#ef4444" 
            />
            <Text style={[styles.menuText, { fontSize: baseFontSize }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: "50%", // Prevent dropdown from being too tall
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    borderRadius: 20,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    minWidth: "50%", // Ensure proper text wrapping
  },
  userName: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    color: "#6b7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuText: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
})