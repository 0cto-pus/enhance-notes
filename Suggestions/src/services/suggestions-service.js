const { SuggestionsRepository } = require('../database');
const { EnhanceRequest, RPCRequest} = require('../utils');
const { APIError } = require('../utils/errors/app-errors');

class SuggestionsService{
    constructor(){
        this.repository = new SuggestionsRepository();
    }
    async CreateEnhancedNote(userId, noteId, note){
        try{
          const enhancedNote = await EnhanceRequest(note);
          const noteResult = await this.repository.CreateNewEnhancedNote(userId, noteId, enhancedNote);
          return {noteResult}; 
        }catch(error){
            throw new APIError('Data Not Found');
        }
    }


    async SubscribeEvents(payload){

      payload = JSON.parse(payload);
      const { event, userId, noteId, note } = payload;
      switch(event){
          case 'ENHANCE_NOTE':
              this.CreateEnhancedNote(userId, noteId, note);
              break;
          default:
              break;
      }
    
    }

    async GetSuggestions(userId){
        try{            
            return await this.repository.GetAllSuggestions(userId);
        }catch(err){
            throw new APIError('Data Not found');
        }
    }

    async GetNotesAndSuggestions(userId) {
        try{
            const allSuggestions = await this.repository.GetAllSuggestions(userId);
        if (!allSuggestions) {
          return {};
        }
        const [{ suggestions }] = allSuggestions;
        if (!suggestions) {
        return {} 
        }

        if (Array.isArray(suggestions)) {
          const noteIds = suggestions.map(({ noteId }) => noteId);
          // Perform RPC call
          console.log(noteIds);
          const notesResponse = await RPCRequest("NOTES_RPC", {
            type: "VIEW_NOTES",
            data: noteIds,
          });
          if (notesResponse) {
            return {notesResponse, suggestions};
          }
        }
        return {};
        }catch(error){
            console.log(error);
            throw new APIError('Data Not found', error);
        }
       
      }
}

module.exports = SuggestionsService;