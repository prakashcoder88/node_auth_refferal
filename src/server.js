

const http = require('http');
const url = require('url');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || 'dshfghdf3456dfg43534dfg43rgdfp09'; 

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  username: { type: String },
  password: { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
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
        return message(res, 400, 'Username already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        password: hashedPassword,
      });

      await user.save();
      return message(res, 201, 'User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
      return message(res, 500, 'Error registering user');
    }
  } else if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = JSON.parse(body);

      const user = await User.findOne({ username });
      if (!user) {
        return message(res, 400, 'Username or password is incorrect');
      }
      if (user.isDeleted) {
        return message(res, 400, 'account is not active');
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return message(res, 400, 'Username or password is incorrect');
      }

      const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: '1h' }); 

      res.setHeader('auth-token', token);
      return message(res, 200, JSON.stringify({ token }));
    } catch (error) {
      console.error('Error logging in:', error);
      return message(res, 500, 'Error logging in');
    }
  } else if (req.method === 'GET' && pathname === '/api/userfind') {
    const token = req.headers['auth-token'];
    if (!token) {
      return message(res, 401, 'Access denied');
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const user = await User.findById(decoded._id);
      if (!user) {
        return message(res, 401, 'Access denied');
      }

      return message(res, 200, JSON.stringify({ message: 'Protected resource', user }));
    } catch (error) {
      console.error('Invalid token:', error);
      return message(res, 401, 'Invalid token');
    }
  } else if (req.method === 'PATCH' && pathname.startsWith('/api/update')) {
    try {
      const userId = pathname.split('/').pop();
      const body = await getRequestBody(req);
      const { username } = JSON.parse(body);


      const token = req.headers['auth-token'];
      if (!token) {
        return message(res, 401, 'Access denied');
      }
  

      try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded._id);
      
        if (!user) {
          return message(res, 401, 'Access denied');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        return message(res, 401, 'Invalid token');
      }
  
    
      const existingUser = await User.findOne( {username} );
      console.log(existingUser);
      if (existingUser) {
        return message(res, 400, 'Username already exists');
      }
 
    
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { username } },
        { new: true }
      );
  
      if (!updatedUser) {
        return message(res, 404, JSON.stringify({ error: 'User not found' }));
      }
  
      return message(res, 200, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Internal Server Error:', error);
      return message(res, 500, JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
  
  else if (req.method === 'DELETE' && pathname.startsWith('/api/softdelete/')) {
    try {
      const userId = pathname.split('/').pop();
      const softDeletedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { isDeleted: true } },
        { new: true }
      );

      if (!softDeletedUser) {
        return message(res, 404, JSON.stringify({ error: 'User not found' }));
      }

      return message(res, 200, JSON.stringify({ message: 'User soft-deleted successfully' }));
    } catch (error) {
      console.error('Internal Server Error:', error);
      return message(res, 500, JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {
    return message(res, 404, 'Not Found');
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

function message(res, statusCode, message) {
  res.statusCode = statusCode;

  res.end(message);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
