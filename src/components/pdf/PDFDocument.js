import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import NotoSansDevanagariRegular from '../../assets/fonts/NotoSansDevanagari-Regular.ttf';
import NotoSansDevanagariBold from '../../assets/fonts/NotoSansDevanagari-Bold.ttf';

Font.register({
  family: 'NotoSansDevanagari',
  fonts: [
    { src: NotoSansDevanagariRegular, fontWeight: 'normal' },
    { src: NotoSansDevanagariBold, fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: 'NotoSansDevanagari', position: 'relative' },
  imageContainer: { position: 'relative', width: '100%', height: '100%' },
  backgroundImage: { width: '100%', height: '100%', opacity: 1.0 },
  content: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 80, paddingTop: 10 },
  header: { fontSize: 17, textAlign: 'center', marginBottom: 0, textDecorationColor: '#5C2D6E', fontWeight: 'bold' },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginTop: 1, marginBottom: 1, color: '#5C2D6E' },
  line: { flexDirection: 'row', alignItems: 'flex-start' },
  label: { fontSize: 15, width: '26%' },
  value: { fontSize: 15, width: '70%', marginLeft: '10px' },
  colon: { fontSize: 15, marginRight: 3 },
  additionalImageContainer: { position: 'absolute', top: 150, right: 45, width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },
  additionalImage: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 },
  imagePreviewContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 3, marginTop: 25 },
  imagePreview: { width: 60, height: 60 },
});

