import { _CLASSES } from './constants.js'
import Appointment from './appointment.js'
import { getAppointmentById, deleteAppointment, addAppointment, isValidAppointment } from './data.js'
import { buildCalendarUI, fillAppointments } from './calendar-ui-builder.js'
import { generateGUID } from './utils.js'

class LsCalendar {
    constructor(wrapper) {
        if (!(wrapper instanceof HTMLDivElement)) throw new Error('The wrapper element must be a valid HTMLDivElement')

        this.wrapper = wrapper
        this.current_date = new Date()
        this.element = null
        
        buildCalendarUI(this)

        console.log(`Calendar renderd at: ${new Date().toString()}`)
        document.body.classList.remove('loading')
    }

    /**
     * Open the Form Modal to Add/Edit a Appointment
     * @param {object} options 
     * @param {string} options.id Appointment id in a GUID format (optional if is not editting) 
     * @param {int} options.day 
     * @param {int} options.month 
     * @param {int} options.year 
     * @param {string} options.description Appointment description (optional if is not editting) 
     * @param {int} options.init_hour 
     * @param {int} options.end_hour 
     */
    openFormModal({ id, day, month, year, description = '', init_hour, end_hour }) {
        const current_date = new Date()
        const date = new Date(year, month, day)

        const form = document.querySelector(`.${_CLASSES.form}`)
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

    /**
     * Deletes a Appointment based on the Form Modal data
     */
    deleteAppointment() {
        if (!confirm('Are you sure you want to delete this appointment?')) return true

        const form = document.querySelector(`.${_CLASSES.form}`)
        const id = form.getAttribute('lscalendar-appointment-id')

        const appointment = getAppointmentById(id)
        if (!appointment) {
            alert('Appointment not found')
            return false
        }

        if (deleteAppointment(appointment.id)) {
            appointment.destroy()
        }

        this.closeFormModal()

        return true
    }

    /**
     * Saves a Appointment based on the Form Modal data
     */
    saveAppointment() {
        const form = document.querySelector(`.${_CLASSES.form}`)
        const id = form.getAttribute('lscalendar-appointment-id')
        const day = form.getAttribute('lscalendar-day')
        const month = this.current_date.getMonth()
        const year = this.current_date.getFullYear()
        const init_hour = form.querySelector(`.${_CLASSES.form_input_hour}`).value.split(':')
        const end_hour = form.querySelector(`.${_CLASSES.form_input_hour_end}`).value.split(':')
        const init_date = new Date(year, month, day, init_hour[0], init_hour[1])
        const end_date = new Date(year, month, day, end_hour[0], end_hour[1])
        const description = form.querySelector(`.${_CLASSES.form_input_description}`).value

        const validation = isValidAppointment({ id, init_date, end_date, description })
        if (validation !== true) {
            alert(validation)
            return false
        }

        let appointment = getAppointmentById(id) || {}
        if (deleteAppointment(appointment.id)) {
            appointment.destroy()
        }

        let options = { ...appointment, description, init_date, end_date, calendarInscance: this }
        appointment = new Appointment({ ...options })

        addAppointment(appointment)

        const day_element = this.element.querySelector(`div.${_CLASSES.day}[lscalendar-day="${day}"]`)
        fillAppointments(this, day_element)

        this.closeFormModal()

        return true
    }

    /**
     * Set the calendar to a specific @date
     * @param {Date} date 
     */
    goToDate(date = new Date()) {
        this.current_date = date
        buildCalendarUI(this)
    }

    /**
     * Set the calendar month to the next month based on the current calendars month
     */
    goToNextMonth() {
        this.current_date.setMonth(this.current_date.getMonth() + 1)
        this.goToDate(this.current_date)
    }

    /**
     * Set the calendar month to the previous month based on the current calendars month
     */
    goToPrevMonth() {
        this.current_date.setMonth(this.current_date.getMonth() - 1)
        this.goToDate(this.current_date)
    }

    /**
     * Set the calendar month to the current month based on the current date
     */
    goToCurrentMonth = function() {
        this.goToDate()
    }

    /**
     * Closes the Form Data and clears its data
     */
    closeFormModal() {
        const form = document.querySelector(`.${_CLASSES.form}`)
        form.querySelector(`.${_CLASSES.form_input_description}`).value = ''
        form.querySelector(`.${_CLASSES.form_title}`).value = ''
        form.removeAttribute('lscalendar-day')
        form.removeAttribute('lscalendar-month')
        form.removeAttribute('lscalendar-year')
        form.classList.add(_CLASSES.hidden_form)
    }
}

window.LsCalendar = LsCalendar