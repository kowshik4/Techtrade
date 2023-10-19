const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    Category: {type: String, required: [true, 'Category is required']},
    Details: {type: String, required: [true, 'Details are required'],
                minLength: [10, 'the content should have atleast 10 characters']},
    Status: {type: String, required: [true, 'Status is required']},
    image: {type: String, required: [true, 'Image URL is required']},
    Price: {type: Number, required: [true, 'Price is required']},
    offerName: { type: String },
    Saved: { type: Boolean },
    Offered: { type: Boolean },
},
{timestamps: true}
);

module.exports = mongoose.model('trade', tradeSchema);