import { _CLASSES } from './constants.js'
import { getRamdomColor } from './utils.js'

export default class Appointments {
    constructor({ description, init_date, end_date, on_click }) {
        this.id = init_date.getTime() + end_date.getTime()
        this.description = description
        this.color = getRamdomColor()
        this.init_date = init_date
        this.end_date = end_date
        this.year = init_date.getFullYear()
        this.month = init_date.getMonth()
        this.day = init_date.getDate()

        this.element = document.createElement('div')
        this.element.classList.add(_CLASSES.appointment)

        this.init_hour = this.init_date.getHours()
        this.init_hour_description = this.init_hour > 9 ? `${this.init_hour}:00` : `0${this.init_hour}:00`

        this.end_hour = this.end_date.getHours()
        this.end_hour_description = this.end_hour > 9 ? `${this.end_hour}:00` : `0${this.end_hour}:00`
        this.element.innerHTML = `${this.description} - ${this.init_hour_description} / ${this.end_hour_description}`

        this.element.style.backgroundColor = this.color

        this.on_click = on_click.bind(this)
        this.element.addEventListener('click', event => {
            event.preventDefault()

            this.on_click && this.on_click()

            event.stopPropagation()
        })
    }

    destroy() {
        if (!this.element) return

        this.element.removeEventListener('click', this.on_click)
        this.element.remove()
    }

    setColor(color) {
        this.element.style.backgroundColor = color
    }
}
