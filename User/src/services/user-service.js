const { UserRepository } = require('../database');
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const {   BadRequestError } = require('../utils/errors/app-errors')

class UserService{
    constructor(){
        this.repository = new UserRepository();
    }
    async SignUp(userInputs){
        
        const { email, password } = userInputs;
        
        try{
          
            const existingUser = await this.repository.FindUser({ email });
   
            if (existingUser) {
                throw new BadRequestError("Email in use");
              }

            let salt = await GenerateSalt();
            
            let userPassword = await GeneratePassword(password, salt);
            
            const newUser = await this.repository.CreateUser({ email, password: userPassword, salt});
            
            const token = await GenerateSignature({ email: email, _id: newUser._id});

            return FormateData({id: newUser._id, token });

        }catch(err){
            throw ('Data Not found', err)
        }

    }

    async SignIn(userInputs){
        const { email, password } = userInputs;

        const existingUser = await this.repository.FindUser({ email });
   
        if (!existingUser) throw new BadRequestError("Invalid credentials");

        const validPassword = await ValidatePassword(
          password,
          existingUser.password,
          existingUser.salt
        );

        if (!validPassword) throw new BadRequestError("Invalid credentials");
    
        const token = await GenerateSignature({
          email: existingUser.email,
          _id: existingUser._id,
        });
    
        return { id: existingUser._id, token };
    }
}

module.exports = UserService;