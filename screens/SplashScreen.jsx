import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

// Enhanced responsive helper functions
const isTablet = width >= 768
const isSmallPhone = width < 375
const responsiveValue = (phoneValue, tabletValue, smallPhoneValue) => {
  if (isTablet) return tabletValue;
  if (isSmallPhone && smallPhoneValue !== undefined) return smallPhoneValue;
  return phoneValue;
}
const responsiveWidth = (percentage) => width * (percentage / 100)
const responsiveHeight = (percentage) => height * (percentage / 100)
const responsiveFontSize = (size) => {
  const baseSize = responsiveValue(size, size * 1.2, size * 0.85);
  return Math.min(baseSize, size * 1.5);
}

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0)).current
  const logoRotate = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const dotAnimations = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Logo floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Loading dots animation
    const animateDots = () => {
      dotAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ).start()
      })
    }

    setTimeout(animateDots, 1000)
  }, [])

  const logoTransform = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2deg"],
  })

  const logoTranslateY = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  })

  return (
    <LinearGradient 
      colors={["#ffffff", "#fef7f0", "#fdeae1", "#f9dcc4"]} 
      style={styles.container}
    >
      {/* Decorative Elements similar to AuthScreen */}
      <View style={styles.decorativeElement1} />
      <View style={styles.decorativeElement2} />
      <View style={styles.decorativeElement3} />
      <View style={styles.decorativeElement4} />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }, { rotate: logoTransform }, { translateY: logoTranslateY }],
          },
        ]}
      >
        <Image 
          resizeMode="contain"
          style={styles.logo}
          source={require('../assets/shefscloud_logo_2.png')}
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.appName}>Shefs Cloud</Text>
        <Text style={styles.tagline}>Premium culinary experiences{"\n"}from verified chefs</Text>
      </Animated.View>

      <View style={styles.loadingContainer}>
        {dotAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
    position: "relative",
  },
  // Decorative Elements
  decorativeElement1: {
    position: "absolute",
    top: responsiveHeight(15),
    right: responsiveWidth(10),
    width: responsiveValue(60, 80, 50),
    height: responsiveValue(60, 80, 50),
    backgroundColor: "rgba(179, 0, 0, 0.05)",
    borderRadius: 40,
    borderWidth: responsiveValue(1, 2, 1),
    borderColor: "rgba(179, 0, 0, 0.1)",
  },
  decorativeElement2: {
    position: "absolute",
    top: responsiveHeight(25),
    left: responsiveWidth(5),
    width: responsiveValue(50, 60, 40),
    height: responsiveValue(50, 60, 40),
    backgroundColor: "rgba(255, 68, 68, 0.08)",
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  decorativeElement3: {
    position: "absolute",
    top: responsiveHeight(45),
    right: responsiveWidth(8),
    width: responsiveValue(30, 40, 25),
    height: responsiveValue(30, 40, 25),
    backgroundColor: "rgba(179, 0, 0, 0.06)",
    borderRadius: 20,
  },
  decorativeElement4: {
    position: "absolute",
    top: responsiveHeight(35),
    left: responsiveWidth(12),
    width: responsiveValue(80, 100, 70),
    height: responsiveValue(80, 100, 70),
    backgroundColor: "rgba(255, 68, 68, 0.03)",
    borderRadius: 50,
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "rgba(179, 0, 0, 0.08)",
  },
  logoContainer: {
    width: responsiveValue(200, 250, 180),
    height: responsiveValue(100, 120, 90),
    backgroundColor: "#ffffff",
    borderRadius: responsiveValue(20, 25, 18),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(4),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "rgba(179, 0, 0, 0.08)",
    padding: responsiveValue(10, 15, 8),
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: responsiveHeight(4),
  },
  appName: {
    color: "#2d2d2d",
    fontSize: responsiveFontSize(28),
    fontWeight: "800",
    marginBottom: responsiveHeight(1.5),
    letterSpacing: -0.5,
    textAlign: "center",
  },
  tagline: {
    color: "#666",
    fontSize: responsiveFontSize(16),
    textAlign: "center",
    fontWeight: "400",
    lineHeight: responsiveFontSize(22),
  },
  loadingContainer: {
    flexDirection: "row",
    gap: responsiveValue(8, 10, 6),
    marginTop: responsiveHeight(2),
  },
  dot: {
    width: responsiveValue(10, 12, 8),
    height: responsiveValue(10, 12, 8),
    backgroundColor: "#b30000",
    borderRadius: responsiveValue(5, 6, 4),
  },
})