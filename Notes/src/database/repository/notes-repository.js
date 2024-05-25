const { NotesModel } = require("../models");
const {
  APIError,
  STATUS_CODES,
} = require("../../utils/errors/app-errors");
const { default: mongoose } = require("mongoose");


class NotesRepository{
  async CreateNewNote(userId, note) {
    try {
      const user = await NotesModel.findOne({ userId });
      if(!user){
        return await NotesModel.create({userId,notes:[{note}]});
      }
      user.notes.push({ note });
      return await user.save();
    } catch (err) {
      
      console.log(err);
    }
  }

  async FindById(id) {
    try {
      return await NotesModel.findById(id);
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Product"
      );
    }
  }

  async FindSelectedNotes(selectedNoteIds) {
     try {
      console.log(selectedNoteIds);
      const notes = await NotesModel.find({
        'notes._id': { $in: selectedNoteIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).exec();
      
      console.log(notes);
      return notes;
      
    } catch (err) {
      console.log(err);
    } 
    
  }

  async AllNotes(userId) {
    try {
      return await NotesModel.find({userId});
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Notes"
      );
    }
  }
}

module.exports = NotesRepository;