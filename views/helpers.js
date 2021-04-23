module.exports = {
  //when express-validator returns errors, our backend returns html templates with error object,
  //which is passed down here to find the correct one for this form element (e.g. password element)
  getError(errors, prop) {
    console.log(errors)
    try {
      return errors.mapped()[prop].msg
    } catch(err) {
      return ''
    }
  },
};
