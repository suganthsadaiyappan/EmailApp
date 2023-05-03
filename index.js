const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.port || 3000;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const users = [];
let currentUser;
let userLoggedIn = false;

class User {
  constructor() {
    this.inbox = [];
    this.sent = [];
    this.trash = [];
    this.drafts = [];
  }
}

//Function to create incrementing ID
class IDGenerator {
  id = 1;
  generateID = function () {
    return this.id++;
  };
}

let idGenerator = new IDGenerator();

function setID() {
  return idGenerator.generateID();
}

app.use(express.static(path.join(__dirname, "src/public")));
app.use(bodyParser.json());

//Home page
app.get("/", (req, res) => {
  if (userLoggedIn) {
    res.sendFile(path.join(__dirname, "src/public/views/email.html"));
  } else {
    res.sendFile(path.join(__dirname, "src/public/views/login.html"));
  }
});

//Email page - POST
app.post("/email", (req, res) => {
  if (userLoggedIn) {
    userLoggedIn = false;
    res.sendFile(path.join(__dirname, "src/public/views/login.html"));
  } else {
    res.status(404).json("Cant access the page");
  }
});

//Email page - GET
app.get("/email", (req, res) => {
  if (userLoggedIn) {
    res.sendFile(path.join(__dirname, "src/public/views/email.html"));
  } else {
    res.sendFile(path.join(__dirname, "src/public/views/login.html"));
  }
});

//Register user
app.post("/register", urlencodedParser, (req, res) => {
  let registerUsername = req.body.registerUsername;
  let registerPassword = req.body.registerPassword;
  let registerRepeatPassword = req.body.registerRepeatPassword;
  let userExists = false;
  users.forEach((user, index) => {
    if (user.name === registerUsername) {
      userExists = true;
      res.json("User already exists, please enter any other username");
    }
  });
  if (userExists === false) {
    if (registerUsername === "" || registerPassword === "") {
      res.json("Please enter a valid username/password");
    } else if (registerPassword !== registerRepeatPassword) {
      res.json("Passwords are not matching");
    } else if (registerPassword.length < 8) {
      res.json("Password must be 8 characters long");
    } else {
      let user = new User();
      user.name = registerUsername;
      user.password = registerPassword;
      users.push(user);
      userLoggedIn = true;
      currentUser = user;
      res.json("register");
    }
  }
});

//Login user
app.post("/login", urlencodedParser, (req, res) => {
  let name = req.body.loginUsername;
  let password = req.body.loginPassword;
  let userExists = false;
  users.forEach((user, index, users) => {
    if (user.name === name && user.password === password) {
      userExists = true;
      currentUser = users[index];
      userLoggedIn = true;
      res.json("login");
      return;
    } else if (user.name === name && user.password !== password) {
      userExists = true;
      res.json("Password is incorrect");
    } else {
      userExists = false;
    }
  });
  if (userExists === false) {
    res.json("Username doesnot exist");
  }
});

//Receive mail from postman
app.post("/inbox", (req, res) => {
  let username = req.query.user;
  let userExists = false;
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedTime = `${formattedHours % 12}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${ampm}`;
  let id = setID();
  users.forEach((user) => {
    if (user.name === username) {
      user.inbox.unshift({
        subject: req.body.subject,
        body: req.body.body,
        from: req.body.from,
        time: formattedTime,
        id: id,
        origin: "inbox",
        status: "unread",
      });
      userExists = true;
    }
  });
  if (userExists) {
    res.json("Success, mail sent");
  } else {
    res.status(404).json("User doesnot exist");
  }
});

//Receive mail from client
app.post("/sent", (req, res) => {
  const username = req.body.to;
  let userExists = false;
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedTime = `${formattedHours % 12}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${ampm}`;
  let id = setID();
  //Adding the mail to the inbox of the to user
  users.forEach((user) => {
    if (user.name === username) {
      user.inbox.unshift({
        subject: req.body.subject,
        body: req.body.body,
        from: currentUser.name,
        time: formattedTime,
        id: id,
        origin: "inbox",
        status: "unread",
      });
      userExists = true;
    }
  });
  if (userExists) {
    id = setID();
    //Adding the sent mail to the current user sent folder
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        user.sent.unshift({
          subject: req.body.subject,
          body: req.body.body,
          to: req.body.to,
          time: formattedTime,
          id: id,
          origin: "sent",
        });
      }
    });
  }
  if (userExists) {
    res.json("Success, mail sent");
  } else {
    res.json("User doesnot exist");
  }
});

