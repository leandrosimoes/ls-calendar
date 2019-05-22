import { _COLORS } from './constants.js'
let _LAST_COLOR = null

/**
 * Generates a unique GUID
 * See more at https://github.com/leandrosimoes/my-useful-codes/blob/master/LANGUAGES/JS/codes.md#generate-a-guid-string
 */
export const generateGUID = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

/**
 * Get a ramdom color based on this pallete:
 *      ['#2196F3', '#9C27B0', '#3F51B5', '#F44336', '#4CAF50', '#CDDC39', '#EF6C00', '#00695C']
 */
export const getRamdomColor = () => {
    let result = _COLORS[Math.floor(Math.random() * _COLORS.length)]
    while (result === _LAST_COLOR) {
        result = _COLORS[Math.floor(Math.random() * _COLORS.length)]
    }
    return result
}

/**
 * Get the last day of the month based on the date passed as parameter
 * @param {Date} date Date used as reference
 */
export const getLastDayInMonth = date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Get the first day of the month based on the date passed as parameter
 * @param {Date} date Date used as reference
 */
export const getFirstWeekday = date => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

/**
 * Check if the dates are in a valid range
 * PS: A valid range is when the end_date is not less than the init_date
 * @param {Date} init_date Init date used as reference 
 * @param {Date} end_date End date used as reference
 * @returns {boolean} "true" if is a valid range
 */
export const isValidDateRange = (init_date, end_date) => {
    return init_date - end_date < 0
}

/**
 * Check if the date is a past date based on the current date
 * @param {Date} date Date used as reference
 * @returns {boolean} "true" if the result date is in the past
 */
export const isPastDate = (date) => {
    const init_date = new Date(date)
    const current_date = new Date()
    current_date.setHours(0, 0, 0, 0)
    init_date.setHours(0, 0, 0, 0)
    return init_date - current_date < 0
}

/**
 * Append hour options elements to a element
 * @param {HTMLSelectElement} element
 */
export const appendHoursOptions = element => {
    if (!(element instanceof HTMLSelectElement)) throw new Error("The element param must be a valid HTMLSelectElement")

    for (var i = 0; i < 24; i++) {
        const option = document.createElement('option')
        const current = i > 9 ? `${i}:00` : `0${i}:00`
        option.setAttribute('value', current)
        option.innerHTML = current
        element.appendChild(option)
    }
}
