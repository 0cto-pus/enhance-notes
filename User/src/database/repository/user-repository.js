const { UserModel } = require("../models");
const {
  APIError,
  STATUS_CODES,
} = require("../../utils/errors/app-errors");


class UserRepository{
    async CreateUser({ email, password, salt }) {
        try {
          const user = new UserModel({
            email,
            password,
            salt,
          });
          const userResult = await user.save();
          return userResult;
        } catch (err) {
          throw new APIError(
            "API Error",
            STATUS_CODES.INTERNAL_ERROR,
            "Unable to Create Customer"
          );
        }
      }
      async FindUser({ email }) {
        try {
          const existingCustomer = await UserModel.findOne({ email: email });
          return existingCustomer;
        } catch (err) {
          throw new APIError(
            "API Error",
            STATUS_CODES.INTERNAL_ERROR,
            "Unable to Find Customer"
          );
        }
      }
}

module.exports = UserRepository;