//Populate drafts
app.post("/drafts", (req, res) => {
  let userExists = false;
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedTime = `${formattedHours % 12}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${ampm}`;
  let id = setID();
  users.forEach((user) => {
    if (user.name === req.body.to) {
      userExists = true;
    }
  });
  if (userExists) {
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        user.drafts.unshift({
          subject: req.body.subject,
          body: req.body.body,
          to: req.body.to,
          time: formattedTime,
          id: id,
          origin: "drafts",
        });
      }
    });
  }
  if (userExists) {
    res.json("Success, draft saved");
  } else {
    res.json("User doesnot exist");
  }
});

// Delete email and move it to trash
app.post("/deletemail", (req, res) => {
  let page = req.body.folder;
  let id = Number(req.body.id);
  let index;
  users.forEach((user) => {
    if (user.name === currentUser.name) {
      index = user[page].findIndex((obj) => obj.id === id);
      let removed = user[page].splice(index, 1);
      user.trash.unshift(removed[0]);
      return;
    }
  });
  res.json("Success");
});

//Delete email from trash
app.post("/forcedelete", (req, res) => {
  let page = req.body.folder;
  let id = Number(req.body.id);
  let index;
  users.forEach((user) => {
    if (user.name === currentUser.name) {
      index = user[page].findIndex((obj) => obj.id === id);
      user[page].splice(index, 1);
      return;
    }
  });
  res.json("Success");
});

app.post("/restoremail", (req, res) => {
  let id = req.body.id;
  users.forEach((user) => {
    if (user.name === currentUser.name) {
      index = user.trash.findIndex((obj) => obj.id === id);
      let restoreItem = user.trash.splice(index, 1);
      console.log(restoreItem);
      let restorePage = restoreItem[0].origin;
      user[restorePage].push(restoreItem[0]);
      user[restorePage].sort((a, b) => {
        return b.id - a.id;
      });
    }
  });
});

//Fetch inbox
app.get("/inbox", (req, res) => {
  let userExists = false;
  let userVal;
  if (userLoggedIn) {
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        userExists = true;
        userVal = user;
      }
    });
    if (!userExists) {
      res.json("User does not exist");
    } else {
      res.json(userVal);
    }
  }
});

//Fetch Trash
app.get("/trash", (req, res) => {
  let userExists = false;
  let userVal;
  if (userLoggedIn) {
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        userExists = true;
        userVal = user;
      }
    });
    if (!userExists) {
      res.json("User does not exist");
    } else {
      res.json(userVal);
    }
  }
});

//Fetch Sent
app.get("/sent", (req, res) => {
  let userExists = false;
  let userVal;
  if (userLoggedIn) {
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        userExists = true;
        userVal = user;
      }
    });
    if (!userExists) {
      res.json("User does not exist");
    } else {
      res.json(userVal);
    }
  }
});

//Fetch Drafts
app.get("/drafts", (req, res) => {
  let userExists = false;
  let userVal;
  if (userLoggedIn) {
    users.forEach((user) => {
      if (user.name === currentUser.name) {
        userExists = true;
        userVal = user;
      }
    });
    if (!userExists) {
      res.json("User does not exist");
    } else {
      res.json(userVal);
    }
  }
});

//Remove the read mail from the unread mail array
app.post("/readmail", (req, res) => {
  let id = req.body.id;
  users.forEach((user) => {
    if (user.name === currentUser.name) {
      let index = user.inbox.findIndex((obj) => obj.id === id);
      user.inbox[index].status = "read";
    }
  });
  res.json(users);
});

// Get the status of the unreadmail array
app.get("/readmail", (req, res) => {
  let count = 0;
  users.forEach((user) => {
    if (user.name === currentUser.name) {
      if (user.inbox.length > 0) {
        user.inbox.forEach((item) => {
          if (item.status === "unread") {
            count++;
          }
        });
      }
    }
  });
  res.json(count);
});

app.listen(port, function () {
  console.log(`Server listening on port ${port}.`);
});
