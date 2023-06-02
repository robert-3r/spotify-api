const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const AlbumSchema = Schema({
  artist: {
    type: Schema.ObjectId,
    ref: "Artist",
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  year: {
    type: String,
    required: true,
  },
  image: String,
  create_at: {
    type: Date,
    default: Date.now,
  },
});

AlbumSchema.plugin(mongoosePaginate);

module.exports = model("Album", AlbumSchema, "albums");
