import { _COLORS } from './constants.js'

let _LAST_COLOR = null
export const generateUUID = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

export const getRamdomColor = () => {
    let result = _COLORS[Math.floor(Math.random() * _COLORS.length)]
    while (result === _LAST_COLOR) {
        result = _COLORS[Math.floor(Math.random() * _COLORS.length)]
    }
    return result
}

export const getLastDayInMonth = date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export const getFirstWeekday = date => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

export const getLastWeekday = date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay()
}

export const isValidDateRange = (initDate, endDate) => {
    return initDate - endDate < 0
}

export const isPastDate = (year, month, day) => {
    const date = new Date(year, month, day)
    const current_date = new Date()
    current_date.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date - current_date < 0
}

export const buildHourSelectOptions = () => {
    const result = []
    for (var i = 0; i < 24; i++) {
        const current = i > 9 ? `${i}:00` : `0${i}:00`
        result.push(`<option value="${current}">${current}</option>`)
    }
    return result.join()
}
