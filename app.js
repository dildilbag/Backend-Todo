const fs = require('fs');
const csv = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const promMid = require('express-prometheus-middleware');

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors({ origin: '*' }));
app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

let todoListe = [];

// Load CSV file if it exists, otherwise start empty
const dataFilePath = 'data/data.csv';
if (fs.existsSync(dataFilePath)) {
    fs.createReadStream(dataFilePath)
      .pipe(csv())
      .on('data', (row) => {
          todoListe.push(row);
      })
      .on('end', () => {
          console.log(`Loaded ${todoListe.length} todos from CSV.`);
      });
} else {
    console.log('CSV file not found. Starting with empty todo list.');
}

// Routes
app.get("/", (req, res) => {
    res.json({ greeting: "Hello World of Taskcards!" });
});

app.get('/todos', (req, res) => {
    res.json({ todoListe });
});

app.post('/todos', (req, res) => {
    let lastId = 0;
    for (let i = 0; i < todoListe.length; i++) {
        let currentId = parseInt(todoListe[i]['id']);
        if (currentId > lastId) lastId = currentId;
    }

    let newItem = {
        id: lastId + 1,
        name: req.body['name'],
        done: 'false'
    };

    todoListe.push(newItem);

    const csv = new ObjectsToCsv(todoListe);
    csv.toDisk(dataFilePath)
       .then(() => {
           res.json(todoListe);
       })
       .catch(err => {
           console.error('Error saving CSV:', err);
           res.status(500).json({ error: 'Failed to save todo list' });
       });
});

app.put('/todos', (req, res) => {
    const body = req.body;
    const id = body['id'];
    const index = todoListe.findIndex(todo => todo.id == id);

    if (index >= 0) {
        todoListe[index].done = body['done'].toString();

        const csv = new ObjectsToCsv(todoListe);
        csv.toDisk(dataFilePath)
           .then(() => {
               res.json(todoListe);
           })
           .catch(err => {
               console.error('Error saving CSV:', err);
               res.status(500).json({ error: 'Failed to save todo list' });
           });
    } else {
        res.status(404).json({ error: 'Todo item not found' });
    }
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params['id'];
    const index = todoListe.findIndex(todo => todo.id == id);

    if (index >= 0) {
        todoListe.splice(index, 1);

        const csv = new ObjectsToCsv(todoListe);
        csv.toDisk(dataFilePath)
           .then(() => {
               res.json(todoListe);
           })
           .catch(err => {
               console.error('Error saving CSV:', err);
               res.status(500).json({ error: 'Failed to save todo list' });
           });
    } else {
        res.status(404).json({ error: 'Todo item not found' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Task-cards Todo App listening on port ${port}!`);
});
