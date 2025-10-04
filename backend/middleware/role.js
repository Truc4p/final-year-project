module.exports = function (roles) {
    return function (req, res, next) {
        const user = req.user;
        console.log(user);
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }
      next();
    };
  };