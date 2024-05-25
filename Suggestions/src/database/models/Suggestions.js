const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SuggestionSchema = new Schema({
    userId: String,
    suggestions: [
        {
        suggestion: {
            noteId: String,
            type: String,
            required: true
        },
        noteId: String,
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

module.exports =  mongoose.model('notes', SuggestionSchema);