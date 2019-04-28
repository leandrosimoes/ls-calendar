import { _COLORS, _CLASSES, _MONTHS, _WEEK_DAYS } from './constants.js'
import { getLastDayInMonth, getFirstWeekday, getLastWeekday, isValidDateRange, isPastDate } from './utils.js'
import Appointment from './appointment.js'
import { getAppointmentById, deleteAppointment, addAppointment, isValidAppointment } from './data.js'

// UI STUFF
function destroyUI(self) {
    unsetEventListeners(self)

    self.wrapper.innerHTML = ''
}

function buildHourSelectOptions() {
    const result = []
    for (var i = 0; i < 24; i++) {
        const current = i > 9 ? `${i}:00` : `0${i}:00`
        result.push(`<option value="${current}">${current}</option>`)
    }
    return result.join()
}

function buildFormUI(self) {
    const form = document.createElement('div')
    form.classList.add(_CLASSES.form)
    form.classList.add(_CLASSES.hiddenForm)

    const close_button = document.createElement('span')
    close_button.classList.add(_CLASSES.formCloseButton)
    close_button.innerHTML = '&times;'

    const form_title = document.createElement('span')
    form_title.classList.add(_CLASSES.formTitle)
    form_title.innerHTML = 'Teste'

    const form_input_wrapper = document.createElement('div')

    const description_input = document.createElement('input')
    description_input.classList.add(_CLASSES.formInput)
    description_input.classList.add(_CLASSES.formInputDesctiption)
    description_input.setAttribute('type', 'text')
    description_input.setAttribute('placeholder', 'Description')

    const hour_options = buildHourSelectOptions()
    const hour_input = document.createElement('select')
    hour_input.classList.add(_CLASSES.formInput)
    hour_input.classList.add(_CLASSES.formInputHour)
    hour_input.innerHTML = hour_options

    const hour_end_input = document.createElement('select')
    hour_end_input.classList.add(_CLASSES.formInput)
    hour_end_input.classList.add(_CLASSES.formInputHourEnd)
    hour_end_input.innerHTML = hour_options

    const save_button = document.createElement('button')
    save_button.classList.add(_CLASSES.formButton)
    save_button.classList.add(_CLASSES.formButtonBlue)
    save_button.setAttribute('type', 'button')
    save_button.innerHTML = 'SAVE'

    const delete_button = document.createElement('button')
    delete_button.classList.add(_CLASSES.formButton)
    delete_button.classList.add(_CLASSES.formButtonRed)
    delete_button.classList.add(_CLASSES.hiddenForm)
    delete_button.setAttribute('type', 'button')
    delete_button.innerHTML = 'DELETE'

    form.appendChild(form_title)
    form.appendChild(close_button)
    form_input_wrapper.appendChild(description_input)
    form_input_wrapper.appendChild(hour_input)
    form_input_wrapper.appendChild(hour_end_input)
    form_input_wrapper.appendChild(save_button)
    form_input_wrapper.appendChild(delete_button)
    form.appendChild(form_input_wrapper)

    self.element.appendChild(form)

    setFormEventListeners(form, self)

    return form
}

