import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get("window");

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

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@shefscloud.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+923202024035');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ffffff", "#fef7f0", "#fdeae1", "#f9dcc4"]}
        style={styles.backgroundGradient}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={responsiveValue(24, 28, 20)} color="#b30000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={responsiveValue(24, 28, 20)} color="#b30000" />
              </View>
              <Text style={styles.sectionTitle}>Terms of Service</Text>
            </View>
            <Text style={styles.effectiveDate}>Effective Date: 15 January 2025</Text>
            <Text style={styles.paragraph}>
              Welcome to Shefs Cloud (the "Website"). By accessing or using our platform, you agree to these
              Terms of Service ("Terms"). These Terms govern your access to and use of our Website, services,
              and interactions between home shefs ("Shefs") and customers ("Users"). If you do not agree, please
              refrain from using the Website.
            </Text>
          </View>

          {/* Section 1: Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.1)' }]}>
                <Ionicons name="document-text" size={responsiveValue(20, 24, 18)} color="#007bff" />
              </View>
              <Text style={styles.sectionTitle}>1. Overview</Text>
            </View>
            <Text style={styles.paragraph}>
              Shefscloud.com provides a platform that connects home chefs with customers looking for
              personalized meal preparation services. We act as an intermediary and are not responsible for the
              actual preparation or delivery of food.
            </Text>
          </View>

          {/* Section 2: Eligibility */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(40, 167, 69, 0.1)' }]}>
                <Ionicons name="people" size={responsiveValue(20, 24, 18)} color="#28a745" />
              </View>
              <Text style={styles.sectionTitle}>2. Eligibility</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>You have the legal capacity to enter into a binding agreement.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>You will provide accurate and complete registration information.</Text>
            </View>
          </View>

          {/* Section 3: User Accounts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(108, 117, 125, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={responsiveValue(20, 24, 18)} color="#6c757d" />
              </View>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
            </View>
            <Text style={styles.subsectionTitle}>a. Registration:</Text>
            <Text style={styles.paragraph}>
              To access certain features, you must create an account and provide accurate details.
            </Text>
            
            <Text style={styles.subsectionTitle}>b. Account Security:</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account credentials. Notify us
              immediately of any unauthorized use of your account.
            </Text>
            
            <Text style={styles.subsectionTitle}>c. Termination of Accounts:</Text>
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account for any violation of these Terms or
              fraudulent activity.
            </Text>
          </View>

          {/* Section 4: Role of Shefscloud.com */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(253, 126, 20, 0.1)' }]}>
                <Ionicons name="people" size={responsiveValue(20, 24, 18)} color="#fd7e14" />
              </View>
              <Text style={styles.sectionTitle}>4. Role of Shefscloud.com</Text>
            </View>
            <Text style={styles.subsectionTitle}>a. Intermediary Only:</Text>
            <Text style={styles.paragraph}>
              shefscloud.com acts solely as a platform to connect Shefs and Users. We do not prepare, deliver,
              or supervise food services.
            </Text>
            
            <Text style={styles.subsectionTitle}>b. Shef Responsibilities:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>Comply with local food safety regulations.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>Deliver services as advertised on the platform.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>Maintain a professional standard of hygiene and food quality.</Text>
            </View>
            
            <Text style={styles.subsectionTitle}>c. User Responsibilities:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>
                Provide accurate information for orders (e.g., delivery address, dietary preferences).
              </Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>Communicate respectfully with Shefs.</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>
                Pay for services in accordance with the platform's policies.
              </Text>
            </View>
          </View>

          {/* Section 5: Payments and Fees */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(32, 201, 151, 0.1)' }]}>
                <Ionicons name="card" size={responsiveValue(20, 24, 18)} color="#20c997" />
              </View>
              <Text style={styles.sectionTitle}>5. Payments and Fees</Text>
            </View>
            
            <Text style={styles.subsectionTitle}>a. Payment Processing:</Text>
            <Text style={styles.paragraph}>
              Currently shefscloud only accepts cash-on-delivery, and online payment is not available.
            </Text>
            
            <Text style={styles.subsectionTitle}>b. Platform Fees:</Text>
            <Text style={styles.paragraph}>
              shefscloud.com may charge a service fee for using the platform from Shefs only. Any applicable
              fees will be disclosed at checkout.
            </Text>
            
            <Text style={styles.subsectionTitle}>c. Refunds and Disputes:</Text>
            <Text style={styles.paragraph}>
              Refund policies vary depending on the Shef. In case of disputes, contact us at
              info@shefscloud.com or WhatsApp at +92 320 2024035, and we will mediate to resolve the issue.
            </Text>
          </View>

          {/* Section 6: Cancellations and Refunds */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}>
                <Ionicons name="refresh" size={responsiveValue(20, 24, 18)} color="#dc3545" />
              </View>
              <Text style={styles.sectionTitle}>6. Cancellations and Refunds</Text>
            </View>
            
            <Text style={styles.subsectionTitle}>a. Chef Cancellations:</Text>
            <Text style={styles.paragraph}>
              If a Shef cancels an order, Users are entitled to a full refund if any advance payment was made
              by the customer.
            </Text>
            
            <Text style={styles.subsectionTitle}>b. User Cancellations:</Text>
            <Text style={styles.paragraph}>
              Order cancellation is allowed for some time after placing the order. After this time,
              cancellation by the User will impact the User's profile registration if the Shef reports the
              issue.
            </Text>
            
            <Text style={styles.subsectionTitle}>c. Force Majeure:</Text>
            <Text style={styles.paragraph}>
              shefscloud.com is not liable for cancellations or delays caused by events beyond our control,
              such as natural disasters or emergencies.
            </Text>
          </View>

          {/* Section 7: Prohibited Activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
                <Ionicons name="warning" size={responsiveValue(20, 24, 18)} color="#ffc107" />
              </View>
              <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
            </View>
            
            <Text style={styles.paragraph}>You agree not to:</Text>
            
            <View style={styles.listItem}>
              <Ionicons name="warning" size={responsiveValue(16, 18, 14)} color="#ffc107" style={styles.listIcon} />
              <Text style={styles.listText}>
                Use the platform for unlawful or fraudulent purposes.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="warning" size={responsiveValue(16, 18, 14)} color="#ffc107" style={styles.listIcon} />
              <Text style={styles.listText}>
                Post false or misleading information.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="warning" size={responsiveValue(16, 18, 14)} color="#ffc107" style={styles.listIcon} />
              <Text style={styles.listText}>
                Harass, abuse, or harm other Users or Chefs.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="warning" size={responsiveValue(16, 18, 14)} color="#ffc107" style={styles.listIcon} />
              <Text style={styles.listText}>
                Violate any intellectual property or proprietary rights.
              </Text>
            </View>
          </View>

          {/* Section 8: Content and Intellectual Property */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(111, 66, 193, 0.1)' }]}>
                <Ionicons name="copyright" size={responsiveValue(20, 24, 18)} color="#6f42c1" />
              </View>
              <Text style={styles.sectionTitle}>8. Content and Intellectual Property</Text>
            </View>
            
            <Text style={styles.subsectionTitle}>a. User-Generated Content:</Text>
            <Text style={styles.paragraph}>
              You may upload reviews, comments, or other content to the platform. By doing so, you grant
              shefscloud.com a non-exclusive, royalty-free license to use, modify, or distribute your content.
            </Text>
            
            <Text style={styles.subsectionTitle}>b. Ownership:</Text>
            <Text style={styles.paragraph}>
              All materials on the Website, including logos, text, and images, are owned by shefscloud.com or
              its licensors. Unauthorized use is prohibited.
            </Text>
          </View>

          {/* Section 9: Limitation of Liability */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(232, 62, 140, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={responsiveValue(20, 24, 18)} color="#e83e8c" />
              </View>
              <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
            </View>
            
            <Text style={styles.paragraph}>Shefscloud.com is not liable for:</Text>
            
            <View style={styles.listItem}>
              <Ionicons name="shield-checkmark" size={responsiveValue(16, 18, 14)} color="#e83e8c" style={styles.listIcon} />
              <Text style={styles.listText}>
                Food quality, preparation, or safety issues.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="shield-checkmark" size={responsiveValue(16, 18, 14)} color="#e83e8c" style={styles.listIcon} />
              <Text style={styles.listText}>
                Losses arising from disputes between Users and Shefs.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="shield-checkmark" size={responsiveValue(16, 18, 14)} color="#e83e8c" style={styles.listIcon} />
              <Text style={styles.listText}>
                Indirect, incidental, or consequential damages resulting from the use of the platform.
              </Text>
            </View>
          </View>

          {/* Section 10: Privacy */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(32, 201, 151, 0.1)' }]}>
                <Ionicons name="eye" size={responsiveValue(20, 24, 18)} color="#20c997" />
              </View>
              <Text style={styles.sectionTitle}>10. Privacy</Text>
            </View>
            
            <Text style={styles.paragraph}>
              Your use of the Website is governed by our Privacy Policy. Please review it to understand how we
              collect, use, and protect your information.
            </Text>
          </View>

          {/* Section 11: Governing Law */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(108, 117, 125, 0.1)' }]}>
                <Ionicons name="business" size={responsiveValue(20, 24, 18)} color="#6c757d" />
              </View>
              <Text style={styles.sectionTitle}>11. Governing Law</Text>
            </View>
            
            <Text style={styles.paragraph}>
              These Terms are governed by the laws of the country. Any disputes shall be resolved in the courts
              of the country.
            </Text>
          </View>

          {/* Section 12: Changes to These Terms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(23, 162, 184, 0.1)' }]}>
                <Ionicons name="refresh" size={responsiveValue(20, 24, 18)} color="#17a2b8" />
              </View>
              <Text style={styles.sectionTitle}>12. Changes to These Terms</Text>
            </View>
            
            <Text style={styles.paragraph}>
              We may update these Terms from time to time. Continued use of the Website after changes are posted
              constitutes your acceptance of the revised Terms.
            </Text>
          </View>

          {/* Section 13: Contact Us */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(179, 0, 0, 0.1)' }]}>
                <Ionicons name="mail" size={responsiveValue(20, 24, 18)} color="#b30000" />
              </View>
              <Text style={styles.sectionTitle}>13. Contact Us</Text>
            </View>
            <Text style={styles.paragraph}>
              For questions or concerns regarding these Terms, contact us at:
            </Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={responsiveValue(20, 24, 18)} color="#b30000" />
              </View>
              <Text style={styles.contactText}>info@shefscloud.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={responsiveValue(20, 24, 18)} color="#b30000" />
              </View>
              <Text style={styles.contactText}>+92 320 2024035</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(179, 0, 0, 0.1)',
  },
  backButton: {
    padding: responsiveValue(8, 10, 6),
  },
  backButtonCircle: {
    width: responsiveValue(40, 50, 36),
    height: responsiveValue(40, 50, 36),
    borderRadius: responsiveValue(20, 25, 18),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  headerPlaceholder: {
    width: responsiveValue(40, 50, 36),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: responsiveValue(12, 16, 10),
    padding: responsiveValue(16, 20, 14),
    marginBottom: responsiveHeight(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  iconContainer: {
    width: responsiveValue(36, 42, 32),
    height: responsiveValue(36, 42, 32),
    borderRadius: responsiveValue(10, 12, 8),
    backgroundColor: 'rgba(179, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveValue(10, 12, 8),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  effectiveDate: {
    fontSize: responsiveFontSize(12),
    color: '#666',
    marginBottom: responsiveHeight(1.5),
    fontStyle: 'italic',
  },
  paragraph: {
    fontSize: responsiveFontSize(14),
    color: '#444',
    lineHeight: responsiveFontSize(20),
    marginBottom: responsiveHeight(1.5),
  },
  subsectionTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#2d2d2d',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(0.5),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(1),
  },
  listIcon: {
    marginRight: responsiveValue(8, 10, 6),
    marginTop: responsiveValue(2, 3, 1),
  },
  listText: {
    fontSize: responsiveFontSize(14),
    color: '#444',
    flex: 1,
    lineHeight: responsiveFontSize(20),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveHeight(1),
    padding: responsiveValue(10, 12, 8),
    backgroundColor: 'rgba(179, 0, 0, 0.05)',
    borderRadius: responsiveValue(8, 10, 6),
  },
  contactIcon: {
    marginRight: responsiveValue(10, 12, 8),
  },
  contactText: {
    fontSize: responsiveFontSize(14),
    color: '#b30000',
    fontWeight: '500',
  },
  footerSpacer: {
    height: responsiveHeight(5),
  },
});