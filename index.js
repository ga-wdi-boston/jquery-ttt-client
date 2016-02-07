'use strict';
let token = null;

var tttapi = {
  gameWatcher: null,
  ttt: 'http://tic-tac-toe.wdibos.com',

  ajax: function ajax(config, cb) {
    $.ajax(config).done(function(data, textStatus, jqxhr) {
      cb(null, data);
    }).fail(function(jqxhr, status, error) {
      cb({ jqxher: jqxhr, status: status, error: error });
    });
  },

  register: function register(credentials, callback) {
    this.ajax({
      // url: 'http://httpbin.org/post',
      url: this.ttt + '/sign-up',
      method: 'POST',
      processData: false,
      contentType: false,
      data: credentials,
    }, callback);
  },

  login: function login(credentials, callback) {
    this.ajax({
      // url: 'http://httpbin.org/post',
      url: this.ttt + '/sign-in',
      method: 'POST',
      processData: false,
      contentType: false,
      data: credentials,
    }, callback);
  },

  //Authenticated api actions
  listGames: function listGames(token, callback) {
    this.ajax({
      method: 'GET',
      url: this.ttt + '/games',
      headers: {
        Authorization: 'Token token=' + token,
      },
      dataType: 'json',
    }, callback);
  },

  createGame: function(data, token, callback) {
    this.ajax({
      method: 'POST',
      url: this.ttt + '/games',
      headers: {
        Authorization: 'Token token=' + token,
      },
      processData: false,
      contentType: false,
      data,
    }, callback);
  },

  showGame: function(id, token, callback) {
    this.ajax({
      method: 'GET',
      url: this.ttt + '/games/' + id,
      headers: {
        Authorization: 'Token token=' + token,
      },
    }, callback);
  },

  joinGame: function(id, data, token, callback) {
    this.ajax({
      method: 'PATCH',
      url: this.ttt + '/games/' + id,
      headers: {
        Authorization: 'Token token=' + token,
      },
      processData: false,
      contentType: false,
      data,
    }, callback);
  },

  markCell: function(id, data, token, callback) {
    this.ajax({
      method: 'PATCH',
      url: this.ttt + '/games/' + id,
      headers: {
        Authorization: 'Token token=' + token,
      },
      processData: false,
      contentType: false,
      data,
    }, callback);
  },

  watchGame: function(id, token) {
    var url = this.ttt + '/games/' + id + '/watch';
    var auth = {
      Authorization: 'Token token=' + token,
    };
    this.gameWatcher = resourceWatcher(url, auth); //jshint ignore: line
    return this.gameWatcher;
  },
};

//$(document).ready(...
$(function() {
  const callback = function callback(error, data) {
    if (error) {
      console.error(error);
      $('#result').val('status: ' + error.status + ', error: ' + error.error);
      return;
    }

    $('#result').val(JSON.stringify(data, null, 4));
  };

  $('#sign-up').on('submit', function(e) {
    let credentials = new FormData(e.target);
    tttapi.register(credentials, callback);
    e.preventDefault();
  });

  $('#sign-in').on('submit', function(e) {
    var credentials = new FormData(e.target);
    var cb = function cb(error, data) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, data);
      token = data.user.token;
    };

    e.preventDefault();
    tttapi.login(credentials, cb);
  });

  $('#list-games').on('submit', function(e) {
    e.preventDefault();
    tttapi.listGames(token, callback);
  });

  $('#create-game').on('submit', function(e) {
    e.preventDefault();
    tttapi.createGame(new FormData(), token, callback);
  });

  $('#show-game').on('submit', function(e) {
    e.preventDefault();
    var id = $('#show-id').val();
    tttapi.showGame(id, token, callback);
  });

  $('#join-game').on('submit', function(e) {
    e.preventDefault();
    var id = $('#join-id').val();
    tttapi.joinGame(id, new FormData(), token, callback);
  });

  $('#mark-cell').on('submit', function(e) {
    e.preventDefault();
    var id = $(e.target).find('[name="id"]').val();
    let data = new FormData(e.target);
    tttapi.markCell(id, data, token, callback);
  });

  $('#watch-game').on('submit', function(e) {
    var token = $(this).children('[name="token"]').val();
    var id = $('#watch-id').val();
    e.preventDefault();

    var gameWatcher = tttapi.watchGame(id, token);

    gameWatcher.on('change', function(data) {
      var parsedData = JSON.parse(data);
      if (data.timeout) { //not an error
        this.gameWatcher.close();
        return console.warn(data.timeout);
      }

      var gameData = parsedData.game;
      var cell = gameData.cell;
      $('#watch-index').val(cell.index);
      $('#watch-value').val(cell.value);
    });
    gameWatcher.on('error', function(e) {
      console.error('an error has occured with the stream', e);
    });
  });

});
