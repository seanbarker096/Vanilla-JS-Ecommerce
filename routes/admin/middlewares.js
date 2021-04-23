const { validationResult } = require("express-validator");

module.exports = {
  handleErrors(templateFunc, dataCb) {
    //middleware so return a function
    return async (req, res, next) => {
      //extract ouputs from validators from req object using express-validator
      const errors = validationResult(req);
      //if there are errors resend template html with errors rendered
      if(!errors.isEmpty()) {
        let data = {};
        //if callback exists use it to get data
        if (dataCb) {
          //if error and callback arg exists, callback gets the product
          //from repository and sends the data along with error message
          //to out HTML template func
          data = await dataCb(req);

        }
        return res.send(templateFunc({ ...data,  errors }));
      }

      next();
    };
  },

  //if user is not logged in then redirect them
  requireAuth(req, res, next) {
    if(!req.session.userId) {
      return res.redirect('/signin');
    }
    next();
  }
};
