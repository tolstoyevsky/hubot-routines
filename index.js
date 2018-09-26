const moment = require('moment')

/**
 * Checks if the specified date
 * 1. follows the format stored in the DATE_FORMAT constant;
 * 2. is a valid date.
 *
 * @param {string} date - Date to be validated.
 * @param {string} format - Date formating.
 * @returns {boolean}
 */
exports.isValidDate = function (date, format) {
  return typeof date === 'string' && moment(date, format, true).isValid()
}

/**
 * Use API to check if the specified user is admin.
 *
 * @param {Robot} robot - Hubot instance.
 * @param {string} username - Username.
 * @return {boolean|undefined} - If user is admin or not.
 */
exports.isAdmin = async function (robot, username) {
  try {
    const info = await robot.adapter.api.get('users.info', { username: username })

    if (!info.user) {
      throw new Error('No user data returned')
    }

    if (!info.user.roles) {
      throw new Error('User data did not include roles')
    }

    return info.user.roles.indexOf('admin') !== -1
  } catch (err) {
    robot.logger.error('Could not get user data with bot, ensure it has `view-full-other-user-info` permission', err)
  }
}

/**
 * Output hubot error.
 *
 * @param {Robot} robot - Hubot instance.
 * @param {string | object} message - Message error.
 * @return {void}
 */
exports.rave = function (robot, message) {
  function addChar (char, quantity) {
    let str = ''
    for (let i = 1; i <= quantity; i++) str += char
    return str
  }

  const WIDTH = 60

  let borderLine = `+${addChar('-', WIDTH + 1)}+`
  let paddingLine = `|${addChar(' ', WIDTH + 1)}|`
  let formalizedMess = ''
  let lines
  let addSpace

  if (typeof message === 'object') {
    message = `${message.name}\n${message.message}\n${message.stack}`
  }

  while (message.indexOf('\n') > -1) {
    let indexOf = message.indexOf('\n')
    addSpace = WIDTH - indexOf % WIDTH
    message = message.replace('\n', addChar(' ', addSpace))
  }

  addSpace = WIDTH - message.length % WIDTH
  message += addChar(' ', addSpace)
  formalizedMess += '\n' + borderLine + '\n' + paddingLine + '\n'
  lines = Math.ceil(message.length / WIDTH)

  for (let i = 0; i <= lines - 1; i++) {
    formalizedMess += `| ${message.slice(i * WIDTH, i * WIDTH + WIDTH)}|\n`
  }
  formalizedMess += paddingLine + '\n' + borderLine + '\n'
  robot.logger.error(formalizedMess)
  return formalizedMess
}
