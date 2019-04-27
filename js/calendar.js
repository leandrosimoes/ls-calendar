import { _COLORS, _CLASSES, _MONTHS, _WEEK_DAYS } from './constants.js'
import { getRamdomColor, getLastDayInMonth, getFirstWeekday, getLastWeekday, isValidDateRange, isPastDate } from './utils.js'

// GLOBAL VARIABLES
let _MOCK_APPOINTMENTS = []

// APPOINTMENT STUFF
let Appointment = function({ calendar, description, initDate, endDate }) {
    let clickEventHandler = event => {
        openModalForm({
            id: this.id,
            description: this.description,
            calendar: this.calendar,
            day: this.initDate.getDate(),
            month: this.initDate.getMonth(),
            year: this.initDate.getFullYear(),
            init_hour: this.initDate.getHours(),
            end_hour: this.endDate.getHours(),
        })

        event.stopPropagation()
    }

    clickEventHandler = clickEventHandler.bind(this)

    this.id = initDate.getTime() + endDate.getTime()
    this.description = description
    this.initDate = initDate
    this.endDate = endDate
    this.calendar = calendar
    this.element = null
    this.color = getRamdomColor()

    this.delete = function() {
        this.element.removeEventListener('click', clickEventHandler)
        this.element.remove()
        _MOCK_APPOINTMENTS = _MOCK_APPOINTMENTS.filter(m => m.id != this.id)
    }

    this.toHTMLDivElement = function() {
        this.element = document.createElement('div')
        this.element.classList.add(_CLASSES.appointment)

        let initHour = this.initDate.getHours()
        initHour = initHour > 9 ? `${initHour}:00` : `0${initHour}:00`

        let endHour = this.endDate.getHours()
        endHour = endHour > 9 ? `${endHour}:00` : `0${endHour}:00`
        this.element.innerHTML = `${this.description} - ${initHour} / ${endHour}`

        this.element.addEventListener('click', clickEventHandler)
        this.element.style.backgroundColor = this.color

        return this.element
    }
}

function getAppointmentById(id) {
    return _MOCK_APPOINTMENTS.find(m => m.id == id)
}

function isValidAppointment({ initDate, endDate, description, minDescriptionLength }) {
    if (isPastDate(initDate)) return 'The "initDate" provided is not a valid "Date"'
    if (isPastDate(endDate)) return 'The "endDate" provided is not a valid "Date"'
    if (!isValidDateRange(initDate, endDate)) return 'The "endDate" must be greather then the "initDate" provided is not a valid "Date"'

    if (!description || typeof description !== 'string' || description.length === 0) {
        return 'The "description" provided is not a valid "string"'
    }

    if (description.length < minDescriptionLength) {
        return `The "description" must have at least ${minDescriptionLength} characters.`
    }

    const appointment_between_found = _MOCK_APPOINTMENTS.find(m => {
        if (initDate <= m.initDate && endDate >= m.endDate) return true

        if (initDate < m.endDate && initDate >= m.initDate) return true

        if (endDate > m.initDate && endDate <= m.endDate) return true

        return false
    })

    if (appointment_between_found) {
        return `The appointment date has conflict with the appointment "${appointment_between_found.description}".`
    }

    return true
}


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

function openModalForm({ id = '', description = '', calendar, day, month, year, init_hour, end_hour }) {
    const current_date = new Date()
    const date = new Date(year, month, day)

    let form = document.querySelector(`.${_CLASSES.form}`)
    if (!form) {
        form = buildFormUI(calendar)
        setFormEventListeners(form, calendar)
    }
    form.setAttribute('lscalendar-appointment-id', id)
    form.setAttribute('lscalendar-day', day)
    form.setAttribute('lscalendar-month', month)
    form.setAttribute('lscalendar-year', year)

    form.querySelector(`.${_CLASSES.formInputDesctiption}`).value = description
    form.querySelector(`.${_CLASSES.formInputHour}`).selectedIndex = init_hour || current_date.getHours()
    end_hour = end_hour || current_date.getHours() + 1
    end_hour = end_hour > 23 ? 0 : end_hour
    form.querySelector(`.${_CLASSES.formInputHourEnd}`).selectedIndex = end_hour
    form.querySelector(`.${_CLASSES.formTitle}`).innerHTML = `Selected date: ${date.toDateString()}`
    form.classList.remove(_CLASSES.hiddenForm)

    if (!!id) {
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
        openModalForm({ calendar: self, day, month, year })
    }

    self.deleteAppointment = function(form) {
        const id = form.getAttribute('lscalendar-appointment-id')

        if (!id) return 'Appointment not found'

        const appointment = getAppointmentById(id)
        if (!appointment) return 'Appointment not found'

        appointment.delete()

        return true
    }

    self.saveAppointment = function(form) {
        const id = form.getAttribute('lscalendar-appointment-id')
        const day = form.getAttribute('lscalendar-day')
        const month = self.currentDate.getMonth()
        const year = self.currentDate.getFullYear()
        const initHour = form.querySelector(`.${_CLASSES.formInputHour}`).value.split(':')
        const endHour = form.querySelector(`.${_CLASSES.formInputHourEnd}`).value.split(':')
        const initDate = new Date(year, month, day, initHour[0], initHour[1])
        const endDate = new Date(year, month, day, endHour[0], endHour[1])
        const description = form.querySelector(`.${_CLASSES.formInputDesctiption}`).value

        const appointment = new Appointment({ calendar: self, description, initDate, endDate })

        if (!!id) {
            const appointment_found = getAppointmentById(id)
            if (appointment_found) {
                appointment.color = appointment_found.color
                appointment_found.delete()
            }
        }

        const validation = isValidAppointment({ initDate, endDate, description })
        if (validation !== true) {
            alert(validation)
            return false
        }

        self.element.querySelector(`div.${_CLASSES.day}[lscalendar-day="${day}"]`).appendChild(appointment.toHTMLDivElement())

        _MOCK_APPOINTMENTS.push(appointment)

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
