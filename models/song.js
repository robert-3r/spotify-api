const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const SongSchema = Schema({
  album: {
    type: Schema.ObjectId,
    ref: "Album",
  },
  track: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  file: String,
  create_at: {
    type: Date,
    default: Date.now(),
  },
});

SongSchema.plugin(mongoosePaginate);

module.exports = model("Song", SongSchema, "songs");
