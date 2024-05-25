const UserService = require('../services/user-service');
const { body } = require ('express-validator');
const validateRequest = require('./middlewares/validate-request');

module.exports = (app) =>{

    const service = new UserService();
    app.post("/signup",
    [
      body("email").isEmail().withMessage("Email must be valid"),
      body("password")
        .isLength({ min: 10, max: 20 })
        .trim() 
        .withMessage("Password must be between 10 and 20 characters"),
    ],
    validateRequest,
    async(req,res,next)=>{
        try {
            const { email, password } = req.body;
            const data = await service.SignUp({ email, password });
            return res.json(data);
          } catch (error) {
            next(error);
          }
    });

    app.post("/signin", 
    [
      body("email").isEmail().withMessage("Email must be valid"),
      body("password")
        .trim()
        .notEmpty()
        .withMessage("You must supply a password"),
    ], validateRequest,
    async(req,res,next)=>{
      try {
        const { email, password } = req.body;
        const data = await service.SignIn({ email, password });
        return res.json(data);
      } catch (error) {
        next(error);
      }
    });


    app.post("/signout", async(req,res,next)=>{
      try {
       res.clearCookie("jwt");
       res.status(200).send({ message: "Signout successful" });
      } catch (error) {
        next(error);
      }
    });
}