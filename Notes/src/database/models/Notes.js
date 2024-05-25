const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotesSchema = new Schema({
    userId: String,
    notes: [
        {
        note: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
        }
    },timestamps: true
});


module.exports =  mongoose.model('notes', NotesSchema);