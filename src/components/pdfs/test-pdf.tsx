import React from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from '@react-pdf/renderer'

// Estilos para el documento
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  container: {
    flexDirection: 'row',
    gap: 15
  },
  prescription: {
    flex: 1,
    border: '2px solid #000',
    padding: 15,
    position: 'relative'
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.08,
    width: 250,
    height: 280,
    zIndex: 0
  },
  content: {
    position: 'relative',
    zIndex: 1
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #000',
    alignItems: 'flex-start'
  },
  heartImage: {
    width: 60,
    height: 90,
    marginRight: 15
  },
  headerText: {
    flex: 1
  },
  doctorNameContainer: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
    borderRadius: 3
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#333'
  },
  hospital: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
    marginBottom: 2,
    color: '#000'
  },
  location: {
    fontSize: 9,
    color: '#333'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000'
  },
  medicationItem: {
    fontSize: 10,
    marginBottom: 8,
    paddingLeft: 20,
    color: '#000'
  },
  contentArea: {
    minHeight: 200,
    marginBottom: 20
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTop: '1px solid #000'
  },
  footerDoctor: {
    textAlign: 'center',
    marginBottom: 8
  },
  doctorTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000'
  },
  doctorDetails: {
    fontSize: 9,
    color: '#333'
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  patientDetail: {
    fontSize: 9,
    color: '#000'
  }
})

interface PrescriptionCardProps {
  type: 'receta' | 'indicaciones'
  doctorName: string
  email: string
  phone: string
  medications: string[]
  patientName: string
  date: string
  ci: string
  appointment?: string
}

// Componente de Receta Individual
const PrescriptionCard = ({
  type,
  doctorName,
  email,
  phone,
  medications,
  patientName,
  date,
  ci,
  appointment
}: PrescriptionCardProps) => (
  <View
    style={styles.prescription}
    key={patientName}
    id={'Receta ' + patientName}>
    {/* Marca de agua del corazón */}
    <Image
      style={styles.watermark}
      src='https://res.cloudinary.com/alwaysdev/image/upload/cardiolife/gwmcnwmjpamzbtcrbs1a.jpg'
    />

    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        {/* Logo corazón */}
        <Image
          style={styles.heartImage}
          src='https://res.cloudinary.com/alwaysdev/image/upload/cardiolife/gwmcnwmjpamzbtcrbs1a.jpg'
        />

        <View style={styles.headerText}>
          <View style={styles.doctorNameContainer}>
            <Text style={styles.doctorName}>{doctorName}</Text>
          </View>
          <View style={{ display: 'flex', gap: '4px' }}>
            <Text style={styles.contactInfo}>Email: {email}</Text>
            <Text style={styles.contactInfo}>Telf: {phone}</Text>
          </View>

          <Text style={styles.contactInfo}>
            DIR: Prolongación Galápagos y Ambato
          </Text>
          <Text style={styles.location}>Santo Domingo - Ecuador</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>
        <Text style={styles.sectionTitle}>
          {type === 'receta' ? 'RECETA:' : 'INDICACIONES:'}
        </Text>
        {medications.map((med, index) => (
          <Text key={index} style={styles.medicationItem}>
            {med}
          </Text>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDoctor}>
          <Text style={styles.doctorTitle}>Dr. Ricardo J González Soto</Text>
          <Text style={styles.doctorDetails}>Cardiólogo</Text>
          <Text style={styles.doctorDetails}>CI: 1710234567 Reg: 08952948</Text>
        </View>

        <View style={styles.patientInfo}>
          <Text style={styles.patientDetail}>Nombre: {patientName}</Text>
          {appointment && (
            <Text style={styles.patientDetail}>
              Próxima Cita: {appointment}
            </Text>
          )}
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientDetail}>Fecha: {date}</Text>
          <Text style={styles.patientDetail}>C.I: {ci}</Text>
        </View>
      </View>
    </View>
  </View>
)

// Documento completo
export const MyTestDocument = ({ patientName }: { patientName: string }) => (
  <Document title={'Receta ' + patientName + ' - Cardiolife'}>
    <Page size='A4' style={styles.page} orientation='landscape'>
      <View style={styles.container}>
        {/* Receta 1 - Medicamentos */}
        <PrescriptionCard
          type='receta'
          doctorName='Dr. Ricardo J González Soto'
          email='funiscor2008@gmail.com'
          phone='0999-123-456'
          medications={[
            'LOSARTAN: TAB 8  MGR',
            'NATRILIX  AP: TAB 1.25  MGR',
            'LASIX: TAB 20  MGR',
            'ASAPROL: TAB 81  MGR'
          ]}
          patientName='Ana María Pérez González'
          date='18/02/25'
          ci='1704567890'
          appointment='En 1 semana'
        />

        {/* Receta 2 - Indicaciones */}
        <PrescriptionCard
          type='indicaciones'
          doctorName='Dr. Ricardo J González Soto'
          email='funiscor2008@gmail.com'
          phone='0999-123-456'
          medications={[
            'ATACAND O MINART O CANDER: 1 TAB DÍA 8  AM',
            'NATRILIX AP: 1 TAB DÍA 10  AM',
            'LASIX: 1 TAB DÍA 4  PM',
            'ASAPROL: 1 TAB DÍA CON EL ALMUERZO'
          ]}
          patientName='Ana María Pérez González'
          date='18/02/25'
          ci='1704567890'
          appointment='En 1 semana'
        />
      </View>
    </Page>
  </Document>
)
