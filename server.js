const app = require('express')();
const randomstring = require('randomstring');
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const funcModels = require('./models/messagensModels');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).render('home');
});

io.on('connection', async (socket) => {
  let newUserId = randomstring.generate(16); // gera uma string aleatoria de tamanho 16
  await funcModels.connected(io, socket, newUserId);

  socket.on('message', async ({ chatMessage, nickname }) => { // insere as mensagens no banco de dados
    await funcModels.createHistory(io, chatMessage, nickname);
  });

  socket.on('setNickname', async (nickName) => { // altera o nick alateorio para o nick digitado
    await funcModels.changeNick(io, socket, newUserId, nickName);
    newUserId = nickName; 
  });

  socket.on('disconnect', () => { //  desconecta somente o user correto
    funcModels.disconnect(io, socket, newUserId);
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
