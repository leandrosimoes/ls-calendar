import { _CLASSES, _MONTHS, _WEEK_DAYS } from './constants.js'
import { getFirstWeekday, getLastWeekday, getLastDayInMonth, isPastDate, buildHourSelectOptions } from './utils.js'
import { getAppointmentsByPeriod } from './data.js'

const unsetEventHandlers = calendar => {
    const close_button = calendar.form.querySelector(`.${_CLASSES.form_close_button}`)
    const save_button = calendar.form.querySelector(`.${_CLASSES.form_button_save}`)
    const delete_button = calendar.form.querySelector(`.${_CLASSES.form_button_delete}`)

    calendar.days.forEach(day => {
        if (!day.classList.contains(_CLASSES.no_day) && !day.classList.contains(_CLASSES.past_day)) {
            day.removeEventListener('click', calendar.openFormModal, false)
        }
    })

    calendar.month_name.removeEventListener('click', calendar.goToCurrentMonth, false)

    calendar.prev_button.removeEventListener('click', calendar.goToPrevMonth, false)

    calendar.next_button.removeEventListener('click', calendar.goToNextMonth, false)

    close_button.removeEventListener('click', calendar.closeFormModal, false)

    save_button.removeEventListener('click', calendar.saveAppointment, false)

    delete_button.removeEventListener('click', calendar.deleteAppointment, false)
}

export const destroyCalendarUI = calendar => {
    if (!calendar.wrapper) return

    unsetEventHandlers(calendar)

    calendar.wrapper.innerHTML = ''

    calendar.element.remove()
    calendar.element = document.createElement('div')
    calendar.days = []
    calendar.current_date = calendar.current_date || new Date()
    calendar.month_name = null
    calendar.next_button = null
    calendar.prev_button = null
}

const setEventHandlers = calendar => {
    const close_button = calendar.form.querySelector(`.${_CLASSES.form_close_button}`)
    const save_button = calendar.form.querySelector(`.${_CLASSES.form_button_save}`)
    const delete_button = calendar.form.querySelector(`.${_CLASSES.form_button_delete}`)

    calendar.days.forEach(day => {
        if (!day.classList.contains(_CLASSES.no_day) && !day.classList.contains(_CLASSES.past_day)) {
            day.addEventListener('click', event => {
                const year = calendar.element.getAttribute('lscalendar-year')
                const month = calendar.element.getAttribute('lscalendar-month')
                calendar.openFormModal({ year, month, day: day.getAttribute('lscalendar-day') })
            })
        }
    })

    calendar.month_name.addEventListener('click', calendar.goToCurrentMonth.bind(calendar))

    calendar.prev_button.addEventListener('click', calendar.goToPrevMonth.bind(calendar))

    calendar.next_button.addEventListener('click', calendar.goToNextMonth.bind(calendar))

    close_button.addEventListener('click', calendar.closeFormModal.bind(calendar))

    save_button.addEventListener('click', calendar.saveAppointment.bind(calendar))

    delete_button.addEventListener('click', calendar.deleteAppointment.bind(calendar))
}

