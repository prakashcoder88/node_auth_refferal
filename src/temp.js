const http = require('http');
const url = require('url');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const secretKey = 'ashdfgc46dd46d37dkjf47'; // Replace with your actual secret key

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  username: {type:String},
  password: {type:String},
  isDeleted: { 
    type: Boolean,
     default: false 
    },
});

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (req.method === 'POST' && pathname === '/api/register') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = JSON.parse(body);

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return sendResponse(res, 400, 'Username already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        password: hashedPassword,
      });

      await user.save();
      return sendResponse(res, 201, 'User registered successfully');
    } catch (error) {
      return sendResponse(res, 500, 'Error registering user');
    }
  } else if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = JSON.parse(body);

      const user = await User.findOne({ username });
      if (!user) {
        return sendResponse(res, 400, 'Username or password is incorrect');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return sendResponse(res, 400, 'Username or password is incorrect');
      }

      const token = jwt.sign({ _id: user._id }, secretKey);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('auth-token', token);
      return sendResponse(res, 200, JSON.stringify({ token }));
    } catch (error) {
      return sendResponse(res, 500, 'Error logging in');
    }
  } else if (req.method === 'GET' && pathname === '/api/resource') {
    const token = req.headers['auth-token'];
    if (!token) {
      return sendResponse(res, 401, 'Access denied');
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const user = await User.findById(decoded._id);
      if (!user) {
        return sendResponse(res, 401, 'Access denied');
      }

      return sendResponse(res, 200, JSON.stringify({ message: 'Protected resource', user }));
    } catch (error) {
      return sendResponse(res, 400, 'Invalid token');
    }
  }else if (req.method === "PUT" && req.url.startsWith("/api//update")) {
    try {
      const userId = req.url.split("/").pop();
      const body = await parseBody(req);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true }
      );

      if (!updatedUser) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(updatedUser));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }
  // Soft Delete User endpoint
  else if (req.method === "DELETE" && req.url.startsWith("/api/softdelete")) {
    try {
      const userId = req.url.split("/").pop();
      const softDeletedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { isDeleted: true } },
        { new: true }
      );

      if (!softDeletedUser) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User soft-deleted successfully" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }
   else {
    return sendResponse(res, 404, 'Not Found');
  }
});

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function sendResponse(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain');
  res.end(message);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
