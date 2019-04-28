import { _CLASSES } from './constants.js'
import Appointment from './appointment.js'
import { getAppointmentById, deleteAppointment, addAppointment, isValidAppointment } from './data.js'
import { buildCalendarUI, destroyCalendarUI, fillAppointments } from './calendar-ui-builder.js'

class LsCalendar {
    constructor({ wrapper, onInit, onSaveAppointment, onDeleteAppointment }) {
        this.wrapper = wrapper
        this.days = []
        this.current_date = new Date()
        this.month_name = null
        this.next_button = null
        this.prev_button = null
        this.form = null
        this.element = null
        this.onSaveAppointment = (onSaveAppointment || function() {}).bind(this)
        this.onDeleteAppointment = (onDeleteAppointment || function() {}).bind(this)
        this.onInit = (onInit || function() {}).bind(this)
    }

    init(appointments = []) {
        if (appointments && appointments.length > 0) {
            appointments.forEach(appointment => {
                const validation = isValidAppointment(appointment)
                if (validation === true) {
                    appointment.calendar = this
                    addAppointment(appointment)
                }
            })
        }

        buildCalendarUI(this)
        this.onInit()
    }

    openFormModal({ id, day, month, year, description = '', init_hour, end_hour }) {
        const current_date = new Date()
        const date = new Date(year, month, day)

        let form = document.querySelector(`.${_CLASSES.form}`)
        form.setAttribute('lscalendar-appointment-id', id)
        form.setAttribute('lscalendar-day', day)
        form.setAttribute('lscalendar-month', month)
        form.setAttribute('lscalendar-year', year)

        form.querySelector(`.${_CLASSES.form_input_description}`).value = description
        form.querySelector(`.${_CLASSES.form_input_hour}`).selectedIndex = init_hour || current_date.getHours()

        let end_hour_fixed = end_hour || current_date.getHours() + 1
        end_hour_fixed = end_hour_fixed > 23 ? 0 : end_hour_fixed
        form.querySelector(`.${_CLASSES.form_input_hour_end}`).selectedIndex = end_hour_fixed
        form.querySelector(`.${_CLASSES.form_title}`).innerHTML = `Selected date: ${date.toDateString()}`
        form.classList.remove(_CLASSES.hidden_form)

        if (!!id) {
            form.querySelector(`.${_CLASSES.form_button_delete}`).classList.remove(_CLASSES.hidden_form)
        } else {
            form.querySelector(`.${_CLASSES.form_button_delete}`).classList.add(_CLASSES.hidden_form)
        }
    }

    deleteAppointment() {
        if (!confirm('Are you sure you want to delete this appointment?')) return true

        const id = this.form.getAttribute('lscalendar-appointment-id')

        const appointment = getAppointmentById(id)
        if (!appointment) {
            alert('Appointment not found')
            return false
        }

        if (deleteAppointment(appointment.id)) {
            appointment.destroy()
        }

        this.closeFormModal()
        this.onDeleteAppointment(id)

        return true
    }

    saveAppointment() {
        const id = this.form.getAttribute('lscalendar-appointment-id')
        const day = this.form.getAttribute('lscalendar-day')
        const month = this.current_date.getMonth()
        const year = this.current_date.getFullYear()
        const init_hour = this.form.querySelector(`.${_CLASSES.form_input_hour}`).value.split(':')
        const end_hour = this.form.querySelector(`.${_CLASSES.form_input_hour_end}`).value.split(':')
        const init_date = new Date(year, month, day, init_hour[0], init_hour[1])
        const end_date = new Date(year, month, day, end_hour[0], end_hour[1])
        const description = this.form.querySelector(`.${_CLASSES.form_input_description}`).value

        const validation = isValidAppointment({ id, init_date, end_date, description })
        if (validation !== true) {
            alert(validation)
            return false
        }

        let appointment = getAppointmentById(id) || {}
        if (deleteAppointment(appointment.id)) {
            appointment.destroy()
        }

        let options = { ...appointment, calendar: this, description, init_date, end_date }
        appointment = new Appointment({ ...options })

        addAppointment(appointment)

        const day_element = this.element.querySelector(`div.${_CLASSES.day}[lscalendar-day="${day}"]`)
        fillAppointments(this, day_element)

        this.closeFormModal()
        this.onSaveAppointment(appointment)

        return true
    }

    goToDate(date = new Date()) {
        this.current_date = date
        destroyCalendarUI(this)
        buildCalendarUI(this)
    }

    goToNextMonth() {
        this.current_date.setMonth(this.current_date.getMonth() + 1)
        this.goToDate(this.current_date)
    }

    goToPrevMonth() {
        this.current_date.setMonth(this.current_date.getMonth() - 1)
        this.goToDate(this.current_date)
    }

    goToCurrentMonth = function() {
        this.goToDate()
    }

    closeFormModal() {
        if (!this.form) return

        this.form.querySelector(`.${_CLASSES.form_input_description}`).value = ''
        this.form.querySelector(`.${_CLASSES.form_title}`).value = ''
        this.form.removeAttribute('lscalendar-day')
        this.form.removeAttribute('lscalendar-month')
        this.form.removeAttribute('lscalendar-year')
        this.form.classList.add(_CLASSES.hidden_form)
    }
}

window.LsCalendar = LsCalendar
window.Appointment = Appointment
