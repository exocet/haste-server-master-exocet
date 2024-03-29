{

  "host": "0.0.0.0",
  "port": 7777,

  "keyLength": 10,

  "maxLength": 400000,

  "staticMaxAge": 86400,

  "recompressStaticAssets": true,

  "logging": [
    {
      "level": "verbose",
      "type": "Console",
      "colorize": true
    }
  ],

  "keyGenerator": {
    "type": "phonetic"
  },

  /*"storage": {
    "type": "redis",
    "host": "0.0.0.0",
    "port": 6379,
    "db": 2,
    "expire": 2592000
  },*/

  {
    "path": "./data",
    "type": "file"
  },

  "documents": {
    "about": "./about.md"
  }

}
