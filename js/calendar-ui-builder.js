import { _CLASSES, _MONTHS, _WEEK_DAYS } from './constants.js'
import { getFirstWeekday, getLastDayInMonth, isPastDate, appendHoursOptions } from './utils.js'
import { getAppointmentsByPeriod } from './data.js'

const CALENDAR_TEMPLATE = `
    <div class="lscalendar">
        <div class="lscalendar__header">
            <button class="lscalendar__header__button lscalendar__header__prev_button">‹</button>
            <span class="lscalendar__header__month_name"></span>
            <button class="lscalendar__header__button lscalendar__header__next_button">›</button>
        </div>
        <div class="lscalendar__weekdays">
            <div class="lscalendar__weekday">Sun</div>
            <div class="lscalendar__weekday">Mon</div>
            <div class="lscalendar__weekday">Thu</div>
            <div class="lscalendar__weekday">Wed</div>
            <div class="lscalendar__weekday">Thu</div>
            <div class="lscalendar__weekday">Fri</div>
            <div class="lscalendar__weekday">Sat</div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__week">
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
            <div class="lscalendar__day"></div>
        </div>
        <div class="lscalendar__form lscalendar__form--hidden">
            <span class="lscalendar__form__title"></span>
            <span class="lscalendar__form__close_button">×</span>
            <div>
                <input class="lscalendar__form__input lscalendar__form__input_description" type="text" placeholder="Description">
                <select class="lscalendar__form__input lscalendar__form__input_hour"></select>
                <select class="lscalendar__form__input lscalendar__form__input_hour_end"></select>
                <button class="lscalendar__form_button lscalendar__form_button--blue" type="button">SAVE</button>
                <button class="lscalendar__form_button lscalendar__form_button--red lscalendar__form--hidden" type="button">DELETE</button>
            </div>
        </div>
    </div>
`

/**
 * Set all the LsCalendar elements events
 * @param {object} calendar LsCalendar class instance 
 */
const setEventHandlers = calendar => {
    const close_button = document.querySelector(`.${_CLASSES.form_close_button}`)
    const save_button = document.querySelector(`.${_CLASSES.form_button_save}`)
    const delete_button = document.querySelector(`.${_CLASSES.form_button_delete}`)
    const days = document.querySelectorAll(`.${_CLASSES.day}`)
    const month_name = document.querySelector(`.${_CLASSES.month_name}`)
    const prev_button = document.querySelector(`.${_CLASSES.prev_button}`)
    const next_button = document.querySelector(`.${_CLASSES.next_button}`)

    days.forEach(day => {
        day.addEventListener('click', event => {
            if (!event.target.classList.contains(_CLASSES.no_day) && !event.target.classList.contains(_CLASSES.past_day)) {
                const year = calendar.element.getAttribute('lscalendar-year')
                const month = calendar.element.getAttribute('lscalendar-month')
                calendar.openFormModal({ year, month, day: event.target.getAttribute('lscalendar-day') })
            }
        })
    })

    month_name.addEventListener('click', calendar.goToCurrentMonth.bind(calendar))

    prev_button.addEventListener('click', calendar.goToPrevMonth.bind(calendar))

    next_button.addEventListener('click', calendar.goToNextMonth.bind(calendar))

    close_button.addEventListener('click', calendar.closeFormModal.bind(calendar))

    save_button.addEventListener('click', calendar.saveAppointment.bind(calendar))

    delete_button.addEventListener('click', calendar.deleteAppointment.bind(calendar))

    calendar.eventsReady = true
}

/**
 * @description Build and render the LsCalendar UI at DOM
 * @param {LsCalendar} calendar LsCalendar instance
 */
