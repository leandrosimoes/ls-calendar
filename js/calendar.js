;(function(window, document) {
    const WEEK_DAYS = ['Sun', 'Mon', 'Thu', 'Wed', 'Thu', 'Fri', 'Sat']
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const CLASSES = {
        initClass: 'lscalendar',
        dayClass: 'lscalendar__day',
        pastDayClass: 'lscalendar__day--disabled',
        noDayClass: 'lscalendar__no_day',
        weekClass: 'lscalendar__week',
        headerClass: 'lscalendar__header',
        headerButtonClass: 'lscalendar__header_button',
        monthNameClass: 'lscalendar__header_month_name',
        formClass: 'lscalendar__form',
        appointments: [],
        minDescriptionLength: 10,
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

        if (description.length < options.minDescriptionLength) return `The "description" must have at least ${minDescriptionLength} characters.`

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

    function buildUI(self) {
        const { pastDayClass, dayClass, noDayClass, weekClass, monthNameClass, headerClass, headerButtonClass, initClass, formClass } = CLASSES

        const { element, wrapper, currentDate } = self
        element.classList.add(initClass)

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
        current_week.classList.add(weekClass)

        const prevButton = document.createElement('button')
        prevButton.innerText = '<'
        prevButton.classList.add(headerButtonClass)

        const monthName = document.createElement('span')
        monthName.innerText = `${MONTHS[currentMonth]} ${currentYear}`
        monthName.classList.add(monthNameClass)

        const nextButton = document.createElement('button')
        nextButton.innerText = '>'
        nextButton.classList.add(headerButtonClass)

        const header = document.createElement('div')
        header.appendChild(prevButton)
        header.appendChild(monthName)
        header.appendChild(nextButton)
        header.classList.add(headerClass)

        wrapper.appendChild(header)

        self.monthName = monthName
        self.prevButton = prevButton
        self.nextButton = nextButton

        for (let i = first_index; i <= last_index; i++) {
            const day = document.createElement('div')

            if (i >= first_day && i <= last_day) {
                day.setAttribute('lscalendar-day', i)
            } else {
                day.classList.add(noDayClass)
            }

            day.setAttribute('lscalendar-weekday', WEEK_DAYS[current_weekday])

            day.classList.add(dayClass)

            if (isPastDate(currentYear, currentMonth, i)) {
                day.classList.add(pastDayClass)
            }

            if (total_weeks > 0) {
                current_week.appendChild(day)
                element.appendChild(current_week)
                self.days.push(day)

                if (current_weekday === 6) {
                    current_weekday = 0
                    current_week = document.createElement('div')
                    current_week.classList.add(weekClass)
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
        const { noDayClass, pastDayClass } = CLASSES

        days.forEach(day => {
            if (!day.classList.contains(noDayClass) && !day.classList.contains(pastDayClass)) {
                day.removeEventListener('click', self.openAppointmentModal, false)
            }
        })

        self.monthName.removeEventListener('click', self.goToCurrentMonth, false)

        self.prevButton.removeEventListener('click', self.goToPrevMonth, false)

        self.nextButton.removeEventListener('click', self.goToNextMonth, false)
    }

    function setEventListeners(self) {
        const { days } = self
        const { noDayClass, pastDayClass } = CLASSES

        days.forEach(day => {
            if (!day.classList.contains(noDayClass) && !day.classList.contains(pastDayClass)) {
                day.addEventListener('click', self.openAppointmentModal)
            }
        })

        self.monthName.addEventListener('click', self.goToCurrentMonth)

        self.prevButton.addEventListener('click', self.goToPrevMonth)

        self.nextButton.addEventListener('click', self.goToNextMonth)
    }

    function clearProperties(self) {
        self.element.remove()
        self.element = document.createElement('div')
        self.appointments = []
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
        self.appointments = []
        self.days = []
        self.currentDate = currentDate
        self.monthName = null
        self.nextButton = null
        self.prevButton = null

        self.openAppointmentModal = function() {}

        self.addAppointment = function({ day, description }) {
            const year = self.currentDate.getFullYear()
            const month = self.currentDate.getMonth()
            const date = new Date(year, month, day)

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
