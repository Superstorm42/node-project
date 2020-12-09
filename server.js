const app = require('./app');
const http = require('http').Server(app);

const port = process.env.PORT || 3001;
http.listen(port, () => {
	console.log(`SERVER RUNNNING at port=${port}`);
});
