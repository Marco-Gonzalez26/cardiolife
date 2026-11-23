import React from 'react'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer'

export interface PrescriptionPdfLine {
  /** Denominación común internacional (DCI): va primero según la norma */
  genericName: string
  /** Nombre comercial, si es distinto del genérico */
  brand?: string | null
  /** "5 mg" */
  strength: string
  form: string
  route?: string | null
  /** "30 (treinta) tabletas" */
  quantity: string
  /** Indicación completa para el paciente */
  instructions: string
}

export interface PrescriptionPdfData {
  doctor: {
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    specialty?: string | null
    license?: string | null
    identification?: string | null
  }
  patient: {
    name: string
    ci: string
    age?: string | null
    nextAppointment?: string | null
  }
  /** DD/MM/AAAA */
  date: string
  diagnosis?: { text?: string | null; code?: string | null } | null
  lines: PrescriptionPdfLine[]
  /**
   * Si la receta se firmó electrónicamente, el pie muestra el QR de verificación con el nombre, el RUC, la
   * especialidad y el registro profesional del médico, en lugar de la línea para firma manuscrita. `signerName` y `signedAt` ya no se
   * imprimen: la firma electrónica queda dentro del PDF (panel de firmas).
   */
  signature?: {
    signerName: string
    signedAt: string
    /** QR (data URI) que lleva a la página pública de verificación */
    qrDataUrl?: string
    verifyUrl?: string
  } | null
  annulled?: boolean
}

const styles = StyleSheet.create({
  page: { padding: 18, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  container: { flexDirection: 'row', gap: 14 },
  prescription: {
    flex: 1,
    border: '2px solid #000',
    padding: 12,
    position: 'relative'
  },
  watermark: {
    position: 'absolute',
    top: 150,
    left: 110,
    opacity: 0.06,
    width: 200,
    height: 200
  },
  annulled: {
    position: 'absolute',
    top: 170,
    left: 40,
    fontSize: 54,
    color: '#b91c1c',
    opacity: 0.25,
    transform: 'rotate(-20deg)',
    fontFamily: 'Helvetica-Bold'
  },
  content: { position: 'relative' },
  header: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: '1px solid #000',
    alignItems: 'flex-start'
  },
  logo: { width: 52, height: 52, marginRight: 10 },
  headerText: { flex: 1 },
  doctorName: {
    fontSize: 15,
    fontFamily: 'Times-Italic',
    color: '#1e3a8a',
    marginBottom: 3
  },
  contactInfo: { fontSize: 8.5, marginBottom: 1.5, color: '#222' },
  placeDate: { fontSize: 9, color: '#000', marginBottom: 4, textAlign: 'right' },
  patientBox: {
    borderBottom: '1px solid #bbb',
    paddingBottom: 4,
    marginBottom: 6
  },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between' },
  patientLine: { fontSize: 9, color: '#000', marginBottom: 1.5 },
  bold: { fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginBottom: 5, color: '#000' },
  contentArea: { minHeight: 215, marginBottom: 8 },
  item: { marginBottom: 7, paddingLeft: 4 },
  itemName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 1 },
  itemDetail: { fontSize: 8.5, color: '#333', marginLeft: 8, marginBottom: 0.5 },
  indication: { fontSize: 9.5, color: '#000', marginBottom: 5, lineHeight: 1.3 },
  footer: { marginTop: 'auto', paddingTop: 4 },
  signArea: { alignItems: 'center', marginBottom: 3 },
  signLine: {
    width: 170,
    borderTop: '1px solid #000',
    marginTop: 22,
    paddingTop: 2,
    textAlign: 'center',
    fontSize: 8,
    color: '#444'
  },
  qr: { width: 56, height: 56, marginBottom: 3 },
  doctorTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#000', textAlign: 'center' },
  doctorDetails: { fontSize: 8.5, color: '#333', textAlign: 'center' },
  patientInfoContainer: { borderTop: '1px solid #000', marginTop: 4 },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3
  },
  patientDetail: { fontSize: 8.5, color: '#000' }
})

