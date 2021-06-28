const dateFormat = require('dateformat');
const connection = require('./connection');

let onlineUsers = []; //  lista de usuarios logados

const getAllMessages = async () => { // todas as mensagens do bd
  const messages = await connection()
  .then((db) => db.collection('messages').find().toArray());
  return messages;
};

const connected = async (io, socket, userId) => {
  onlineUsers.push(userId); //  adiciona a lista de usuarios logados
  const messages = await getAllMessages();
  if (messages.length) socket.emit('history', messages); // se existir mensagens emit elas pára serem renderizadas
  socket.emit('Nick', userId);
  io.emit('onlineUsers', onlineUsers);
};

const createHistory = async (io, message, nickname) => { // usando a biblioteca dateFormat para formatar a data e pegar o horario atual
  const agoraHora = new Date();
  const timestamp = String(dateFormat(agoraHora, 'dd-mm-yyyy HH:MM:ss TT')); 
  io.emit('message', `${timestamp} - ${nickname}: ${message}`);

  await connection()
      .then((db) => db.collection('messages')
      .insertOne({ message, nickname, timestamp })); // inserindo as mensagens no bd
};

const changeNick = async (io, socket, nickName, newNickName) => {
  onlineUsers = onlineUsers.filter((user) => user !== nickName); // olhando para ver se o usuario é diferente do nick gerado aleatoriamente
  onlineUsers.push(newNickName); // adiciona o novo nick a lista de logados
  socket.emit('Nick', newNickName);
  io.emit('onlineUsers', onlineUsers);
};

const disconnect = (io, socket, userId) => {
  onlineUsers = onlineUsers.filter((user) => user !== userId); // como ta desconecatando ele só adiciona na lista os UserId diferentes do que esta logado agora
  io.emit('onlineUsers', onlineUsers);
};

module.exports = {
  connected,
  createHistory,
  changeNick,
  disconnect,
  onlineUsers,
};
