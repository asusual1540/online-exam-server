const jwt = require("jsonwebtoken")

module.exports = request => {
  const authHeader = request.request.headers.authorization
  if (!authHeader) {
    return null
  }
  const token = authHeader.split(" ")[1]
  if (!token || token === "") {
    return null
  }
  let decodedToken
  try {
    decodedToken = jwt.verify(token, "Iamkira1540")
  } catch (ex) {
    return null
  }
  if (!decodedToken) {
    return null
  }
  const userID = decodedToken.userID
  const accessType = decodedToken.accessType
  return {
    userID,
    accessType
  }
}
