const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const saveSchema = new Schema({
  Name: { type: String, required: [true, "ItemName is required"] },
  Category: { type: String, required: [true, "Item Category is required"] },
  SavedBy: { type: Schema.Types.ObjectId, ref: "user" },
  Status: { type: String },
});

//model creation to access documents in corresponding collection
// item--modelname which implies items--collection name
//this mongoose obj automatically connected to mongodb

const saveItem = mongoose.model("save", saveSchema);

module.exports = saveItem;