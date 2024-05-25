const { NotesRepository } = require('../database');
const { APIError } = require('../utils/errors/app-errors');

class NotesService{
    constructor(){
        this.repository = new NotesRepository();
    }
    async CreateNote(userId, note){
        try{
            const notesResult = await this.repository.CreateNewNote(userId, note);
            const lastestNote = notesResult.notes[notesResult.notes.length - 1];
            const payload = {
              event: "ENHANCE_NOTE",
              userId,
              noteId: lastestNote._id,
              note: lastestNote.note,
            };
            return {notesResult, payload};
        }catch(err){
            throw new APIError('Data Not Found');
        }
    }

    async serveRPCRequest(payload) {
        const { type, data } = payload;
        switch (type) {
          case "VIEW_NOTES":
            return this.repository.FindSelectedNotes(data);
          default:
            break;
        }
      }

    async GetNotes(userId){
        try{            
            return await this.repository.AllNotes(userId);
        }catch(err){
            throw new APIError('Data Not found');
        }
    }
}

module.exports = NotesService;