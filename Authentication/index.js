const { sign, verify } = require("jsonwebtoken");

//secret key to generate Token
const secretKey = "Durga@46576";

//verifying user Token
async function VerifyToken(token) {
  try {
    let result = verify(token, secretKey);
    console.log("verified at auth : ", result);
    return { ...result, isValidToken: true };
  } catch (error) {
    return { isValidToken: false, error };
  }
}

//genertaing Token
async function generateToken(user) {
  let token = sign(user, secretKey, { expiresIn: 86400 });
  return token;
}

//Authentiaction checking Middleware for every rote
async function CheckAuthentication(req, res, next) {
  let token = req?.cookies?.token || "wrong";
  const result = await VerifyToken(token);
  if (result?.isValidToken == false) {
    return res.render("signin");
  }
  req.userData = result;
  next();
}

module.exports = { VerifyToken, generateToken, CheckAuthentication };
