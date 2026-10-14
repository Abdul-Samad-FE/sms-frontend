import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

/**
 * Detailed Marks Certificate (DMC) PDF. Theme-aware: `palette` carries concrete
 * hex values resolved from CSS variables (react-pdf can't read `var(--…)`).
 *
 * @param {{ dmc: object, palette: object }} props
 */
const build = (p) =>
  StyleSheet.create({
    page: {
      padding: 28,
      backgroundColor: '#ffffff',
      fontSize: 10,
      color: '#111827',
    },
    topBar: { height: 6, backgroundColor: p.primary, marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    logo: {
      width: 54,
      height: 54,
      borderWidth: 1,
      borderColor: p.primary,
      borderStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    logoText: { fontSize: 8, color: p.primary, fontFamily: 'Helvetica-Bold' },
    schoolName: {
      fontSize: 16,
      fontFamily: 'Helvetica-Bold',
      color: p.primary,
    },
    schoolMeta: { fontSize: 8, color: '#6b7280', marginTop: 2 },
    title: {
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginTop: 6,
      marginBottom: 2,
    },
    subtitle: {
      textAlign: 'center',
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 10,
    },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    infoCell: { width: '50%', marginBottom: 4 },
    infoLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase' },
    infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
    table: { borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'solid' },
    tr: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      borderBottomStyle: 'solid',
    },
    th: {
      flex: 1,
      padding: 5,
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      backgroundColor: '#f3f4f6',
      textTransform: 'uppercase',
    },
    td: { flex: 1, padding: 5, fontSize: 9 },
    cSubject: { flex: 3 },
    summary: { flexDirection: 'row', marginTop: 12 },
    summaryBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderStyle: 'solid',
      padding: 8,
      marginRight: 8,
      alignItems: 'center',
    },
    summaryLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase' },
    summaryValue: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: p.primary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 36,
    },
    sign: { alignItems: 'center', width: 160 },
    signLine: {
      borderTopWidth: 1,
      borderTopColor: '#111827',
      borderTopStyle: 'solid',
      width: 140,
      marginBottom: 3,
    },
    signLabel: { fontSize: 8, color: '#6b7280' },
    qrBox: {
      width: 64,
      height: 64,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrText: { fontSize: 5, color: '#9ca3af', textAlign: 'center', padding: 2 },
    verify: {
      fontSize: 6,
      color: '#9ca3af',
      marginTop: 2,
      textAlign: 'center',
    },
  });

function Info({ label, value, styles }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function DmcDocument({ dmc, palette }) {
  const s = build(palette);
  const { school, student, exam, subjects } = dmc;
  return (
    <Document title={`DMC - ${student.name}`} author="School Management System">
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />

        {/* School header */}
        <View style={s.header}>
          <View style={s.logo}>
            <Text style={s.logoText}>LOGO</Text>
          </View>
          <View>
            <Text style={s.schoolName}>{school.name}</Text>
            <Text style={s.schoolMeta}>
              {school.address || ''}
              {school.emis_code ? `  |  EMIS: ${school.emis_code}` : ''}
            </Text>
          </View>
        </View>

        <Text style={s.title}>Detailed Marks Certificate</Text>
        <Text style={s.subtitle}>
          {exam.name}
          {exam.academic_year ? `  •  ${exam.academic_year}` : ''}
        </Text>

        {/* Student info */}
        <View style={s.infoRow}>
          <Info label="Student Name" value={student.name} styles={s} />
          <Info label="Father's Name" value={student.father_name} styles={s} />
          <Info
            label="Roll / Admission No"
            value={student.admission_number}
            styles={s}
          />
          <Info
            label="Class / Section"
            value={`${student.class_name || ''}${student.section ? ` - ${student.section}` : ''}`}
            styles={s}
          />
          <Info
            label="Registration No"
            value={student.admission_number}
            styles={s}
          />
          <Info label="Exam Type" value={exam.exam_type} styles={s} />
        </View>

        {/* Marks table */}
        <View style={s.table}>
          <View style={s.tr}>
            <Text style={[s.th, s.cSubject]}>Subject</Text>
            <Text style={s.th}>Total</Text>
            <Text style={s.th}>Obtained</Text>
            <Text style={s.th}>Grade</Text>
            <Text style={s.th}>Result</Text>
          </View>
          {subjects.map((row) => (
            <View style={s.tr} key={row.subject_id}>
              <Text style={[s.td, s.cSubject]}>
                {row.subject_name}
                {row.subject_code ? ` (${row.subject_code})` : ''}
              </Text>
              <Text style={s.td}>{row.total_marks}</Text>
              <Text style={s.td}>
                {row.is_absent ? 'ABS' : row.obtained_marks}
              </Text>
              <Text style={s.td}>{row.is_absent ? '—' : row.grade || '—'}</Text>
              <Text style={s.td}>{row.passed ? 'Pass' : 'Fail'}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={s.summary}>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Obtained / Total</Text>
            <Text style={s.summaryValue}>
              {dmc.obtained_marks}/{dmc.total_marks}
            </Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Percentage</Text>
            <Text style={s.summaryValue}>{dmc.percentage}%</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Grade</Text>
            <Text style={s.summaryValue}>{dmc.grade || '—'}</Text>
          </View>
          <View style={[s.summaryBox, { marginRight: 0 }]}>
            <Text style={s.summaryLabel}>Position</Text>
            <Text style={s.summaryValue}>{dmc.position ?? '—'}</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 9 }}>
            Status: {dmc.status === 'pass' ? 'PASS' : 'FAIL'}
            {dmc.remarks ? `   •   Remarks: ${dmc.remarks}` : ''}
          </Text>
        </View>

        {/* Footer: signature + QR-ready verification */}
        <View style={s.footer}>
          <View style={s.sign}>
            <View style={s.signLine} />
            <Text style={s.signLabel}>Principal&apos;s Signature</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={s.qrBox}>
              <Text style={s.qrText}>QR verification{'\n'}(coming soon)</Text>
            </View>
            <Text style={s.verify}>{dmc.verification_code}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
