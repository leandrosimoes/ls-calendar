import { _CLASSES } from './constants.js'
import { getRamdomColor, generateGUID } from './utils.js'

export default class Appointment {
    constructor({ id, color, description, init_date, end_date, calendarInstance }) {
        this.id = id || generateGUID()
        this.description = description
        this.color = color || getRamdomColor()
        this.init_date = init_date
        this.end_date = end_date
        this.year = init_date.getFullYear()
        this.month = init_date.getMonth()
        this.day = init_date.getDate()
        this.calendarInstance = calendarInstance

        this.element = document.createElement('div')
        this.element.setAttribute('lscalendar-appointment-id', this.id)
        this.element.classList.add(_CLASSES.appointment)

        this.init_hour = this.init_date.getHours()
        this.init_hour_description = this.init_hour > 9 ? `${this.init_hour}:00` : `0${this.init_hour}:00`

        this.end_hour = this.end_date.getHours()
        this.end_hour_description = this.end_hour > 9 ? `${this.end_hour}:00` : `0${this.end_hour}:00`
        this.element.innerHTML = `${this.description} - ${this.init_hour_description} / ${this.end_hour_description}`

        this.element.style.backgroundColor = this.color

        this.element.addEventListener('click', event => {
            event.preventDefault()

            this.calendarInstance.openFormModal({ ...this })

            event.stopPropagation()
        })
    }

    destroy() {
        const element = document.querySelector(`.${_CLASSES.appointment}[lscalendar-appointment-id="${this.id}"]`) || this.element

        if (!element) return

        element.remove()
    }
}
