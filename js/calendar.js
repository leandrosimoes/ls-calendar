;(function(window, document) {
    const WEEK_DAYS = ['Sun', 'Mon', 'Thu', 'Wed', 'Thu', 'Fri', 'Sat']
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const CLASSES = {
        init: 'lscalendar',
        day: 'lscalendar__day',
        pastDay: 'lscalendar__day--disabled',
        noDay: 'lscalendar__no_day',
        week: 'lscalendar__week',
        header: 'lscalendar__header',
        headerButton: 'lscalendar__header_button',
        monthName: 'lscalendar__header_month_name',
        form: 'lscalendar__form',
        formCloseButton: 'lscalendar__form_close_button',
        formTitle: 'lscalendar__form_title',
        formInputWrapper: 'lscalendar__form_input_wrapper',
        formInput: 'lscalendar__form_input',
        formButton: 'lscalendar__form_button',
        formButtonBlue: 'lscalendar__form_button--blue',
        formButtonRed: 'lscalendar__form_button--red',
        formInputHour: 'lscalendar__form_input_Hour',
        formInputMinute: 'lscalendar__form_input_Minute',
        formInputDesctiption: 'lscalendar__form_input_Description',
        hiddenForm: 'lscalendar__form--hidden',
        appointments: [],
        minDescriptionLength: 10,
    }
    function getAppointments() {
        const MOCK_APPOINTMENTS = []

        return MOCK_APPOINTMENTS
    }

    function getLastDayInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    function getFirstWeekday(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    function getLastWeekday(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay()
    }

    function isValidAppointment({ date, description, minDescriptionLength }) {
        if (isPastDate(date)) return 'The "date" provided is not a valid "Date"'

        if (!description || typeof description !== 'string' || description.length === 0) return 'The "description" provided is not a valid "string"'

        if (description.length < minDescriptionLength) return `The "description" must have at least ${minDescriptionLength} characters.`

        const existent_appointments = getAppointments()
        // VALIDAR COLISÃO DE DATAS

        return true
    }

    function destroyUI(self) {
        unsetEventListeners(self)

        self.wrapper.innerHTML = ''
    }

    function isPastDate(year, month, day) {
        const date = new Date(year, month, day)
        const current_date = new Date()
        current_date.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)
        return date - current_date < 0
    }

    function buildFormUI(self) {
        form = document.createElement('div')
        form.classList.add(CLASSES.form)
        form.classList.add(CLASSES.hiddenForm)

        const close_button = document.createElement('span')
        close_button.classList.add(CLASSES.formCloseButton)
        close_button.innerHTML = 'x'

        const form_title = document.createElement('h4')
        form_title.classList.add(CLASSES.formTitle)
        form_title.innerHTML = 'Teste'

        const form_input_wrapper = document.createElement('div')

        const description_input = document.createElement('input')
        description_input.classList.add(CLASSES.formInput)
        description_input.classList.add(CLASSES.formInputDesctiption)
        description_input.setAttribute('type', 'text')
        description_input.setAttribute('placeholder', 'Description')

        const hour_input = document.createElement('input')
        hour_input.classList.add(CLASSES.formInput)
        hour_input.classList.add(CLASSES.formInputHour)
        hour_input.setAttribute('type', 'time')

        const current_date = new Date()
        current_date.setHours(new Date().getHours() + 1)
        hour_input.value = `${current_date.getHours()}:${current_date.getMinutes()}`

        const save_button = document.createElement('button')
        save_button.classList.add(CLASSES.formButton)
        save_button.classList.add(CLASSES.formButtonBlue)
        save_button.setAttribute('type', 'button')
        save_button.innerHTML = 'SAVE'

        form.appendChild(form_title)
        form.appendChild(close_button)
        form_input_wrapper.appendChild(description_input)
        form_input_wrapper.appendChild(hour_input)
        form_input_wrapper.appendChild(save_button)
        form.appendChild(form_input_wrapper)

        self.wrapper.appendChild(form)

        return form
    }

    function buildUI(self) {
        const { element, wrapper, currentDate } = self
        element.classList.add(CLASSES.init)

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
        current_week.classList.add(CLASSES.week)

        const prevButton = document.createElement('button')
        prevButton.innerText = '<'
        prevButton.classList.add(CLASSES.headerButton)

        const monthName = document.createElement('span')
        monthName.innerText = `${MONTHS[currentMonth]} ${currentYear}`
        monthName.classList.add(CLASSES.monthName)

        const nextButton = document.createElement('button')
        nextButton.innerText = '>'
        nextButton.classList.add(CLASSES.headerButton)

        const header = document.createElement('div')
        header.appendChild(prevButton)
        header.appendChild(monthName)
        header.appendChild(nextButton)
        header.classList.add(CLASSES.header)

        wrapper.appendChild(header)

        self.monthName = monthName
        self.prevButton = prevButton
        self.nextButton = nextButton

        for (let i = first_index; i <= last_index; i++) {
            const day = document.createElement('div')

            if (i >= first_day && i <= last_day) {
                day.setAttribute('lscalendar-day', i)
            } else {
                day.classList.add(CLASSES.noDay)
            }

            day.setAttribute('lscalendar-weekday', WEEK_DAYS[current_weekday])

            day.classList.add(CLASSES.day)

            if (isPastDate(currentYear, currentMonth, i)) {
                day.classList.add(CLASSES.pastDay)
            }

            if (total_weeks > 0) {
                current_week.appendChild(day)
                element.appendChild(current_week)
                self.days.push(day)

                if (current_weekday === 6) {
                    current_weekday = 0
                    current_week = document.createElement('div')
                    current_week.classList.add(CLASSES.week)
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
            if (!day.classList.contains(CLASSES.noDay) && !day.classList.contains(CLASSES.pastDay)) {
                day.removeEventListener('click', self.openModalForm, false)
            }
        })

        self.monthName.removeEventListener('click', self.goToCurrentMonth, false)

        self.prevButton.removeEventListener('click', self.goToPrevMonth, false)

        self.nextButton.removeEventListener('click', self.goToNextMonth, false)
    }

    function setFormEventListeners(form, self) {
        const close_button = form.querySelector(`.${CLASSES.formCloseButton}`)
        const save_button = form.querySelector(`.${CLASSES.formButtonBlue}`)
        const description_input = form.querySelector(`.${CLASSES.formInputDesctiption}`)
        const hour_input = form.querySelector(`.${CLASSES.formInputHour}`)
        const form_title = form.querySelector(`.${CLASSES.formTitle}`)

        close_button.addEventListener('click', event => {
            description_input.value = ''
            form_title.innerHTML = ''
            form.removeAttribute('lscalendar-day')
            form.removeAttribute('lscalendar-month')
            form.removeAttribute('lscalendar-year')
            form.classList.add(CLASSES.hiddenForm)
        })

        save_button.addEventListener('click', event => {
            const day = form.getAttribute('lscalendar-day')
            const month = self.currentDate.getMonth()
            const year = self.currentDate.getFullYear()
            const hours = hour_input.valueAsDate.getHours()
            const minutes = hour_input.valueAsDate.getMinutes()
            const date = new Date(year, month, day, hours, minutes)
            const description = description_input.value
            
            self.addAppointment({ date, description })
        })
    }
    function setEventListeners(self) {
        const { days } = self

        days.forEach(day => {
            if (!day.classList.contains(CLASSES.noDay) && !day.classList.contains(CLASSES.pastDay)) {
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
            const date = new Date(year, month, day)

            let form = document.querySelector(`.${CLASSES.form}`)
            if (!form) {
                form = buildFormUI(self)
                setFormEventListeners(form, self)
            }
            form.setAttribute('lscalendar-day', day)
            form.setAttribute('lscalendar-day', month)
            form.setAttribute('lscalendar-day', year)
            form.querySelector(`.${CLASSES.formTitle}`).innerHTML = `Selected date: ${date.toDateString()}`
            form.classList.remove(CLASSES.hiddenForm)
        }

        self.addAppointment = function({ date, description }) {
            const validation = isValidAppointment({ date, description })
            if (validation !== true) {
                alert(validation)
                return false
            }

            // ADD VALIDATION

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
})(window, document)
