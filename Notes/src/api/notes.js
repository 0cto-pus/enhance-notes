const NotesService = require('../services/notes-service');
const { body } = require ('express-validator');
const validateRequest = require('./middlewares/validate-request');
const UserAuth = require('./middlewares/auth');
const {PublishMessage, RPCObserver} = require('../utils');
const {SUGGESTION_SERVICE, RPC_QUEUE_NAME} = require('../config');

module.exports = (app,channel) => {
    const service = new NotesService();

    RPCObserver(RPC_QUEUE_NAME, service);

    app.post("/addnote", UserAuth,
    [
        body("note")
          .isLength({ min: 10})
          .withMessage("Notes must be minimum 10 characters"),
    ],
      validateRequest,
      async(req,res,next)=>{
        try{
            const { _id } = req.user;
            const {note} = req.body;
            const {notesResult, payload} = await service.CreateNote(_id, note);
            PublishMessage(channel, SUGGESTION_SERVICE, JSON.stringify(payload));
            return res.json(notesResult);
        }catch(error){
            next(error);
        }
    });
    app.get("/", UserAuth, async(req,res,next)=>{
        const { _id } = req.user;
        try{
        const data = await service.GetNotes(_id);
        return res.status(200).json(data);
        }catch(error){
          next(error);
        }
      });
}