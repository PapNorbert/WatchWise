import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import { v4 as uuidv4 } from 'uuid'

import allowedOrigin from './config/allowedOrigin.js'
import { createCollections, createEdgeCollections, insertAdminUser, insertModeratorEmploymentFile } from './db/setup_db.js'
import { insertWatchGroupChatComment, findWatchGroupChatByWGKey } from './db/watch_groups_chats.js'
import { readLanguageDataFiles } from './i18n/i18n_files.js'
import { credentialsAllow } from './middlewares/credentialsAllow.js'
import { addJwtCookie } from './middlewares/auth.js'

import moviesApiRoute from './api/movies.js'
import seriesApiRoute from './api/series.js'
import genresApiRoute from './api/genres.js'
import opinionThreadApiRoute from './api/opinion_threads_and_comments.js'
import watchGroupApiRoute from './api/watch_groups.js'
import languageDataFilesRoute from './api/languageDataFiles.js'
import usersRoute from './api/users.js'
import authRoute from './api/authentication.js'
import showsRoute from './api/shows.js'
import moderatorRequestsRoute from './api/moderator_requests.js'
import announcementsRequestsRoute from './api/announcements.js'


const app = express();

const server = http.createServer(app);

// loggolas
app.use(morgan('tiny'));

// json formatum feldolgozas
app.use(bodyParser.json());

// cookies
app.use(cookieParser());

// own middleware, set Acces-Control-Allow-Credentials header
app.use(credentialsAllow);

// own - add jwt cookie
app.use(addJwtCookie);

// for requests from react
app.use(cors({
  origin: allowedOrigin
}));

//routes
app.use('/api/movies', moviesApiRoute);
app.use('/api/series', seriesApiRoute);
app.use('/api/genres', genresApiRoute);
app.use('/api/opinion_threads', opinionThreadApiRoute);
app.use('/api/watch_groups', watchGroupApiRoute);
app.use('/api/language', languageDataFilesRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/shows', showsRoute);
app.use('/api/moderator_requests', moderatorRequestsRoute);
app.use('/api/announcements', announcementsRequestsRoute);

// read .env file
dotenv.config()


const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {

  socket.on('join_room', (roomKey) => {
    // console.log(`User with id ${socket.id} joined room ${roomKey}`);
    socket.join(roomKey);
    findWatchGroupChatByWGKey(roomKey)
      .then((watchGroupChats) => {
        socket.emit('message_history', watchGroupChats);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  socket.on('send_message', (messageData) => {
    // console.log('User with id', socket.id, 'sent message to room', messageData.watch_group_id)
    messageData.key = uuidv4();
    insertWatchGroupChatComment(messageData.watch_group_id, messageData)
      .then(() => {
        socket.to(messageData.watch_group_id).emit('receive_message', messageData);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  socket.on('leave_room', (roomKey) => {
    socket.leave(roomKey);
    // console.log(`User with id ${socket.id} left room ${roomKey}`);
  });

});

createCollections()
  .then(createEdgeCollections)
  .then(insertAdminUser)
  .then(insertModeratorEmploymentFile)
  .then(() => {
    server.listen(3000, () => { console.log('Server listening on http://localhost:3000/ ...'); });
    if (!readLanguageDataFiles('eng')) {
      console.log('Error reading i18n data files');
    }
  })
  .catch((err) => {
    console.log(err);
  });
