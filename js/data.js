let _APPOINTMENTS = []
import { isPastDate, isValidDateRange } from './utils.js'

export function isValidAppointment({ id, init_date, end_date, description, minDescriptionLength }) {
    if (isPastDate(init_date)) return 'The "init_date" provided is not a valid "Date"'
    if (isPastDate(end_date)) return 'The "end_date" provided is not a valid "Date"'
    if (!isValidDateRange(init_date, end_date)) return 'The "end_date" must be greather then the "init_date" provided is not a valid "Date"'

    if (!description || typeof description !== 'string' || description.length === 0) {
        return 'The "description" provided is not a valid "string"'
    }

    if (description.length < minDescriptionLength) {
        return `The "description" must have at least ${minDescriptionLength} characters.`
    }

    let appointment_between_found = getAppointmentsByPeriod(init_date, end_date)
    appointment_between_found = appointment_between_found.filter(a => a.id != id)

    if (appointment_between_found && appointment_between_found.length > 0) {
        const appointments_descriptions = appointment_between_found.map(a => `${a.description} - ${a.init_hour_description} /${a.end_hour_description}`).join('\r\n')
        return `The appointment date has conflict with the appointment the follow appointments: \r\n${appointments_descriptions}`
    }

    return true
}

export function addAppointment(appointment) {
    _APPOINTMENTS.push(appointment)
    _APPOINTMENTS = _APPOINTMENTS.sort((a, b) => (a.init_date > b.init_date ? 1 : -1))
    return _APPOINTMENTS
}

export function getAppointments() {
    return _APPOINTMENTS
}

export function getAppointmentById(id) {
    return _APPOINTMENTS.find(m => m.id == id)
}

export function getAppointmentsByPeriod(init_date, end_date) {
    return _APPOINTMENTS.filter(m => {
        if (init_date <= m.init_date && end_date >= m.end_date) return true

        if (init_date < m.end_date && init_date >= m.init_date) return true

        if (end_date > m.init_date && end_date <= m.end_date) return true

        return false
    })
}

export function deleteAppointment(id) {
    const appointment_found = _APPOINTMENTS.find(m => m.id == id)

    if (!appointment_found) return false

    _APPOINTMENTS = _APPOINTMENTS.filter(m => m.id != appointment_found.id)

    return true
}
