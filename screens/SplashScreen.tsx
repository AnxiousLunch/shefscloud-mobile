"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

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
    <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }, { rotate: logoTransform }, { translateY: logoTranslateY }],
          },
        ]}
      >
        <Text style={styles.logoText}>SC</Text>
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
                    scale: anim,
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
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#dc2626",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  appName: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 25,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
})
