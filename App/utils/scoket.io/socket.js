import io from 'socket.io-client';

// export const socket = io('http://173.212.193.109:5000/');
export const socket = io('http://192.168.237.192:5000/');
// const socket = io('https://culturtap.com', {
//     transports: ['websocket']
// });


console.log('socket ', socket);