function buildUI(self) {
    const { element, wrapper, currentDate } = self
    element.classList.add(_CLASSES.init)

    const first_weekday = getFirstWeekday(currentDate)
    const last_weekday = getLastWeekday(currentDate)
    let current_weekday = currentDate.getDay()

    const first_day = 1
    const first_index = 1 - first_weekday
    const last_index = getLastDayInMonth(currentDate) + (7 - last_weekday)
    const last_day = getLastDayInMonth(currentDate)
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    let total_weeks = 5

    element.setAttribute('lscalendar-month', currentMonth)
    element.setAttribute('lscalendar-year', currentYear)

    current_weekday = 0
    let current_week = document.createElement('div')
    current_week.classList.add(_CLASSES.week)

    const prevButton = document.createElement('button')
    prevButton.innerText = '‹'
    prevButton.classList.add(_CLASSES.headerButton)

    const monthName = document.createElement('span')
    monthName.innerText = `${_MONTHS[currentMonth]} ${currentYear}`
    monthName.classList.add(_CLASSES.monthName)

    const nextButton = document.createElement('button')
    nextButton.innerText = '›'
    nextButton.classList.add(_CLASSES.headerButton)

    const header = document.createElement('div')
    header.appendChild(prevButton)
    header.appendChild(monthName)
    header.appendChild(nextButton)
    header.classList.add(_CLASSES.header)

    element.appendChild(header)

    self.monthName = monthName
    self.prevButton = prevButton
    self.nextButton = nextButton

    for (let i = first_index; i <= last_index; i++) {
        const day = document.createElement('div')

        if (i >= first_day && i <= last_day) {
            day.setAttribute('lscalendar-day', i)
        } else {
            day.classList.add(_CLASSES.noDay)
        }

        day.setAttribute('lscalendar-weekday', _WEEK_DAYS[current_weekday])

        day.classList.add(_CLASSES.day)

        if (isPastDate(currentYear, currentMonth, i)) {
            day.classList.add(_CLASSES.pastDay)
        }

        if (total_weeks > 0) {
            current_week.appendChild(day)
            element.appendChild(current_week)
            self.days.push(day)

            if (current_weekday === 6) {
                current_weekday = 0
                current_week = document.createElement('div')
                current_week.classList.add(_CLASSES.week)
                total_weeks--
            } else {
                current_weekday++
            }
        }
    }

    wrapper.appendChild(element)

    setEventListeners(self)
    buildFormUI(self)
}

function unsetEventListeners(self) {
    const { days } = self

    days.forEach(day => {
        if (!day.classList.contains(_CLASSES.noDay) && !day.classList.contains(_CLASSES.pastDay)) {
            day.removeEventListener('click', self.openModalForm, false)
        }
    })

    self.monthName.removeEventListener('click', self.goToCurrentMonth, false)

    self.prevButton.removeEventListener('click', self.goToPrevMonth, false)

    self.nextButton.removeEventListener('click', self.goToNextMonth, false)
}

function closeModalForm(form) {
    form.querySelector(`.${_CLASSES.formInputDesctiption}`).value = ''
    form.querySelector(`.${_CLASSES.formTitle}`).value = ''
    form.removeAttribute('lscalendar-day')
    form.removeAttribute('lscalendar-month')
    form.removeAttribute('lscalendar-year')
    form.classList.add(_CLASSES.hiddenForm)
}

function setFormEventListeners(form, self) {
    const close_button = form.querySelector(`.${_CLASSES.formCloseButton}`)
    const save_button = form.querySelector(`.${_CLASSES.formButtonBlue}`)
    const delete_button = form.querySelector(`.${_CLASSES.formButtonRed}`)

    close_button.addEventListener('click', event => {
        closeModalForm(form)
    })

    save_button.addEventListener('click', event => {
        if (self.saveAppointment(form)) {
            closeModalForm(form)
        }
    })

    delete_button.addEventListener('click', event => {
        if (!confirm('Are you sure you want to delete this appointment?')) return

        const validation = self.deleteAppointment(form)
        if (validation === true) {
            closeModalForm(form)
        } else {
            alert(validation)
        }
    })
}

function setEventListeners(self) {
    const { days } = self

    days.forEach(day => {
        if (!day.classList.contains(_CLASSES.noDay) && !day.classList.contains(_CLASSES.pastDay)) {
            day.addEventListener('click', self.openModalForm)
        }
    })

    self.monthName.addEventListener('click', self.goToCurrentMonth)

    self.prevButton.addEventListener('click', self.goToPrevMonth)

    self.nextButton.addEventListener('click', self.goToNextMonth)
}

function clearProperties(self) {
    self.element.remove()
    self.element = document.createElement('div')
    self.days = []
    self.currentDate = self.currentDate || new Date()
    self.monthName = null
    self.nextButton = null
    self.prevButton = null
}

