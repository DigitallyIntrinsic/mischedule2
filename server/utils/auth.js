const jwt = require("jsonwebtoken");

const secret = "mysecret";
const expiration = "2h";

module.exports = {
  authMiddleware: function ({ req }) {
    let token = req.query.token || req.headers.authorization || req.body.token;

    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.account = data;
    } catch (err) {
      console.log(`Auth Error: ${err.message}`);
    }

    return req;
  },
  signToken: function ({ email, _id, user }) {
    const payload = {
      email,
      accountId: _id,
      userId: user?._id,
      isAdmin: user?.isAdmin,
      companyId: user?.userCompany?._id,
    };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
