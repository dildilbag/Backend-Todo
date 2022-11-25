/***************************************************************************************************
    Abhängige Pakete die in der package.json definiert sind
*****************************************************************************************************/
const express = require('express')                  // http-server framework
const cors = require('cors')                        // CORS deaktivieren
const csv = require('csv-parser');                  // handler für CSV Dateien
const fs = require('fs');                           // handler zum lesen/schreiben von Dateien
const ObjectsToCsv = require('objects-to-csv')      // Wandlet CSV Zeilen in JSON-Objekte um
const promMid = require('express-prometheus-middleware');

/***************************************************************************************************
    Konfiguration

    
*****************************************************************************************************/
const port = process.env.PORT || 5000               // Konfiguration des Webserver-Ports
let morgan = require('morgan')                      // http-zugriff logging auf der CLI
let bodyParser = require('body-parser');            // einfacher handler für POST/PUT payloads
const corsOptions = {                               // CORS-Optionen definieren
    origin: '*'
}

/***************************************************************************************************
    express framework initialisieren
****************************************************************************************************/

const app = express()    
                           // express app erstellen
app.use(bodyParser.json());                         // den body-parser übergeben
app.use(morgan('combined'))                         // den http-logger übergeben
app.use(cors(corsOptions))                          // CORS-Einstellungen übergeben
app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));
/***************************************************************************************************
    todo liste
****************************************************************************************************/
let todoListe = [
    
];                                  // Array Liste der todo-Einträge

/***************************************************************************************************
    CSV Datei lesen und zur Liste hinzufügen
****************************************************************************************************/
fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
        todoListe.push(row)
    })

/***************************************************************************************************
    Standard-Route, ohne funktion
****************************************************************************************************/
app.get("/", (request, response) => {
    response.json({
        greeting: "Hello World of Techstarter!"
    })
});

/***************************************************************************************************
    Ausgabe aller Objekte als Array
****************************************************************************************************/
app.get('/todos', (request, response) => {
    // TODO: respone muss das array als json zurück geben
response.json({
    todoListe
})
        
})

/***************************************************************************************************
    Erstellen eines neuen Eintrags
    Übertragen wird der payload in der form
    ```
    {
        "name": "Ein neuer Eintrag"
    }
    ```
****************************************************************************************************/
app.post('/todos', function(request, response) {
 let lastId = 0;
 for(let i = 0; i<todoListe.length; i++){
    let currentId = parseInt(todoListe[i]['id']);
    if(currentId > lastId){
        lastId = currentId
    }
 }
  
    let newItem ={
        id : lastId +1,
        name : request.body['name'],
        done : 'false'
    }
   
  todoListe.push(newItem)

  const csv = new ObjectsToCsv(todoListe);
 
  // Save to file:
  csv.toDisk('./data.csv');
 
  // Return the CSV file as string:

   response.json(todoListe)
 //response.json(newItem)


    

    // TODO:
    //      * Payload auslesen
    //      * Neues CSV Element anlegen (id, name, done)
    //      * Element an die Liste anfügen
    //      * Liste in CSV um wandeln und speichern über `ObjectsToCsv`
    //      * neue Liste zurück geben
});

/***************************************************************************************************
    Aktualisieren eines bestehenden Eintrags
    Übertragen wird der payload in der form
    ```
    {
        "id": 1,
        "done": true
    }
    ```
****************************************************************************************************/
app.put('/todos', function(request, response) {
    var body = request.body
    var id = body['id'];
    const parseInt = todoListe.findIndex(todo =>{
        return todo.id ==id;
       });
       if(parseInt >= 0){
        todoListe[parseInt].done = body['done'].toString();
        const csv = new ObjectsToCsv(todoListe);
  csv.toDisk('./data.csv');
       }
   response.json(todoListe)
       

    // TODO:
    //      * Payload auslesen
    //      * Element in der Liste finden anhand der übertragenen ID
    //      * Element aktualisieren, passend zum `done` Status
    //      * Liste in CSV um wandeln und speichern über `ObjectsToCsv`
    //      * neue Liste zurück geben
});

/***************************************************************************************************
    Löschen eines bestehenden Eintrags
****************************************************************************************************/
app.delete('/todos/:id', function(request, response) {
   let id = request.params['id']
   const params = todoListe.findIndex(todo => {
    return todo.id ==id;
   });
   todoListe.splice(params, 1);

   const csv = new ObjectsToCsv(todoListe);
  csv.toDisk('./data.csv');

   response.json(todoListe)


    // TODO:
    //      * ID aus der URL auslesen
    //      * Element in der Liste finden anhand der übertragenen ID
    //      * Element aus der Liste löschen
    //      * Liste in CSV um wandeln und speichern über `ObjectsToCsv`
    //      * neue Liste zurück geben
});


/***************************************************************************************************
    Starten der express Anwendung
****************************************************************************************************/
app.listen(port, () => console.log(`Techstarter Todo App listening on port ${port}!`))