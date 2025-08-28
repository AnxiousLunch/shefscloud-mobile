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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@shefscloud.com');
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
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
                <Ionicons name="shield-checkmark" size={responsiveValue(24, 28, 20)} color="#b30000" />
              </View>
              <Text style={styles.sectionTitle}>Privacy Policy</Text>
            </View>
            <Text style={styles.effectiveDate}>Effective Date: 01 Jan 2025</Text>
            <Text style={styles.paragraph}>
              Welcome to our website. At Shefs Cloud, we are committed to protecting your privacy and ensuring
              the security of your personal information. This Privacy Policy outlines how we collect, use, and
              share your information when you visit or interact with our Website.
            </Text>
          </View>

          {/* Section 1: Information We Collect */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.1)' }]}>
                <Ionicons name="server" size={responsiveValue(20, 24, 18)} color="#007bff" />
              </View>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            </View>
            
            <Text style={styles.subsectionTitle}>a. Personal Information:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#007bff" style={styles.listIcon} />
              <Text style={styles.listText}>
                Name, email address, phone number, delivery address, payment details (if provided).
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>b. Non-Personal Information:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#007bff" style={styles.listIcon} />
              <Text style={styles.listText}>
                Browser type, IP address, device type, operating system, and browsing activity on our Website.
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>c. User-Generated Content:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#007bff" style={styles.listIcon} />
              <Text style={styles.listText}>
                Reviews, ratings, or comments submitted on the Website.
              </Text>
            </View>
          </View>

          {/* Section 2: How We Use Your Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(40, 167, 69, 0.1)' }]}>
                <Ionicons name="settings" size={responsiveValue(20, 24, 18)} color="#28a745" />
              </View>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>Process and deliver your food orders.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>Provide customer support and resolve disputes.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>Improve our Website, products, and services.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>
                Send promotional materials and updates (with your consent).
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={responsiveValue(16, 18, 14)} color="#28a745" style={styles.listIcon} />
              <Text style={styles.listText}>
                Analyze usage trends to enhance user experience.
              </Text>
            </View>
          </View>

          {/* Section 3: Sharing Your Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(108, 117, 125, 0.1)' }]}>
                <Ionicons name="share-social" size={responsiveValue(20, 24, 18)} color="#6c757d" />
              </View>
              <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
            </View>
            
            <Text style={styles.paragraph}>
              We do not sell your personal information. However, we may share your information with:
            </Text>
            
            <View style={styles.listItem}>
              <Ionicons name="people" size={responsiveValue(16, 18, 14)} color="#6c757d" style={styles.listIcon} />
              <Text style={styles.listText}>
                <Text style={styles.boldText}>Service Providers:</Text> Delivery partners, payment gateways, and IT support providers.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="shield-checkmark" size={responsiveValue(16, 18, 14)} color="#6c757d" style={styles.listIcon} />
              <Text style={styles.listText}>
                <Text style={styles.boldText}>Legal Authorities:</Text> If required by law or to protect our legal rights.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="people" size={responsiveValue(16, 18, 14)} color="#6c757d" style={styles.listIcon} />
              <Text style={styles.listText}>
                <Text style={styles.boldText}>Business Partners:</Text> To offer promotions or joint services (only with your consent).
              </Text>
            </View>
          </View>

          {/* Section 4: Cookies and Tracking Technologies */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(253, 126, 20, 0.1)' }]}>
                <Ionicons name="nutrition" size={responsiveValue(20, 24, 18)} color="#fd7e14" />
              </View>
              <Text style={styles.sectionTitle}>4. Cookies and Tracking Technologies</Text>
            </View>
            
            <Text style={styles.paragraph}>We use cookies and similar technologies to:</Text>
            
            <View style={styles.listItem}>
              <Ionicons name="nutrition" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>
                Remember your preferences.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="nutrition" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>
                Track Website usage for analytics purposes.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="nutrition" size={responsiveValue(16, 18, 14)} color="#fd7e14" style={styles.listIcon} />
              <Text style={styles.listText}>
                Deliver targeted advertisements.
              </Text>
            </View>
            
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                You can manage cookie preferences through your browser settings.
              </Text>
            </View>
          </View>

          {/* Section 5: Data Security */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(32, 201, 151, 0.1)' }]}>
                <Ionicons name="lock-closed" size={responsiveValue(20, 24, 18)} color="#20c997" />
              </View>
              <Text style={styles.sectionTitle}>5. Data Security</Text>
            </View>
            
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational measures to protect your personal
              information from unauthorized access, loss, or misuse.
            </Text>
          </View>

          {/* Section 6: Your Rights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}>
                <Ionicons name="person-check" size={responsiveValue(20, 24, 18)} color="#dc3545" />
              </View>
              <Text style={styles.sectionTitle}>6. Your Rights</Text>
            </View>
            
            <Text style={styles.paragraph}>
              Depending on your jurisdiction, you may have the following rights:
            </Text>
            
            <View style={styles.listItem}>
              <Ionicons name="person-check" size={responsiveValue(16, 18, 14)} color="#dc3545" style={styles.listIcon} />
              <Text style={styles.listText}>
                Access and update your personal information.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="person-check" size={responsiveValue(16, 18, 14)} color="#dc3545" style={styles.listIcon} />
              <Text style={styles.listText}>
                Request deletion of your data.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="person-check" size={responsiveValue(16, 18, 14)} color="#dc3545" style={styles.listIcon} />
              <Text style={styles.listText}>
                Opt-out of marketing communications.
              </Text>
            </View>
            
            <View style={styles.listItem}>
              <Ionicons name="person-check" size={responsiveValue(16, 18, 14)} color="#dc3545" style={styles.listIcon} />
              <Text style={styles.listText}>
                File a complaint with a data protection authority.
              </Text>
            </View>
            
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                To exercise these rights, please contact us at info@shefscloud.com.
              </Text>
            </View>
          </View>

          {/* Section 7: Third-Party Links */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
                <Ionicons name="link" size={responsiveValue(20, 24, 18)} color="#ffc107" />
              </View>
              <Text style={styles.sectionTitle}>7. Third-Party Links</Text>
            </View>
            
            <Text style={styles.paragraph}>
              Our Website may contain links to third-party websites. We are not responsible for their privacy
              practices, so please review their policies.
            </Text>
          </View>

          {/* Section 8: Children's Privacy */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(111, 66, 193, 0.1)' }]}>
                <Ionicons name="heart" size={responsiveValue(20, 24, 18)} color="#6f42c1" />
              </View>
              <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            </View>
            
            <Text style={styles.paragraph}>
              Our Website is not intended for children under the age of 13. We do not knowingly collect
              personal information from children.
            </Text>
          </View>

          {/* Section 9: Updates to This Policy */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(23, 162, 184, 0.1)' }]}>
                <Ionicons name="refresh" size={responsiveValue(20, 24, 18)} color="#17a2b8" />
              </View>
              <Text style={styles.sectionTitle}>9. Updates to This Policy</Text>
            </View>
            
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. Any changes will be posted with a revised
              effective date.
            </Text>
          </View>

          {/* Section 10: Contact Us */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(179, 0, 0, 0.1)' }]}>
                <Ionicons name="mail" size={responsiveValue(20, 24, 18)} color="#b30000" />
              </View>
              <Text style={styles.sectionTitle}>10. Contact Us</Text>
            </View>
            
            <Text style={styles.paragraph}>
              If you have any questions about this Privacy Policy, please contact us:
            </Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={responsiveValue(20, 24, 18)} color="#b30000" />
              </View>
              <Text style={styles.contactText}>info@shefscloud.com</Text>
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
  boldText: {
    fontWeight: '600',
  },
  noteBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: responsiveValue(8, 10, 6),
    padding: responsiveValue(12, 14, 10),
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: responsiveHeight(1),
  },
  noteText: {
    fontSize: responsiveFontSize(14),
    color: '#856404',
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