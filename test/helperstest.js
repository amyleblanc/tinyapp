const assert = require('chai').assert;
const getUserByEmail = require('../helpers.js');
const users = require('../express_server.js');


describe('getUserByEmail', function() {
  it('should return a user ID when passed a registered user email', function() {
    const user = getUserByEmail("user1@email.com", users);
    const expectedOutput = "randomID";
    assert.strictEqual(user, expectedOutput);
  });

  it("should return 'false' when passed an unregistered email", function() {
    const user = getUserByEmail("unknown@email.com", users);
    const expectedOutput = false;
    assert.isFalse(user, expectedOutput);
  })

});