export const buildCalendarUI = calendar => {
    calendar.element = document.createElement('div')
    calendar.element.classList.add(_CLASSES.main)

    const first_weekday = getFirstWeekday(calendar.current_date)
    const last_weekday = getLastWeekday(calendar.current_date)
    let current_weekday = calendar.current_date.getDay()

    const first_day = 1
    const first_index = 1 - first_weekday
    const last_index = getLastDayInMonth(calendar.current_date) + (7 - last_weekday)
    const last_day = getLastDayInMonth(calendar.current_date)
    const current_month = calendar.current_date.getMonth()
    const current_year = calendar.current_date.getFullYear()
    let total_weeks = 5

    calendar.element.setAttribute('lscalendar-month', current_month)
    calendar.element.setAttribute('lscalendar-year', current_year)

    current_weekday = 0
    let current_week = document.createElement('div')
    current_week.classList.add(_CLASSES.week)

    const prev_button = document.createElement('button')
    prev_button.innerText = '‹'
    prev_button.classList.add(_CLASSES.header_button)

    const month_name = document.createElement('span')
    month_name.innerText = `${_MONTHS[current_month]} ${current_year}`
    month_name.classList.add(_CLASSES.month_name)

    const next_button = document.createElement('button')
    next_button.innerText = '›'
    next_button.classList.add(_CLASSES.header_button)

    const header = document.createElement('div')
    header.appendChild(prev_button)
    header.appendChild(month_name)
    header.appendChild(next_button)
    header.classList.add(_CLASSES.header)

    calendar.element.appendChild(header)

    calendar.month_name = month_name
    calendar.prev_button = prev_button
    calendar.next_button = next_button

    for (let i = first_index; i <= last_index; i++) {
        const day = document.createElement('div')

        if (i >= first_day && i <= last_day) {
            day.setAttribute('lscalendar-day', i)
        } else {
            day.classList.add(_CLASSES.no_day)
        }

        if (i >= first_index - 1 && i <= first_index + 6) day.setAttribute('lscalendar-weekday', _WEEK_DAYS[current_weekday])

        day.classList.add(_CLASSES.day)

        if (isPastDate(current_year, current_month, i)) {
            day.classList.add(_CLASSES.past_day)
        }

        if (total_weeks > 0) {
            current_week.appendChild(day)
            calendar.element.appendChild(current_week)
            calendar.days.push(day)

            if (current_weekday === 6) {
                current_weekday = 0
                current_week = document.createElement('div')
                current_week.classList.add(_CLASSES.week)
                total_weeks--
            } else {
                current_weekday++
            }
        }

        fillAppointments(calendar, day)
    }

    calendar.wrapper.appendChild(calendar.element)

    const form = document.createElement('div')
    form.classList.add(_CLASSES.form)
    form.classList.add(_CLASSES.hidden_form)

    const close_button = document.createElement('span')
    close_button.classList.add(_CLASSES.form_close_button)
    close_button.innerHTML = '&times;'

    const form_title = document.createElement('span')
    form_title.classList.add(_CLASSES.form_title)
    form_title.innerHTML = 'Teste'

    const form_input_wrapper = document.createElement('div')

    const description_input = document.createElement('input')
    description_input.classList.add(_CLASSES.form_input)
    description_input.classList.add(_CLASSES.form_input_description)
    description_input.setAttribute('type', 'text')
    description_input.setAttribute('placeholder', 'Description')

    const hour_options = buildHourSelectOptions()
    const hour_input = document.createElement('select')
    hour_input.classList.add(_CLASSES.form_input)
    hour_input.classList.add(_CLASSES.form_input_hour)
    hour_input.innerHTML = hour_options

    const hour_end_input = document.createElement('select')
    hour_end_input.classList.add(_CLASSES.form_input)
    hour_end_input.classList.add(_CLASSES.form_input_hour_end)
    hour_end_input.innerHTML = hour_options

    const save_button = document.createElement('button')
    save_button.classList.add(_CLASSES.form_button)
    save_button.classList.add(_CLASSES.form_button_save)
    save_button.setAttribute('type', 'button')
    save_button.innerHTML = 'SAVE'

    const delete_button = document.createElement('button')
    delete_button.classList.add(_CLASSES.form_button)
    delete_button.classList.add(_CLASSES.form_button_delete)
    delete_button.classList.add(_CLASSES.hidden_form)
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

    calendar.element.appendChild(form)
    calendar.form = form

    setEventHandlers(calendar)
}

export const fillAppointments = (calendar, day_element) => {
    const year = calendar.element.getAttribute('lscalendar-year')
    const month = calendar.element.getAttribute('lscalendar-month')
    const day = day_element.getAttribute('lscalendar-day')

    const init_date = new Date(year, month, day, 0, 0, 0)
    const end_date = new Date(year, month, day, 23, 59, 59)

    const appointments_of_day = getAppointmentsByPeriod(init_date, end_date)
    appointments_of_day.forEach(appointment => {
        day_element.appendChild(appointment.element)
    })
}
