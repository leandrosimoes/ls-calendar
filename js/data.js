import { isPastDate, isValidDateRange } from './utils.js'
import Appointment from './appointment.js'

const _DATA = 'lscalendar-mock-data'
let APPOINTMENTS = []

/**
 * Save the data in the user's localstorage
 * PS: I used localstorage since this App is not used in production
 *     If this was the case, I would implement a ajax to store the data
 *     in a server for example.
 * @param {Object} data Containing an array of Appointments 
 */
export const saveData = data => {
    localStorage.setItem(_DATA, JSON.stringify(data))
}

/**
 * Get the data from the user's localstorage
 * PS: I used localstorage since this App is not used in production
 *     If this was the case, I would implement a ajax to get the stored data
 *     from a server for example.
 * @param {Object} data Containing an array of Appointments 
 */
export const getData = () => {
    let appointments = localStorage.getItem(_DATA) || '[]'
    appointments = JSON.parse(appointments)
    appointments = appointments.map(a => {
        a.init_date = new Date(a.init_date)
        a.end_date = new Date(a.end_date)
        a.calendarInstance = null
        const appointment = new Appointment({ ...a })
        return appointment
    })
    appointments = appointments.sort((a, b) => (a.init_date > b.init_date ? 1 : -1))
    return appointments
}

/**
 * Check if the data is valid for a Appointment
 * @param {Object} options
 * @param {string} options.id Appointment id in a GUID format
 * @param {Date} options.init_date Appointment init date
 * @param {Date} options.end_date Appointment end date
 * @param {string} options.description Appointment desctiption
 * @returns {boolean} "true" if is valid
 * @returns {string} Error message if is not valid
 */
export function isValidAppointment({ id, init_date, end_date, description }) {
    if (isPastDate(init_date)) return 'The "init_date" provided is not a valid "Date"'
    if (isPastDate(end_date)) return 'The "end_date" provided is not a valid "Date"'
    if (!isValidDateRange(init_date, end_date)) return 'The "end_date" must be greather then the "init_date" provided is not a valid "Date"'

    if (!description || typeof description !== 'string' || description.length === 0) {
        return 'The "description" provided is not a valid "string"'
    }

    if (description.length < 6) {
        return `The "description" must have at least 6 characters.`
    }

    let appointment_between_found = getAppointmentsByPeriod(init_date, end_date)
    appointment_between_found = appointment_between_found.filter(a => a.id != id)

    if (appointment_between_found && appointment_between_found.length > 0) {
        const appointments_descriptions = appointment_between_found.map(a => `${a.description} - ${a.init_hour_description} /${a.end_hour_description}`).join('\r\n')
        return `The appointment date has conflict with the appointment the follow appointments: \r\n${appointments_descriptions}`
    }

    return true
}

/**
 * Add a new appointment to the list and save the data
 * @param {appointment} appointment Appointment class instance
 */
export function addAppointment(appointment) {
    APPOINTMENTS = getData()
    APPOINTMENTS.push(appointment)

    let data = getData()
    data = data.filter(a => a.id != appointment.id)
    const { id, color, init_date, end_date, description } = appointment
    data.push({ id, color, init_date, end_date, description })
    
    saveData(data)

    return APPOINTMENTS
}

/**
 * Get all appointments
 * @returns {Array} Array of Appointment classes instance
 */
export function getAppointments() {
    APPOINTMENTS = getData()
    APPOINTMENTS = APPOINTMENTS.sort((a, b) => (a.init_date > b.init_date ? 1 : -1))
    return APPOINTMENTS
}

/**
 * Get a specific Appointment by id
 * @param {string} id Appointment's id in GUID format
 * @returns {object} Appointment class instance
 */
export function getAppointmentById(id) {
    return APPOINTMENTS.find(m => m.id == id)
}

/**
 * Get an Array of Appointment classes instance that has the
 * init_date between the @init_date and @end_date params
 * @param {Date} init_date 
 * @param {Date} end_date 
 * @returns {object} Appointment class instance
 */
export function getAppointmentsByPeriod(init_date, end_date) {
    APPOINTMENTS = getData()
    return APPOINTMENTS.filter(m => {
        if (init_date <= m.init_date && end_date >= m.end_date) return true

        if (init_date < m.end_date && init_date >= m.init_date) return true

        if (end_date > m.init_date && end_date <= m.end_date) return true

        return false
    })
}

/**
 * Deletes a Appointment that has the id equals to the @id param
 * @param {string} id Appointment id in GUID format
 */
export function deleteAppointment(id) {
    APPOINTMENTS = getData()
    const appointment_found = APPOINTMENTS.find(m => m.id == id)

    if (!appointment_found) return false

    console.log(`Appointment ${id} deleted at: ${new Date().toString()}`)

    APPOINTMENTS = APPOINTMENTS.filter(a => a.id != id)
    saveData(APPOINTMENTS)

    return true
}