export const buildCalendarUI = calendar => {
    if (!calendar.wrapper.innerHTML){
        calendar.wrapper.innerHTML = CALENDAR_TEMPLATE
    }

    calendar.element = document.querySelector(`.${_CLASSES.main}`)
    calendar.element.id = calendar.id

    const first_day_in_month = 1
    const last_day_in_month = getLastDayInMonth(calendar.current_date)
    const first_weekday_in_month = getFirstWeekday(calendar.current_date)
    const current_month = calendar.current_date.getMonth()
    const current_year = calendar.current_date.getFullYear()
    const month_name = document.querySelector(`.${_CLASSES.month_name}`)
    month_name.innerText = `${_MONTHS[current_month]} ${current_year}`

    let weeks = document.querySelectorAll(`.${_CLASSES.week}`)

    // Imagine that the first weekday of a month is day 3
    // In this case, the count_day would be -2
    // I store this number to know what day I should start
    // to fill the data, properties, css classes just when the count_day
    // is greather than or equal the day 1. Otherwise, the days
    // before that will be set the "no day's" data, properties, 
    // css classes etc.
    let count_day = first_day_in_month - first_weekday_in_month

    calendar.element.setAttribute('lscalendar-month', current_month)
    calendar.element.setAttribute('lscalendar-year', current_year)

    weeks.forEach(week => {
        // Some months has to show 5 weeks others has to show 6
        // so I fist hidde the week, and than, if the week has a
        // "day to show" (not all of them are "no day"), then I show
        // the week again
        week.classList.add(_CLASSES.hidden_week)

        const days = week.querySelectorAll(`.${_CLASSES.day}`)
        
        let current_weekday = 0
        days.forEach(day => {
            // Here is what I consider a "day to show". A "day to show" is when the 
            // count_day is greather than day 1 and less than last_day_in_month.
            // After or before that, I consider as a "no day".
            if (count_day >= first_day_in_month && count_day <= last_day_in_month) {
                day.classList.remove(_CLASSES.no_day)
                day.setAttribute('lscalendar-day', count_day)

                // Fill the appointments stored for this day
                fillAppointments(calendar, day)

                // As the day is a "valid day", show the week again
                week.classList.remove(_CLASSES.hidden_week)
            } else {
                day.removeAttribute('lscalendar-day')
                day.classList.add(_CLASSES.no_day)
                day.innerHTML = ''
            }

            const date = new Date(current_year, current_month, count_day)
            if (isPastDate(date)) {
                day.innerHTML = ''
                day.classList.add(_CLASSES.past_day)
            } else {
                day.classList.remove(_CLASSES.past_day)
            }

            day.setAttribute('lscalendar-weekday', _WEEK_DAYS[current_weekday])

            current_weekday++
            count_day++
        })
    })

    const init_hour_input = document.querySelector(`.${_CLASSES.form_input_hour}`)
    const end_hour_input = document.querySelector(`.${_CLASSES.form_input_hour_end}`)
    
    appendHoursOptions(init_hour_input)
    appendHoursOptions(end_hour_input)

    // As this function is called multiple times to rebuild the UI,
    // this verification ensure that the events is binded just once
    if (!calendar.eventsReady) {
        setEventHandlers(calendar)
    }

    calendar.element.dataset['lscalendar'] = this
}

/**
 * Fill all the stored data appointments for the day in question
 * @param {calendar} calendar LsCalendar instance
 * @param {day_element} day_element HTMLDivElement of the day
 */
export const fillAppointments = (calendar, day_element) => {
    day_element.innerHTML = ''

    const year = calendar.element.getAttribute('lscalendar-year')
    const month = calendar.element.getAttribute('lscalendar-month')
    const day = day_element.getAttribute('lscalendar-day')

    const init_date = new Date(year, month, day, 0, 0, 0)
    const end_date = new Date(year, month, day, 23, 59, 59)

    const appointments_of_day = getAppointmentsByPeriod(init_date, end_date)
    appointments_of_day.forEach(appointment => {
        appointment.calendarInstance = calendar
        day_element.appendChild(appointment.element)
    })
}
