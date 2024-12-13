const jwt = require('jsonwebtoken')

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    req.user = null // No token, user is not logged in
    return next()
  }

  // Verify the token if it exists
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      req.user = null // Invalid token, set user to null
      return next()
    }

    // Attach user information if token is valid
    req.user = user
    next()
  })
}

module.exports = authenticateJWT
