const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const ArtistSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  create_at: {
    type: Date,
    default: Date.now,
  },
});

ArtistSchema.plugin(mongoosePaginate);

module.exports = model("Artist", ArtistSchema, "artists");
