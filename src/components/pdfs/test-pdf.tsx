import React from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from '@react-pdf/renderer'

interface MedicationSnapshot {
  name: string
  genericname?: string
  dose: string
  unit: string
  form: string
  route?: string
  standardFrequency?: string
  standardInstructions?: string
  warnings?: string
}

interface ConsultationMedication {
  id: string
  medication_snapshot: MedicationSnapshot
  custom_frequency?: string
  custom_duration?: string
  custom_instructions?: string
  quantity_amount: number
  quantity_unit: string
}

interface PrescriptionData {
  doctor: {
    name: string
    email: string
    phone: string
    signature: {
      name: string
      specialty: string
      ci: string
      registration: string
    }
  }
  patient: {
    name: string
    ci: string
    date: string
    nextAppointment?: string
  }
  medications: ConsultationMedication[]
  indications?: ConsultationMedication[]
}

// Estilos
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
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.08,
    width: 280,
    height: 280,
    zIndex: 0
  },
  content: {
    position: 'relative',
    zIndex: 1
  },
  header: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottom: '1px solid #000',
    alignItems: 'flex-start'
  },
  heartImage: {
    width: 60,
    height: 80,
    marginRight: 10
  },
  headerText: {
    flex: 1
  },
  doctorNameContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
    borderRadius: 3
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: '#1e3a8a',
    fontWeight: 'bold'
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#222'
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
  indicationText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
    marginBottom: 2,
    color: '#000'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000'
  },
  medicationItem: {
    marginBottom: 8,
    paddingLeft: 5
  },
  medicationName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2
  },
  medicationDetails: {
    fontSize: 9,
    color: '#333',
    marginLeft: 10,
    marginBottom: 1
  },
  contentArea: {
    minHeight: 285,
    marginBottom: 12
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 5
  },
  footerDoctor: {
    textAlign: 'center',
    marginBottom: 4
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
  patientInfoContainer: {
    borderTop: '1px solid #000',
    marginTop: 6
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
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
  medications: ConsultationMedication[]
  patientName: string
  date: string
  ci: string
  appointment?: string
  doctorSignature: {
    name: string
    specialty: string
    ci: string
    registration: string
  }
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
  appointment,
  doctorSignature
}: PrescriptionCardProps) => (
  <View style={styles.prescription}>
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
          <View>
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
          <View key={med.id || index} style={styles.medicationItem}>
            {type === 'receta' ? (
              // Para RECETA: solo el nombre del medicamento
              <Text style={styles.medicationName}>
                {med.medication_snapshot.name} de {med.medication_snapshot.dose}{' '}
                {med.medication_snapshot.unit}
              </Text>
            ) : (
              // Para INDICACIONES: nombre + instrucciones
              <Text style={styles.indicationText}>
                {index + 1}. {med.medication_snapshot.name}:{' '}
                {med.custom_instructions ||
                  med.medication_snapshot.standardInstructions ||
                  ''}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDoctor}>
          <Text style={styles.doctorTitle}>{doctorSignature.name}</Text>
          <Text style={styles.doctorDetails}>{doctorSignature.specialty}</Text>
          <Text style={styles.doctorDetails}>
            CI: {doctorSignature.ci} Reg: {doctorSignature.registration}
          </Text>
        </View>
        <View style={styles.patientInfoContainer}>
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
  </View>
)

// Documento completo - Ahora recibe datos dinámicos
export const MyTestDocument = ({
  prescriptionData
}: {
  prescriptionData: PrescriptionData
}) => (
  <Document title={'Receta ' + prescriptionData.patient.name + ' - Cardiolife'}>
    <Page size='A4' style={styles.page} orientation='landscape'>
      <View style={styles.container}>
        {/* Receta 1 - Medicamentos */}
        <PrescriptionCard
          type='receta'
          doctorName={prescriptionData.doctor.name}
          email={prescriptionData.doctor.email}
          phone={prescriptionData.doctor.phone}
          medications={prescriptionData.medications}
          patientName={prescriptionData.patient.name}
          date={prescriptionData.patient.date}
          ci={prescriptionData.patient.ci}
          appointment={prescriptionData.patient.nextAppointment}
          doctorSignature={prescriptionData.doctor.signature}
        />

        {/* Receta 2 - Indicaciones */}
        <PrescriptionCard
          type='indicaciones'
          doctorName={prescriptionData.doctor.name}
          email={prescriptionData.doctor.email}
          phone={prescriptionData.doctor.phone}
          medications={prescriptionData.indications || []}
          patientName={prescriptionData.patient.name}
          date={prescriptionData.patient.date}
          ci={prescriptionData.patient.ci}
          appointment={prescriptionData.patient.nextAppointment}
          doctorSignature={prescriptionData.doctor.signature}
        />
      </View>
    </Page>
  </Document>
)
