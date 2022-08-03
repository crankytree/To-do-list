const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-ankit:Test123@cluster0.atlqzux.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultArray = [];

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = new mongoose.model("List" , listsSchema);



app.get("/", function(req, res) {



  Item.find({} , function(err , results){

    
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });


  });
});



app.post("/" , function(req , res){


  const itemName = req.body.newItem;
  const itemTitle = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(itemTitle === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: itemTitle} , function(err , foundList){
      foundList.items.push(newItem),
      foundList.save();
      res.redirect("/" + itemTitle);
    })
  }

  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("work");
  // }
  // else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete" , function(req , res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err){
        console.log("Checked Item successfully Delleted");
      }
    });
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItemId}}} , function(err , foundList) {
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


});

app.get("/:title" , function(req , res){
  const title = _.capitalize(req.params.title);

  List.findOne({name: title} , function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: title,
          items: defaultArray
        });

        list.save();
        res.redirect("/" + title);
      }
      else{
        res.render("list" , {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })



})

app.get("/about" , function(req  , res){
  res.render("about");
})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 5000;
}

app.listen(port, function() {
  console.log("Server started at port " + port);
})
