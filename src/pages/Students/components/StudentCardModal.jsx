import React, { useState } from 'react';
import { Modal, Button, notification } from 'antd';
import dayjs from 'dayjs';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { useTheme } from '../../../theme';

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

function StudentIdCardDocument({ student, palette }) {
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

export default function StudentCardModal({ isOpen, onClose, student }) {
  const { palette } = useTheme();
  const [exporting, setExporting] = useState(false);

  if (!student) return null;

  const handleDownload = async () => {
    setExporting(true);
    try {
      const blob = await pdf(
        <StudentIdCardDocument student={student} palette={palette} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Student_Card_${student.name.replace(/\s+/g, '_')}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      notification.success({ message: 'Identity card exported successfully!' });
    } catch (err) {
      console.error('Export failed:', err);
      notification.error({ message: 'Failed to export card as PDF.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Identity Card Preview"
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          loading={exporting}
          onClick={handleDownload}
          className="btn-primary border-0"
        >
          Download PDF
        </Button>,
      ]}
      width={500}
      centered
      className="id-card-modal-wrap"
    >
      <div
        className="id-card-container mx-auto flex flex-col bg-[var(--card)] rounded-xl border border-[var(--primary)] shadow-2xl relative overflow-hidden"
        style={{ width: '100%', maxWidth: '440px', aspectRatio: '1.58 / 1' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--primary)]"></div>
        <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-[var(--primary)] opacity-10 rounded-full"></div>

        {/* Card Header */}
        <div className="w-full text-center pt-4 pb-2 border-b border-[var(--border)] border-opacity-30 bg-[var(--muted)] bg-opacity-30">
          <h2 className="text-sm font-bold tracking-[0.25em] text-[var(--primary)] uppercase m-0">
            Student Identity Card
          </h2>
        </div>

        <div className="flex p-4 h-full">
          {/* Profile Section */}
          <div className="flex flex-col items-center mr-6 border-r border-[var(--border)] pr-6 border-opacity-30">
            <div className="w-20 h-24 rounded bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mb-2 overflow-hidden shadow-inner">
              <span className="text-3xl font-bold text-[var(--primary)] text-opacity-30">
                {student.name.charAt(0)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono font-bold text-[var(--primary)] m-0">
                {student.admission_number}
              </p>
              <p className="text-[8px] font-medium text-[var(--muted-foreground)] uppercase">
                Student ID
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                Full Name
              </span>
              <span className="text-sm font-bold text-[var(--foreground)] leading-tight">
                {student.name}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                Father's Name
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)] opacity-90">
                {student.father_name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                  D.O.B
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {student.dob
                    ? dayjs(student.dob).format('MMM DD, YYYY')
                    : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                  Class
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {student.class_name || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                Address
              </span>
              <span className="text-[10px] font-medium text-[var(--foreground)] text-opacity-70 leading-tight line-clamp-2">
                {student.address}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-auto pb-2 w-full text-center">
          <p className="text-[8px] font-bold tracking-tighter text-[var(--muted-foreground)] uppercase opacity-40">
            School Management System - Authorized ID Card
          </p>
        </div>
      </div>
    </Modal>
  );
}
