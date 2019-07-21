const express = require('express');
const app = express();
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');


//промисификация
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

app.use(express.static(  path.join( __dirname ,"/public" ) ));
app.use(express.urlencoded({extended:true}));

app.set("view engine", "hbs");
app.set("views", "public/views");

app.get("/", async (req, res)=>{
    try{
        let animalData = await getFileData("data.js");
        if(!animalData||!animalData.length) return;


        res.render("animals.hbs", {
            data : animalData
        });
    }
    catch(err){
         console.log(err);
    }

   
});


app.post("/", async (req, res)=>{
 
    let {name, type, age} = req.body;
    
    try{
    
    let animalArray = await getFileData("data.js");
     animalArray.push({name, type, age});
     console.log(animalArray);
     await writeFile("data.js", (JSON.stringify( animalArray )));
     res.end();
    }
    catch(err){
       console.log();
    }
});


app.put("/", async (req, res)=>{
    let {name, type, age} = req.body;
    
    try{
      let animalArray = await getFileData("data.js");
     
     let animal = searchAnimal(name,animalArray); 
     if(!animal) {
         throw new Error("Нет такого зверя!");
     }
     animal.type = type;
     animal.age = age;
     await writeFile("data.js", (JSON.stringify( animalArray )));
     res.end();

    }
    catch(err){
       console.log(err);
    }
      
});

app.delete("/", async (req, res)=>{
    let {name} = req.body;
    console.log(name);
    
    try{
     let animalArray = await getFileData("data.js");
     deleteAnimal(name,animalArray); 
     await writeFile("data.js", (JSON.stringify( animalArray )));
     res.end();

    }
    catch(err){
       console.log(err);
    }
      
});

//удалить данные о звере
function deleteAnimal(name, animalArray){

    for(let i=0; i<animalArray.length; i++){
        if(animalArray[i].name === name){
        animalArray.splice(i,1);
        return;  
       }
    }

    throw new Error("Нет такого зверя!");

}

//найти объект
function searchAnimal(name, animalArray){
     for(let i=0; i<animalArray.length; i++){
         if(animalArray[i].name === name)
         return animalArray[i];
     }

     return false;
}

//получить псевдо-данные  из файла 
 const getFileData = async (filename)=>{
    let textData = await readFile(filename);
    
    //сделать текст JS кодом
    return eval( textData.toString());
 }


app.listen(3000, ()=>{console.log("Соединение прошло успешно!")});