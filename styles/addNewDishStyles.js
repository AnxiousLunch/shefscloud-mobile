import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodTypeButton: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  foodTypeButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  foodTypeIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  foodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sideItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    marginLeft: 12,
  },
  switchButtons: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchButtonActive: {
    backgroundColor: '#dc2626',
  },
  switchButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  switchButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  multiSelectContainer: {
    marginTop: 8,
  },
  multiSelect: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  multiSelectPlaceholder: {
    color: '#64748b',
  },
  multiSelectSelectedText: {
    color: '#333',
  },
  multiSelectDropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  multiSelectItemText: {
    color: '#333',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#fef2f2',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tagText: {
    color: '#dc2626',
    fontSize: 12,
  },
  servingSizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addServingButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dc2626',
    borderRadius: 20,
  },
  addServingButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  servingSizeTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    flex: 1,
    padding: 12,
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    color: '#333',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    color: '#333',
  },
  dietaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dietaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  dishImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addPhotoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayButtonActive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ff8c00',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayButtonTextActive: {
    color: '#ff8c00',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#888',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dateInput: {
    width: '48%',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addPhotoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoNote: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  citiesList: {
    maxHeight: 200,
    marginTop: 10,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cityText: {
    marginLeft: 10,
    fontSize: 16,
  },
  selectedCitiesContainer: {
    marginTop: 10,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedCitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityTag: {
    backgroundColor: '#FFD700',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  cityTagText: {
    color: '#333',
    fontSize: 14,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expirationButton: {
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  expirationButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expirationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
    width: 60,
    textAlign: 'center',
  },
  packagingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  packagingOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  packagingOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9D9',
  },
  packagingText: {
    fontSize: 16,
  },
  packagingTextSelected: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  radioText: {
    color: '#64748b',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#dc2626',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: '#333',
  },
  unit: {
    paddingRight: 12,
    color: '#64748b',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});