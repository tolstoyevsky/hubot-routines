const expect = require('chai').expect
const routines = require('../index')
/* eslint-disable no-unused-vars */
const moment = require('moment')
/* eslint-enable no-unused-vars */
const user = [{
  name: 'Semyon',
  role: ['user', 'admin']
},
{
  name: 'Polina',
  role: ['user']
}]
const robot = {
  logger: {
    error: function (message) {
      console.log(message)
    }
  },
  adapter: {
    api: {
      get: function (message, username) {
        let role
        message = 1
        user.forEach(function (item) {
          if (item.name === username.username) {
            role = item.role
          }
        })
        let arr = {
          user: {
            roles: role
          }
        }
        return arr
      }
    }
  }
}

/* eslint-disable no-undef */
describe('Function testing', () => {
  it('Date validation testing', () => {
    var result

    result = routines.isValidDate('01.01', 'DD.M')
    expect(result).to.equal(true)

    result = routines.isValidDate('1.01', 'DD.M')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01', 'D.M')
    expect(result).to.equal(true)

    result = routines.isValidDate('1.01', 'D.M')
    expect(result).to.equal(true)

    result = routines.isValidDate('1.1', 'D.M')
    expect(result).to.equal(true)

    result = routines.isValidDate('32.01', 'D.M')
    expect(result).to.equal(false)

    result = routines.isValidDate('31.11', 'D.M')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.13', 'D.M')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01', 'D.M.YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01.2005', 'D.M.YYYY')
    expect(result).to.equal(true)

    result = routines.isValidDate('01.01.2005', 'D.M.YYYY')
    expect(result).to.equal(true)

    result = routines.isValidDate('01.01.2005', 'D.M.YYYY')
    expect(result).to.equal(true)

    result = routines.isValidDate('29.02.2019', 'D.M.YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('30.02.2020', 'D.M.YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('30.02.2020', 'D.M.YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01.2005', 'D-M-YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01.2005', 'D/M/YYYY')
    expect(result).to.equal(false)

    result = routines.isValidDate('01.01.2005', 'D,M,YYYY')
    expect(result).to.equal(false)
  })
  it('Testing Admin Test', async () => {
    var result

    result = await routines.isAdmin(robot, 'Semyon')
    expect(result).to.equal(true)

    result = await routines.isAdmin(robot, 'Polina')
    expect(result).to.equal(false)

    result = await routines.isAdmin(robot, 'Denis')
    expect(result).to.equal(undefined)
  })

  it('Testing message output', () => {
    var result

    result = routines.rave(robot, `Hello, World!`)
    expect(result).to.equal(`
+-------------------------------------------------------------+
|                                                             |
| Hello, World!                                               |
|                                                             |
+-------------------------------------------------------------+
`
    )
    result = routines.rave(robot,
      `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
    While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
“’Tis some visitor,” I muttered, “tapping at my chamber door—
            Only this and nothing more.”`
    )
    expect(result).to.equal(`
+-------------------------------------------------------------+
|                                                             |
| Once upon a midnight dreary, while I pondered, weak and wear|
| y,                                                          |
| Over many a quaint and curious volume of forgotten lore—    |
|     While I nodded, nearly napping, suddenly there came a ta|
| pping,                                                      |
| As of some one gently rapping, rapping at my chamber door.  |
| “’Tis some visitor,” I muttered, “tapping at my chamber door|
| —                                                           |
|             Only this and nothing more.”                    |
|                                                             |
+-------------------------------------------------------------+
`
    )
  })
  /* eslint-enable no-undef */
})
