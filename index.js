const { GraphQLServer } = require('graphql-yoga')
const mongoose = require('mongoose');
var cloudinary = require('cloudinary').v2;

mongoose.connect('mongodb+srv://acit3695:acit3695@graphql-api.6krsq.mongodb.net/graphqlNotes?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

cloudinary.config({
    cloud_name: 'xxxxx',
    api_key: 'xxxxx',
    api_secret: 'xxxxx'
});



const Note = mongoose.model("Note", {
    title: String,
    date: String,
    url: String,
    content: String,
    video: String,
    Image: String
});

const typeDefs = `type Query {
    getNote(id: ID!): Note
    getNotes: [Note]
    getNoteByTitle(title: String!): [Note]
  }

  enum VideoCategory {
    LIVE_RECORD
    YOUTUBE
    DEVICE
  }

  type Note {
    id:ID!
    title: String!
    date: String!
    url: String!
    content: String!
    video: VideoCategory!
    Image: String
  }
  type Mutation {
      addNote(title: String!, date: String!, url: String!, content: String!, video:VideoCategory!, Image:String): Note!,
      deleteNote(id: ID!): String,
      addImage(id: ID!, Image: String!): String
  }`

const resolvers = {
    Query: {
        getNotes: () => Note.find(),
        getNote: async (_, { id }) => {
            var result = await Note.findById(id);
            return result;
        },
        getNoteByTitle: async (_, { title }) => {
            allNotes = await Note.find();
            var notes = allNotes.filter(b => b.title == title);
            return notes;
        },
    },

    Mutation: {
        addNote: async (_, { title, date, url, content, video, Image }) => {
            const note = new Note({ title, date, url, content, video, Image });
            await note.save();
            const imagePath = Image;
            if (imagePath !== null) {
                cloudinary.uploader.upload(imagePath, { tags: 'note taking app', public_id: title + Image });
            };
            return note;
        },
        deleteNote: async (_, { id }) => {
            await Note.findByIdAndRemove(id);
            return "Note deleted";
        },
        addImage: async (_, { id, Image }) => {
            await Note.findByIdAndUpdate(id, { Image: Image });
            cloudinary.uploader.upload(Image, { tags: 'note taking app', public_id: id + Image });
            return "Added Image";
        }
    }
}
const server = new GraphQLServer({ typeDefs, resolvers })
mongoose.connection.once("open", function () {
    server.start(() => console.log('Server is running on localhost:4000'))
});
