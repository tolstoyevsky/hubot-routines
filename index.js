const nFetch = require('node-fetch')
const moment = require('moment')

/**
 * Builds a message with interactive buttons.
 *
 * @param {string} message - Text of the message (can be considered as a title).
 * @param {Array} buttons - Array of the arrays which, in turn, contain pairs --
 *                          the text of the button and a command which will be
 *                          sent to the current channel when a user pushes
 *                          the button.
 * @returns {Object}
 */
module.exports.buildMessageWithButtons = (message, buttons) => {
  var actions = []

  buttons.forEach(value => {
    actions.push({
      'type': 'button',
      'text': value[0],
      'msg': value[1],
      'msg_in_chat_window': true
    })
  })

  return {
    attachments: [
      {
        'title': message,
        'temporary_buttons': true,
        'actions': actions
      }
    ]
  }
}

/**
 * Delays by the specified number of milliseconds.
 *
 * @param {number} ms - Number of milliseconds.
 * @returns {Promise}
 */
module.exports.delay = (ms) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 * Check if the specified user exists.
 *
 * @param {Robot} robot - Hubot instance.
 * @param {User} user - User instance.
 * @returns {boolean}
 */
exports.doesUserExist = async (robot, user) => {
  const list = await robot.adapter.api.get('users.list')

  for (const item of list.users) {
    if (item._id === user.id) {
      return true
    }
  }

  return false
}

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
 * Check if the specified user is active.
 *
 * @param {Robot} robot - Hubot instance.
 * @param {string} user - User instance.
 * @returns {boolean}
 */
exports.isUserActive = async (robot, user) => {
  // It's necessary to get the users list instead of the specified user,
  // because for some reason it causes the error which is not possible
  // (at least superficially) to catch.
  // TODO: solve the issue.
  const list = await robot.adapter.api.get('users.list')
  const findUser = list.users.find(item => item._id === user.id)
  return findUser && findUser.active
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

/**
 * Sends a request to the specified URL with retries.
 *
 * @param {string} url - Requested URL.
 * @param {number} retries - Maximum number of retries.
 * @param {number} retryDelay - Delay (in milliseconds) between retries.
 * @returns {Promise}
 */
exports.retryFetch = (url, retries = 60, retryDelay = 1000) => {
  return new Promise((resolve, reject) => {
    const wrapper = n => {
      nFetch(url)
        .then(res => { resolve(res) })
        .catch(async err => {
          if (n > 0) {
            console.log(`Retrying to request ${url}. ${n} attempts left.`)
            await module.exports.delay(retryDelay)
            wrapper(--n)
          } else {
            reject(err)
          }
        })
    }

    wrapper(retries)
  })
}
