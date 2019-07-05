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
  it('Testing building messages with interactive buttons', () => {
    var result

    result = routines.buildMessageWithButtons('Hello', [
      ['Say hello?', 'hello'],
      ['Don\'t say hello', 'not saying hello']
    ])

    expected = {
      attachments: [
        {
          'title': 'Hello',
          'temporary_buttons': true,
          'actions': [
            {
              'type': 'button',
              'text': 'Say hello?',
              'msg': 'hello',
              'msg_in_chat_window': true
            },
            {
              'type': 'button',
              'text': 'Don\'t say hello',
              'msg': 'not saying hello',
              'msg_in_chat_window': true
            }
          ]
        }
      ]
    }

    expect(result).to.deep.equal(expected)
  })

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

  it('Testing presence of bot in channel or group', async () => {
    let result
    let robot = {}
    robot.adapter = {}
    robot.adapter.api = {}
    robot.adapter.api.get = async () => {
      return {
        channels: [{
          name: 'existingChannel1'
        }, {
          name: 'existingChannel2'
        }],
        groups: [{
          name: 'existingGroup1'
        }, {
          name: 'existingGroup2'
        }]
      }
    }

    result = await routines.isBotInRoom(robot, 'existingChannel1')
    expect(result).to.equal(true)

    result = await routines.isBotInRoom(robot, 'existingGroup2')
    expect(result).to.equal(true)

    result = await routines.isBotInRoom(robot, 'existingRoom3')
    expect(result).to.equal(false)
  })

  it('Testing getting all existing users', async () => {
    const existingUser = { _id: '_1a2b3c', id: '_1a2b3c', name: 'user', active: true }
    const nonExistingUser = { _id: '_4d5f6g', id: '_4d5f6g', name: 'user2' }
    const existingNonActiveUser = { _id: '_9z8x7y', id: '_9z8x7y', name: 'user3' }
    const robot = {
      brain: {
        data: {
          users: { _1a2b3c: existingUser, _4d5f6g: nonExistingUser, _9z8x7y: existingNonActiveUser }
        }
      },
      adapter: {
        api: {
          get: () => {
            return {
              users: []
            }
          }
        }
      }
    }

    result = await routines.getAllUsers(robot)
    expect(result).to.deep.equal([])
  })

  it('Testing checking is user have permissions', async () => {
    const permissions = {
      update: [
        {
          _id: 'access-permissions',
          _updatedAt: '2018-11-28T11:55:49.106Z',
          roles: [
            'admin'
          ]
        }, {
          _id: 'add-user-to-joined-room',
          _updatedAt: '2018-11-28T11:55:49.106Z',
          roles: [
            'admin',
            'moderator',
            'owner'
          ]
        }
      ],
      remove: [],
      success: true
    }

    const robot = {
      adapter: {
        api: {
          get: async (method) => {
            if (method === 'permissions.listAll') {
              return permissions
            }
          }
        }
      }
    }

    let result

    const adminUser = {
      _id: 'nSYqWzZ4GsKTX4dyK',
      name: 'admin',
      roles: [
        'admin'
      ]
    }

    // Checking one success permission
    result = await routines.hasPermissions(
      robot,
      adminUser,
      'access-permissions'
    )
    expect(result).to.equal(true)

    // Check two success permission
    result = await routines.hasPermissions(
      robot,
      adminUser,
      'access-permissions',
      'add-user-to-joined-room'
    )
    expect(result).to.equal(true)

    const moderatorUser = {
      _id: 'nSYqWzZ4GsKTX4dyK',
      name: 'moderator',
      roles: [
        'moderator'
      ]
    }

    // Check one failed permission
    result = await routines.hasPermissions(
      robot,
      moderatorUser,
      'access-permissions'
    )
    expect(result).to.equal(false)

    // Check one failed one success permission
    result = await routines.hasPermissions(
      robot,
      moderatorUser,
      'access-permissions',
      'add-user-to-joined-room'
    )
    expect(result).to.equal(false)

    const regularUser = {
      _id: 'nSYqWzZ4GsKTX4dyK',
      name: 'user',
      roles: [
        'user'
      ]
    }

    // Check two failed permission
    result = await routines.hasPermissions(
      robot,
      regularUser,
      'access-permissions',
      'add-user-to-joined-room'
    )
    expect(result).to.equal(false)

    // Check unknown permission
    result = await routines.hasPermissions(
      robot,
      regularUser,
      'unknown-permission'
    )
    expect(result).to.equal(false)
  })
  /* eslint-enable no-undef */
})