const PDFDocument = ({ formData, templateId, additionalImage, imagePreview, centerText }) => {
  const LABELS_EN = {
    नाव: 'Name',
    जन्मतारीख: 'Date of Birth',
    जन्मवेळ: 'Time of Birth',
    जन्मस्थान: 'Place of Birth',
    जन्मनाव: 'Birth Name',
    धर्म: 'Religion',
    जात: 'Caste',
    कुलदैवत: 'Family Deity',
    देवक: 'Devak',
    गोत्र: 'Gotra',
    नक्षत्र: 'Nakshatra',
    रास: 'Rashi',
    गण: 'Gana',
    नाडी: 'Nadi',
    ऊंची: 'Height',
    रंग: 'Complexion',
    रक्तगट: 'Blood Group',
    शिक्षण: 'Education',
    नोकरी: 'Profession',
    पगार: 'Annual Income',
    इतर_माहिती: 'Other Information',
    वडिलांचे_नाव: "Father's Name",
    वडिलांचा_व्यवसाय: "Father's Occupation",
    आईचे_नाव: "Mother's Name",
    बहीण: 'Sister(s)',
    भाऊ: 'Brother(s)',
    मामा: 'Maternal Uncle(s)',
    दाजी: 'Brother-in-law(s)',
    चूलते: 'Paternal Uncle(s)',
    नातेसंबंध: 'Relatives',
    पत्ता: 'Address',
    मोबाईल_नं: 'Mobile Number',
  };

  const getBackgroundImage = () => {
    const id = String(templateId);
    switch (id) {
      case "1": return { src: "Marriage Biodata Templatep-01.png", style: { top: 180, right: 50, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
      case "2": return { src: "Marriage Biodata Templatep-02.png", style: { top: 180, right: 50, borderWidth: 2, borderColor: '#a15740', borderRadius: 10 } };
      case "3": return { src: "Marriage Biodata Templatep-03.png", style: { top: 180, right: 50, borderWidth: 2, borderColor: '#cebfac', borderRadius: 10 } };
      case "4": return { src: "Marriage Biodata Templatep-04.png", style: { top: 180, right: 52, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
      case "5": return { src: "Marriage Biodata Templatep-05.png", style: { top: 180, right: 40, borderWidth: 2, borderColor: '#B83D52', borderRadius: 10 } };
      case "6": return { src: "Marriage Biodata Templatep-06.png", style: { top: 180, right: 40, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
      case "7": return { src: "Marriage Biodata Templatep-07.png", style: { top: 185, right: 60, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
      case "8": return { src: "Marriage Biodata Templatep-08.png", style: { top: 180, right: 40, borderWidth: 2, borderColor: '#5C2D6E', borderRadius: 10 } };
      case "9": return { src: "Marriage Biodata Templatep-09.png", style: { top: 185, right: 52, borderWidth: 2, borderColor: '#6B5E65', borderRadius: 10 } };
      case "10": return { src: "Marriage Biodata Templatep-10.png", style: { top: 180, right: 40, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
      case "11": return { src: "Marriage Biodata Templatep-11.png", style: { top: 210, right: 40, borderWidth: 2, borderColor: '#e8bcc0', borderRadius: 10 } };
      case "12": return { src: "Marriage Biodata Templatep-12.png", style: { top: 180, right: 40, borderWidth: 2, borderColor: '#c682aa', borderRadius: 10 } };
      default: return { src: "Marriage Biodata Templatep-01.png", style: { top: 180, right: 50, borderWidth: 2, borderColor: '#C9A86C', borderRadius: 10 } };
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const { day, month, year, varr } = dateObj;
    return `${varr} ${day}-${month}-${year}`;
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    const { hour, minute, period } = timeObj;
    return `${period} ${hour}:${String(minute).padStart(2, '0')}`;
  };

  const formatValue = (value, key) => {
    switch (key) {
      case 'जन्मतारीख': return formatDate(value);
      case 'जन्मवेळ': return formatTime(value);
      case 'बहीण':
      case 'भाऊ':
      case 'मामा':
      case 'चूलते':
      case 'दाजी':
        return value.some(item => item.value) ? value.map(item => item.value).join(', ') : '';
      default: return value && value.value ? value.value : '';
    }
  };

  const formatLabel = (label) => {
    const raw = String(label || '');
    const key = raw.replace(/ /g, '_');
    return (LABELS_EN[key] || LABELS_EN[raw] || raw).replace(/_/g, ' ');
  };
  const { src: backgroundImage, style: additionalImageStyle } = getBackgroundImage();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.imageContainer}>
          <Image style={styles.backgroundImage} src={backgroundImage} />
          <View style={styles.content}>
            <View style={styles.imagePreviewContainer}>
              <Image style={styles.imagePreview} src={imagePreview} />
            </View>
            <Text style={styles.sectionHeader}>{centerText}</Text>
            <Text style={styles.sectionHeader}>Biodata</Text>
            {additionalImage && (
              <View style={{ ...styles.additionalImageContainer, ...additionalImageStyle }}>
                <Image style={styles.additionalImage} src={additionalImage} />
              </View>
            )}
            {Object.entries(formData).map(([key, value]) =>
              !['वडिलांचे_नाव', 'वडिलांचा_व्यवसाय', 'आईचे_नाव', 'बहीण', 'भाऊ', 'मामा', 'चूलते', 'दाजी', 'पत्ता', 'मोबाईल_नं', 'नातेसंबंध'].includes(key) && formatValue(value, key) ? (
                <View key={key} style={styles.line}>
                  <Text style={styles.label}>{formatLabel(value.title || key)}</Text>
                  <Text style={styles.colon}>: </Text>
                  <Text style={styles.value}>{formatValue(value, key)}</Text>
                </View>
              ) : null
            )}
            <Text style={styles.sectionHeader}>Family Details</Text>
            {Object.entries(formData).map(([key, value]) =>
              ['वडिलांचे_नाव', 'वडिलांचा_व्यवसाय', 'आईचे_नाव', 'बहीण', 'भाऊ', 'मामा', 'चूलते',  'दाजी', 'नातेसंबंध'].includes(key) && formatValue(value, key) ? (
                <View key={key} style={styles.line}>
                  <Text style={styles.label}>{formatLabel(value.title || key)}</Text>
                  <Text style={styles.colon}>: </Text>
                  <Text style={styles.value}>{formatValue(value, key)}</Text>
                </View>
              ) : null
            )}
            <Text style={styles.sectionHeader}>Contact</Text>
            {Object.entries(formData).map(([key, value]) =>
              ['पत्ता', 'मोबाईल_नं'].includes(key) && formatValue(value, key) ? (
                <View key={key} style={styles.line}>
                  <Text style={styles.label}>{formatLabel(value.title || key)}</Text>
                  <Text style={styles.colon}>: </Text>
                  <Text style={styles.value}>{formatValue(value, key)}</Text>
                </View>
              ) : null
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