const Card = ({
  type,
  data,
  logo
}: {
  type: 'receta' | 'indicaciones'
  data: PrescriptionPdfData
  logo?: Buffer
}) => {
  const { doctor, patient, lines, diagnosis, signature } = data
  const place = [doctor.address, doctor.city].filter(Boolean)
  const hasDiagnosis = Boolean(diagnosis?.text || diagnosis?.code)

  return (
    <View style={styles.prescription}>
      {logo && <Image style={styles.watermark} src={{ data: logo, format: 'png' }} />}
      {data.annulled && <Text style={styles.annulled}>ANULADA</Text>}

      <View style={styles.content}>
        <View style={styles.header}>
          {logo && <Image style={styles.logo} src={{ data: logo, format: 'png' }} />}
          <View style={styles.headerText}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            {doctor.email ? (
              <Text style={styles.contactInfo}>Email: {doctor.email}</Text>
            ) : null}
            {doctor.phone ? (
              <Text style={styles.contactInfo}>Telf: {doctor.phone}</Text>
            ) : null}
            {place.map((line) => (
              <Text key={line} style={styles.contactInfo}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.placeDate}>
          {doctor.city ? `${doctor.city}, ` : ''}
          {data.date}
        </Text>

        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLine}>
              <Text style={styles.bold}>Paciente: </Text>
              {patient.name}
            </Text>
            <Text style={styles.patientLine}>
              {patient.age ? (
                <>
                  <Text style={styles.bold}>Edad: </Text>
                  {patient.age} años
                </>
              ) : null}
            </Text>
          </View>
          {hasDiagnosis ? (
            <Text style={styles.patientLine}>
              <Text style={styles.bold}>Diagnóstico: </Text>
              {diagnosis?.text}
              {diagnosis?.code ? ` (CIE-10: ${diagnosis.code})` : ''}
            </Text>
          ) : null}
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.sectionTitle}>
            {type === 'receta' ? 'RECETA:' : 'INDICACIONES:'}
          </Text>
          {lines.map((line, index) =>
            type === 'receta' ? (
              <View key={index} style={styles.item} wrap={false}>
                <Text style={styles.itemName}>
                  {index + 1}. {line.genericName} {line.strength}
                </Text>
                <Text style={styles.itemDetail}>
                  {[line.form, line.route && `vía ${line.route}`]
                    .filter(Boolean)
                    .join(' · ')}
                  {line.brand ? ` · (${line.brand})` : ''}
                </Text>
                <Text style={styles.itemDetail}>Cantidad: {line.quantity}</Text>
              </View>
            ) : (
              <Text key={index} style={styles.indication} wrap={false}>
                {index + 1}. {line.genericName}: {line.instructions}
              </Text>
            )
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.signArea}>
            {signature ? (
              <>
                {signature.qrDataUrl ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image src={signature.qrDataUrl} style={styles.qr} />
                  </>
                ) : null}
                <Text style={styles.doctorTitle}>{doctor.name}</Text>
                {doctor.identification ? (
                  <Text style={styles.doctorDetails}>{`RUC: ${doctor.identification}`}</Text>
                ) : null}
                {doctor.specialty ? (
                  <Text style={styles.doctorDetails}>{doctor.specialty}</Text>
                ) : null}
                {doctor.license ? (
                  <Text style={styles.doctorDetails}>
                    {`Reg. profesional: ${doctor.license}`}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.signLine}>Firma y sello</Text>
                <Text style={styles.doctorTitle}>{doctor.name}</Text>
                {doctor.specialty ? (
                  <Text style={styles.doctorDetails}>{doctor.specialty}</Text>
                ) : null}
                {doctor.identification || doctor.license ? (
                  <Text style={styles.doctorDetails}>
                    {[
                      doctor.identification && `CI: ${doctor.identification}`,
                      doctor.license && `Reg. profesional: ${doctor.license}`
                    ]
                      .filter(Boolean)
                      .join('   ')}
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <View style={styles.patientInfoContainer}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientDetail}>C.I. paciente: {patient.ci}</Text>
              {patient.nextAppointment ? (
                <Text style={styles.patientDetail}>
                  Próxima cita: {patient.nextAppointment}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

/** Receta médica en A4 horizontal: receta (izquierda) e indicaciones (derecha) */
export const PrescriptionDocument = ({
  data,
  logo
}: {
  data: PrescriptionPdfData
  logo?: Buffer
}) => (
  <Document title={`Receta ${data.patient.name} - Cardiolife`}>
    <Page size='A4' style={styles.page} orientation='landscape'>
      <View style={styles.container}>
        <Card type='receta' data={data} logo={logo} />
        <Card type='indicaciones' data={data} logo={logo} />
      </View>
    </Page>
  </Document>
)
