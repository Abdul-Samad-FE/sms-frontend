import React from 'react';
import dayjs from 'dayjs';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// Card dimensions in PDF points (≈ ID-card aspect ratio 1.58 : 1).
const CARD_W = 440;
const CARD_H = 278;

/**
 * Build the PDF stylesheet from the active theme palette so the exported card
 * tracks light/dark instead of hardcoding colours (repo rule: colours are
 * theme tokens). `palette` values are concrete hex strings read from the CSS
 * variables, which is exactly what @react-pdf needs (it renders outside the DOM
 * and can't resolve `var(--…)`).
 */
const buildStyles = (palette) =>
  StyleSheet.create({
    page: {
      backgroundColor: palette.panel,
      flexDirection: 'column',
    },
    topBar: {
      height: 6,
      backgroundColor: palette.primary,
    },
    header: {
      paddingVertical: 8,
      textAlign: 'center',
      backgroundColor: palette.panelAlt,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      borderBottomStyle: 'solid',
    },
    headerText: {
      fontSize: 9,
      color: palette.primary,
      fontFamily: 'Helvetica-Bold',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    body: {
      flexDirection: 'row',
      padding: 16,
      flexGrow: 1,
    },
    left: {
      alignItems: 'center',
      paddingRight: 16,
      marginRight: 16,
      borderRightWidth: 1,
      borderRightColor: palette.border,
      borderRightStyle: 'solid',
    },
    avatar: {
      width: 64,
      height: 80,
      backgroundColor: palette.panelAlt,
      borderWidth: 1,
      borderColor: palette.border,
      borderStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    avatarInitial: {
      fontSize: 30,
      color: palette.primary,
      fontFamily: 'Helvetica-Bold',
    },
    idNum: {
      fontSize: 9,
      color: palette.primary,
      fontFamily: 'Helvetica-Bold',
      textAlign: 'center',
    },
    idLabel: {
      fontSize: 6,
      color: palette.inkMuted,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 1,
    },
    right: {
      flexGrow: 1,
    },
    label: {
      fontSize: 7,
      color: palette.inkMuted,
      textTransform: 'uppercase',
      marginBottom: 1,
    },
    value: {
      fontSize: 10,
      color: palette.ink,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 8,
    },
    grid: {
      flexDirection: 'row',
    },
    gridCol: {
      flexGrow: 1,
      flexBasis: '50%',
    },
    addressValue: {
      fontSize: 9,
      color: palette.ink,
      marginBottom: 8,
    },
    footer: {
      paddingBottom: 8,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 6,
      color: palette.inkMuted,
      textTransform: 'uppercase',
    },
  });

export default function StudentIdCardDocument({ student, palette }) {
  const styles = buildStyles(palette);
  return (
    <Document
      title={`Student Card - ${student.name}`}
      author="School Management System"
    >
      <Page size={[CARD_W, CARD_H]} style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          <Text style={styles.headerText}>Student Identity Card</Text>
        </View>

        <View style={styles.body}>
          {/* Profile */}
          <View style={styles.left}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {student.name?.charAt(0) ?? '?'}
              </Text>
            </View>
            <Text style={styles.idNum}>{student.admission_number}</Text>
            <Text style={styles.idLabel}>Student ID</Text>
          </View>

          {/* Info */}
          <View style={styles.right}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{student.name}</Text>

            <Text style={styles.label}>Father&apos;s Name</Text>
            <Text style={styles.value}>{student.father_name}</Text>

            <View style={styles.grid}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>D.O.B</Text>
                <Text style={styles.value}>
                  {student.dob
                    ? dayjs(student.dob).format('MMM DD, YYYY')
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Class</Text>
                <Text style={styles.value}>{student.class_name || 'N/A'}</Text>
              </View>
            </View>

            <Text style={styles.label}>Address</Text>
            <Text style={styles.addressValue}>{student.address}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            School Management System - Authorized ID Card
          </Text>
        </View>
      </Page>
    </Document>
  );
}
