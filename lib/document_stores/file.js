var fs = require('fs');
var crypto = require('crypto');
var winston = require('winston');

// For storing in files
// options[type] = file
// options[path] - Where to store

var lastSetTimestamp = 0;
var lastGetTimestamp = 0;
var lastDocuments = [];

var FileDocumentStore = function(options) {
  this.basePath = options.path || './data';
  this.expire = options.expire;
};

// Generate md5 of a string
FileDocumentStore.md5 = function(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
};

// Save data in a file, key as md5 - since we don't know what we could
// be passed here
FileDocumentStore.prototype.set = function(key, data, callback, skipExpire) {
  try {
    var _this = this;
    fs.mkdir(this.basePath, '700', function() {
      var fn = _this.basePath + '/' + FileDocumentStore.md5(key);
      fs.writeFile(fn, data, 'utf8', function(err) {
        if (err) {
          callback(false);
        }
        else {
          callback(true);
          if (_this.expire && !skipExpire) {
            winston.warn('file store cannot set expirations on keys');
          }
          lastSetTimestamp = new Date().getTime();
        }
      });
    });
  } catch(err) {
    callback(false);
  }
};

// Get data from a file from key
FileDocumentStore.prototype.get = function(key, callback, skipExpire) {
  var _this = this;
  var newKey = "";
  if(key.length > 10){
    newKey = key;
  }else{
    newKey = FileDocumentStore.md5(key);
  }

  var fn = this.basePath + '/' + newKey;
  fs.readFile(fn, 'utf8', function(err, data) {
    if (err) {
      callback(false);
    }
    else {
      callback(data);
      if (_this.expire && !skipExpire) {
        winston.warn('file store cannot set expirations on keys');
      }
    }
  });
};

// Get last N files documents
FileDocumentStore.prototype.getLastNDocuments = function(nDocuments, callback, skipExpire) {
  if(lastSetTimestamp >= lastGetTimestamp){
    var _this = this;
    var basePath = this.basePath + "/";
    var fileList = fs.readdirSync(this.basePath);
    fileList.sort(function(a, b) {
                 return fs.statSync(basePath + b).ctime.getTime() - fs.statSync(basePath + a).ctime.getTime();
             });
    
    fileList.forEach(function(val, index, array){
      var timestamp = fs.statSync(basePath + val).mtime.getTime();
      fs.readFile(basePath + val, 'utf8', function(err, data) {
        if(err){
          callback(false);
        }else{
          lastDocuments.push({id:val,data:data.substr(0,40), timestamp:timestamp});
        }
        if((lastDocuments.length == array.length) || lastDocuments.length == nDocuments){
          lastDocuments.sort(function(a, b) {
                 return b.timestamp - a.timestamp;
             });
          lastGetTimestamp = new Date().getTime();
          winston.verbose('refreshing latest documents cache');
          callback(lastDocuments);
        }
      });
    });
  }else{
    winston.verbose('using latest documents cache');
    callback(lastDocuments);
  }
};


module.exports = FileDocumentStore;
