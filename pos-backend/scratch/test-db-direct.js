const mongoose = require('mongoose');
require('dotenv').config();

// Using one of the shard hostnames directly to see if we can connect without SRV
const directUri = "mongodb://shabanelmogy:Adam%402008@ac-lr9g8xu-shard-00-00.ljxhpdb.mongodb.net:27017,ac-lr9g8xu-shard-00-01.ljxhpdb.mongodb.net:27017,ac-lr9g8xu-shard-00-02.ljxhpdb.mongodb.net:27017/myDatabase?ssl=true&replicaSet=atlas-lr9g8xu-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log('Testing direct connection (bypassing SRV)...');

mongoose.connect(directUri)
  .then(() => {
    console.log('Successfully connected to MongoDB via direct URI');
    process.exit(0);
  })
  .catch(err => {
    console.error('Direct connection error:', err);
    process.exit(1);
  });
