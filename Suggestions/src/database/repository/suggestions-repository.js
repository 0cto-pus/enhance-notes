const { SuggestionModel } = require("../models");
const {
  APIError,
  STATUS_CODES,
} = require("../../utils/errors/app-errors");


class SuggestionsRepository{
  async CreateNewEnhancedNote(userId,noteId,suggestion) {
    try {
      const user = await SuggestionModel.findOne({ userId });
      if(!user){
        return await SuggestionModel.create({userId,suggestions:[{noteId, suggestion}]});
      }
      user.suggestions.push({ noteId, suggestion });
      return await user.save();
    } catch (err) {
      
      console.log(err);
    }
  }

  async GetAllSuggestions(userId) {
    try {
      return await SuggestionModel.find({userId});
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Notes"
      );
    }
  }
}

module.exports = SuggestionsRepository;