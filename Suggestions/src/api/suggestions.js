const SuggestionsService = require('../services/suggestions-service');
const { SubscribeMessage } = require("../utils");
const UserAuth = require('./middlewares/auth');

module.exports = (app,channel) => {
    const service = new SuggestionsService();
    SubscribeMessage(channel,service);
    

    app.get("/", UserAuth,  async(req,res,next)=>{
        const {_id} = req.user;
        try{
        const data = await service.GetSuggestions(_id);
        return res.status(200).json(data);
        }catch(error){
            next(error);
        }
    });

    app.get("/compare", UserAuth,async(req,res,next)=>{
        const {_id} = req.user;
        try{
            const data = await service.GetNotesAndSuggestions(_id);
            return res.status(200).json(data);
            }catch(error){
                next(error);
            }
    });

}