const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { log } = require("console");

app.use(express.static(path.join(__dirname,'public')));

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
// Create connection to MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta',
  password: '9305',
});

// Function to generate random user data
let getRandomUser = () => {
  return [
    faker.string.uuid(),  // Use faker.string.uuid() for the newer version of faker
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/dashboard", (req, res) =>{
  
  let q2 = `select * from category`;

  try {
    connection.query(q2, (err, result) => {
      if (err) throw err;
      let categories = result;
      console.log(result);
      
      res.render("Dashboard.ejs", {categories});
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  } 
});
 
// show route
app.get("/user", (req, res) => {
  let q = `select * from user`;

  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // res.send(result);
      res.render("show.ejs", {users});
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  } 
});

// Dashborad

// app.get("/dashboard", (req, res) => {
//   res.render("Dashboard");
// });
  
app.get("/login", (req, res)=>{
  res.render("login.ejs");
});

// login
app.post("/login", (req, res) => {

  let { id, password } = req.body;
  let q = `select * from user where id = '${id}'`;

  try {
    connection.query(q, (err, result) => {

      let user = result[0];

      if (err) throw err;
      if (result.length == 0){
        res.send("Wrong id");
      }
      else{
        // let password = result[0]['password'];
        if(password != user.password){
          res.send("Wrong password");
        }
        else{
          let users = result[0]['username'];

          // res.send(`Logged in successfully ${users}`);
          res.render("user_view.ejs", {user});
          
        }
        
      }
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  }
});

//perticular user view


app.get("/user/:id/user_view", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id = ?";

  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("user_view.ejs", { user });
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("Some error in DB");
  }
});

// item view 
app.get("/user/:id/item", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM food  WHERE category = '${id}'`;
  
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let item = result;
      console.log(item);
      
      res.render("categories.ejs", {foods: item});
    });

  } catch (err) {
    console.log("Error occurred:", err);
    res.send("Some error in DB");
  }
});


app.post("/user/:id/item", (req, res) => {
  
  let id = req.params;
  console.log(id['id']);
  

  let q = `select * from food where id = '${id['id']}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let item = result;
      console.log(item);
      
      res.render("item.ejs", {foods: item});
    });

  } catch (err) {
    console.log("Error occurred:", err);
    res.send("Some error in DB");
  }
  
});

app.get("/user/about", (req, res) =>{
    res.render("about_us.ejs");
});

//Edit Route
app.get("/user/:id/edit", (req, res) =>{
  let { id } = req.params;
  let q = `select * from user where id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  } 
});

//update (DB) route
app.patch("/user/:id", (req, res) =>{
  let { id } = req.params;
  let {password: Formpass, username: newUsername} = req.body;
  let q = `select * from user where id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if(Formpass != user.password){
        res.send("Password incorrect");
        
      }
      else{
        let q2 = `update user set username = '${newUsername}' where id = '${id}'`;
        connection.query(q2, (err, result) =>{
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  }
});


// delete user
  app.get("/user/:id/delete", (req, res) =>{

    let { id } = req.params;
    let q = `select * from user where id = '${id}'`;

    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      console.log("Error occurred:", err);
      res.send("some error in DB");
    } 
  });

  app.delete("/user/:id/", (req, res) =>{
    
    let {password: Formpass} = req.body;
    let { id } = req.params;

    let q = `select * from user where id = '${id}'`;

    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        if(Formpass != user.password){
          res.send("Password incorrect");
          
        }
        else{
          
          let q3 = `DELETE FROM user WHERE username = '${user.username}' AND id = '${user.id}'`;

          connection.query(q3, (err, result) =>{
            if(err) throw err;
            res.redirect("/user");
          });
        }
      });
    } catch (err) {
      console.log("Error occurred:", err);
      res.send("some error in DB");
    }
  });

// Add new user 

app.get("/user/new", (req, res) => {
  res.render("add_user");
});

app.post("/user/new", (req, res) =>{

  let {id, username, email, password} = req.body;
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
  try {
    connection.query(q, [id, username, email, password],(err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log("Error occurred:", err);
    res.send("some error in DB");
  } 
});


app.listen("8080", () =>{
  console.log(`server is listening to port 8080`);
});