function openModalForm() {
    const current_date = new Date()
    const date = new Date(this.year, this.month, this.day)

    let form = document.querySelector(`.${_CLASSES.form}`)
    form.setAttribute('lscalendar-appointment-id', this.id)
    form.setAttribute('lscalendar-day', this.day)
    form.setAttribute('lscalendar-month', this.month)
    form.setAttribute('lscalendar-year', this.year)

    form.querySelector(`.${_CLASSES.formInputDesctiption}`).value = this.description || ''
    form.querySelector(`.${_CLASSES.formInputHour}`).selectedIndex = this.init_hour || current_date.getHours()
    
    let end_hour_fixed = this.end_hour || current_date.getHours() + 1
    end_hour_fixed = end_hour_fixed > 23 ? 0 : end_hour_fixed
    form.querySelector(`.${_CLASSES.formInputHourEnd}`).selectedIndex = end_hour_fixed
    form.querySelector(`.${_CLASSES.formTitle}`).innerHTML = `Selected date: ${date.toDateString()}`
    form.classList.remove(_CLASSES.hiddenForm)

    if (!!this.id) {
        form.querySelector(`.${_CLASSES.formButtonRed}`).classList.remove(_CLASSES.hiddenForm)
    } else {
        form.querySelector(`.${_CLASSES.formButtonRed}`).classList.add(_CLASSES.hiddenForm)
    }
}

// LSCALENDAR STUFF
let LsCalendar = function({ wrapper, currentDate = new Date() }) {
    const self = this

    self.wrapper = wrapper
    self.element = document.createElement('div')
    self.days = []
    self.currentDate = currentDate
    self.monthName = null
    self.nextButton = null
    self.prevButton = null

    self.openModalForm = function(event) {
        const day = event.target.getAttribute('lscalendar-day')
        const month = self.element.getAttribute('lscalendar-month')
        const year = self.element.getAttribute('lscalendar-year')
        openModalForm.bind({ day, month, year }).call()
    }

    self.deleteAppointment = function(form) {
        const id = form.getAttribute('lscalendar-appointment-id')

        if (!id) return 'Appointment not found'

        const appointment = getAppointmentById(id)
        if (!appointment) return 'Appointment not found'

        if (deleteAppointment(appointment.id)) {
            appointment.destroy()
        }

        return true
    }

    self.saveAppointment = function(form) {
        const id = form.getAttribute('lscalendar-appointment-id')
        const day = form.getAttribute('lscalendar-day')
        const month = self.currentDate.getMonth()
        const year = self.currentDate.getFullYear()
        const init_hour = form.querySelector(`.${_CLASSES.formInputHour}`).value.split(':')
        const end_hour = form.querySelector(`.${_CLASSES.formInputHourEnd}`).value.split(':')
        const init_date = new Date(year, month, day, init_hour[0], init_hour[1])
        const end_date = new Date(year, month, day, end_hour[0], end_hour[1])
        const description = form.querySelector(`.${_CLASSES.formInputDesctiption}`).value

        const appointment = new Appointment({ description, init_date, end_date, on_click: openModalForm })

        const validation = isValidAppointment({ id, init_date, end_date, description })
        if (validation !== true) {
            alert(validation)
            return false
        }

        const appointment_found = getAppointmentById(id)
        if (appointment_found) {
            appointment.setColor(appointment_found.color)
            if (deleteAppointment(appointment_found.id)) {
                appointment_found.destroy()
            }
        }

        var appointments = addAppointment(appointment)
        self.element.querySelector(`div.${_CLASSES.day}[lscalendar-day="${day}"]`).innerHTML = ''
        appointments.forEach(m => {
            self.element.querySelector(`div.${_CLASSES.day}[lscalendar-day="${day}"]`).appendChild(m.element)
        })

        return true
    }

    self.destroy = function() {
        if (!self.wrapper) return

        destroyUI(self)
    }
    self.goToNextMonth = function() {
        self.currentDate.setMonth(self.currentDate.getMonth() + 1)
        destroyUI(self)
        clearProperties(self)
        buildUI(self)
    }
    self.goToPrevMonth = function() {
        self.currentDate.setMonth(self.currentDate.getMonth() - 1)
        destroyUI(self)
        clearProperties(self)
        buildUI(self)
    }
    self.goToCurrentMonth = function() {
        self.currentDate = new Date()
        destroyUI(self)
        clearProperties(self)
        buildUI(self)
    }

    buildUI(self)
}

window.LsCalendar = LsCalendar
