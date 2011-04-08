/*
 * Kifu.js
 */
(function(window) {


var _Kifu = window.Kifu;

/*
 * Kifu object
 */
var Kifu = (function(source, format) {
  return new Kifu.initialize(source, format);
});

Kifu.extend = Kifu.prototype.extend = function(source) {
  for (var property in source) {
    this[property] = source[property];
  }
  return this;
}

Kifu.prototype.extend({
  parse: function(format) {
    if (format) {
      this._format = format;
    }

    this._kifu = {
      board:  Kifu.Board(),
      format: format,
      moves:  Kifu.Move()
    };

    var klass = Kifu.capitalize(this._format);
    Kifu[klass].parse(this._kifu, this._source);

    return this;
  }
});

Kifu.extend({
  initialize: function(source, format) {
    this._source = Kifu.load(source);
    if (format) {
      this.parse(format);
    }
  },

  ajax: function(options, format, func_obj) {
    options['dataType'] = 'text';
    options['type']     = 'GET';
    options['success']  = function(source) {
      return func_obj(Kifu(source, format));
    };
    return jQuery.ajax(options);
  },

  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  },

  load: function(source) {
    var element = document.getElementById(source);
    if (element) {
      return element.innerHTML;
    } else {
      return source;
    }
  },

  noConflict: function() {
    window.Kifu = _Kifu;
    return Kifu;
  }
});

Kifu.initialize.prototype = Kifu.prototype

/*
 * Kifu.Board Object
 */
Kifu.Board = (function() { return new Kifu.Board.initialize(); });
Kifu.Board.extend = Kifu.Board.prototype.extend = Kifu.extend;

Kifu.Board.prototype.extend({
  get: function(x, y) {
    return this._board[x][y];
  },

  hirate: function() {
    this.set(1, 9, 'KY', true);
    this.set(2, 9, 'KE', true);
    this.set(3, 9, 'GI', true);
    this.set(4, 9, 'KI', true);
    this.set(5, 9, 'OU', true);
    this.set(6, 9, 'KI', true);
    this.set(7, 9, 'GI', true);
    this.set(8, 9, 'KE', true);
    this.set(9, 9, 'KY', true);
    this.set(8, 8, 'KA', true);
    this.set(2, 8, 'HI', true);
    for (i = 1; i <= 9; i++) {
      this.set(i, 7, 'FU', true);
    }

    this.set(1, 1, 'KY', false);
    this.set(2, 1, 'KE', false);
    this.set(3, 1, 'GI', false);
    this.set(4, 1, 'KI', false);
    this.set(5, 1, 'OU', false);
    this.set(6, 1, 'KI', false);
    this.set(7, 1, 'GI', false);
    this.set(8, 1, 'KE', false);
    this.set(9, 1, 'KY', false);
    this.set(2, 2, 'KA', false);
    this.set(8, 2, 'HI', false);
    for (i = 1; i <= 9; i++) {
      this.set(i, 3, 'FU', false);
    }

    return this;
  },

  remove: function(x, y, piece) {
    var p = this._board[x][y]['piece'];
    if (!this.trash(x, y, piece)) {
      return false;
    }
    this._pieces[p] += 1;
    return this;
  },

  set: function(x, y, piece, black) {
    this._board[x][y] = {black: black, piece: piece};
    this._pieces[piece] -= 1;
    return this;
  },

  setStand: function(piece, black) {
    var player = black ? 'black' : 'white';
    if (piece == 'AL') {
      for (var p in this._pieces) {
        if (p == 'OU') {
          continue;
        }
        this._stand[player][p] = this._stand[player][p] || 0;
        this._stand[player][p] += this._pieces[p];
        this._pieces[p] = 0;
      }
    } else {
      this._stand[player][piece] = this._stand[player][piece] || 0;
      this._stand[player][piece] += 1;
      this._pieces[piece] -= 1;
    }
    return this;
  },

  toObject: function() {
    return {
      board:  this._board,
      pieces: this._pieces,
      stand:  this._stand
    };
  },

  trash: function(x, y, piece) {
    if (!piece) {
      piece = this._board[x][y]['piece'];
    }
    if (piece != this._board[x][y]['piece']) {
      return false;
    }

    this._board[x][y] = null;
    return this;
  }
});

Kifu.Board.extend({
  initialize: function() {
    this._board  = Kifu.Board.empty();
    this._pieces = Kifu.Board.pieces();
    this._stand  = {black: {}, white: {}};
  },

  empty: function() {
    var board = {};
    for (var i = 1; i <= 9; i++) {
      board[i] = {}
      for (var j = 1; j <= 9; j++) {
        board[i][j] = null;
      }
    }
    return board;
  },

  pieces: function() {
    return {
      FU: 18,
      KY:  4,
      KE:  4,
      GI:  4,
      KI:  4,
      KA:  2,
      HI:  2,
      OU:  2
    };
  }
});

Kifu.Board.initialize.prototype = Kifu.Board.prototype


/*
 * Kifu.Move Object
 */
Kifu.Move = (function() { return new Kifu.Move.initialize(); });
Kifu.Move.extend = Kifu.Move.prototype.extend = Kifu.extend;

Kifu.Move.prototype.extend({
  addComment: function(comment) {
    var move = this._moves[this._moves.length-1];
    move['comment'] = (move['comment'] || '') + comment + "\n";
    return this;
  },

  addMove: function(from, to, piece, options) {
    var move = this.newMove();
    move['type']  = 'move';
    move['from']  = from;
    move['to']    = to;
    move['piece'] = piece;
    for (var property in options) {
      move[property] = options[property];
    }
    if (to[0] == 0) {
      move['to'] = this._moves[this._moves.length-2]['to'];
    }
    return this;
  },

  addPeriod: function(period) {
    this._moves[this._moves.length-1]['period'] = period;
    return this;
  },

  addSpecial: function(type, options) {
    var move = this.newMove();
    move['type'] = type;
    for (var property in options) {
      move[property] = options[property];
    }
    return this;
  },

  newMove: function() {
    var move = this._moves[this._moves.length-1];
    if (move['type']) {
      this._moves.push({});
      move = this._moves[this._moves.length-1];
    }
    return move;
  },

  toArray: function() {
    return this._moves;
  }
});

Kifu.Move.extend({
  initialize: function() {
    this._moves = [{type: 'init'}];
  }
});

Kifu.Move.initialize.prototype = Kifu.Move.prototype


window.Kifu = Kifu;
})(window);


/*
 * Kifu.Csa Object
 */
(function(Kifu) {
Kifu.Csa = {
  parse: function(kifu, source) {
    var lines = Kifu.Csa.toLines(source);
    for (var i in lines) {
      var line = lines[i];
      Kifu.Csa.parseByLine(line, kifu);
    }

    return kifu;
  },

  parseByLine: function(line, kifu) {
    if (line == '+') {
      kifu['start_player'] = 'black';
      return true;
    } else if (line == '-') {
      kifu['start_player'] = 'white';
      return true;
    } else if (line.substr(0, 3) == "'* ") {
      kifu['moves'].addComment(line.substr(3));
      return true;
    }

    switch (line.charAt(0)) {
    case '$':
      var pos   = line.indexOf(':');
      var key   = line.substr(1, pos-1).toLowerCase();
      var value = line.substr(pos+1);

      switch (key) {
      case 'end_time':
      case 'start_time':
        var date = new Date();
        date.setTime(Date.parse(value));
        value = date;
        break;

      case 'time_limit':
        var hours   = parseInt(value.substr(0, 2));
        var minutes = parseInt(value.substr(3, 2));
        var extra   = parseInt(value.substr(6));
        value = {
          allotted: hours * 60 + minutes,
          extra: extra};
        break;
      }

      kifu[key] = value;
      return true;

    case '%':
      var value   = line.substr(1).toLowerCase();
      var options = {};

      switch (value.charAt(0)) {
      case '+':
      case '-':
        options['player'] = value.charAt(0) == '+' ? 'black' : 'white';
        value = value.substr(1);
        break;
      }

      kifu['moves'].addSpecial(value, options);
      return true;

    case '+':
    case '-':
      var from = [line.charAt(1)-'0', line.charAt(2)-'0'];
      var to   = [line.charAt(3)-'0', line.charAt(4)-'0'];
      var piece = line.substr(5, 2);
      kifu['moves'].addMove(from, to, piece);
      return true;

    case 'N':
      var player = (line.charAt(1) == '+' ? 'black' : 'white') + '_player';
      kifu[player] = line.substr(2);
      return true;

    case 'P':
      switch (line.charAt(1)) {
      case 'I':
        kifu['board'].hirate();
        for (var i = 0; ; i++) {
          var p_info = line.substr(2+i*4, 4);
          if (p_info.length < 4) {
            break;
          }
          var x     = p_info.charAt(0) - '0';
          var y     = p_info.charAt(1) - '0';
          var piece = p_info.substr(2);
          kifu['board'].trash(x, y, piece);
        }
        return true;

      case '+':
      case '-':
        var black = line.charAt(1) == '+';
        for (var i = 0; ; i++) {
          var p_info = line.substr(2+i*4, 4);
          if (p_info.length < 4) {
            break;
          }
          var x     = p_info.charAt(0) - '0';
          var y     = p_info.charAt(1) - '0';
          var piece = p_info.substr(2);
          if (x == 0 && y == 0) {
            kifu['board'].setStand(piece, black);
          } else {
            kifu['board'].set(x, y, piece, black);
          }
        }
        return true;

      default:
        var y = line.charAt(1) - '0';
        if (y < 1 || 9 < y) {
          return false;
        }
        for (var i = 0; i < 9; i++) {
          var p_info = line.substr(2+i*3, 3);
          switch (p_info.charAt(0)) {
          case '+':
            var black = true;
            break;
          case '-':
            var black = false;
            break;
          default:
            continue;
          }
          var x     = 9 - i;
          var piece = p_info.substr(1, 2);
          kifu['board'].set(x, y, piece, black);
        }
        return true;
      }
      return false;

    case 'T':
      var period = parseInt(line.substr(1));
      kifu['moves'].addPeriod(period);
      return true;

    case 'V':
      kifu['version'] = line.substr(1);
      return true;
    }

    return false;
  },

  toLines: function(source) {
    var lines = source.split("\r\n");
    if (lines.length > 1) {
      return lines;
    }

    lines = source.split("\n");
    if (lines.length > 1) {
      return lines;
    }

    return source.split("\r");
  }
};
})(Kifu);


/*
 * Kifu.Kif Object
 */
(function(Kifu) {

var kifu_map = {
  '同':   0,
  '　':   0,
  '１':   1,
  '２':   2,
  '３':   3,
  '４':   4,
  '５':   5,
  '６':   6,
  '７':   7,
  '８':   8,
  '９':   9,
  '一':   1,
  '二':   2,
  '三':   3,
  '四':   4,
  '五':   5,
  '六':   6,
  '七':   7,
  '八':   8,
  '九':   9,
  '歩':   'FU',
  '香':   'KY',
  '桂':   'KE',
  '銀':   'GI',
  '金':   'KI',
  '角':   'KA',
  '飛':   'HI',
  '王':   'OU',
  '玉':   'OU',
  '歩成': 'TO',
  '香成': 'NY',
  '桂成': 'NK',
  '銀成': 'NG',
  '角成': 'UM',
  '飛成': 'RY',
  'と金': 'TO',
  '成香': 'NY',
  '成桂': 'NK',
  '成銀': 'NG',
  '馬':   'UM',
  '龍':   'RY',
};

Kifu.Kif = {
  parse: function(kifu, source) {
    var lines = Kifu.Kif.toLines(source);
    for (var i in lines) {
      var line = lines[i];
      Kifu.Kif.parseByLine(line, kifu);
    }

    console.log(kifu);
    return kifu;
  },

  parseByLine: function(line, kifu) {
    switch (line.charAt(0)) {
    case '*':
      kifu['moves'].addComment(line.substr(1));
      return true;
    }

    if (line.match(/^\s+([0-9]+)\s+(.+)\s+\((.*)\)$/)) {
      var num  = parseInt(RegExp.$1);
      var move = Kifu.Kif.strip(RegExp.$2);
      var time = Kifu.Kif.strip(RegExp.$3);

      if (move == '投了') {
        kifu['moves'].addSpecial('toryo');
        return true;
      }

      var to = [kifu_map[move.charAt(0)], kifu_map[move.charAt(1)]];
      if (move.substr(2).match(/(.*)\(([1-9])([1-9])\)/)) {
        var piece = kifu_map[RegExp.$1];
        var from  = [parseInt(RegExp.$2), parseInt(RegExp.$3)];
        move.match(/(.*)\(/);
        var str   = RegExp.$1;
      } else {
        var piece = kifu_map[move.charAt(2)];
        var from  = [0, 0];
        var str   = move;
      }
      console.log(from, to, piece, str);
      kifu['moves'].addMove(from, to, piece, {str: str});

      return true;
    }

    if (line.match(/(.+)：(.+)/)) {
      var key   = RegExp.$1;
      var value = Kifu.Kif.strip(RegExp.$2);

      switch (key) {
      case '対局ID':
        kifu['kif'] = kifu['kif'] || {};
        kifu['kif']['id'] = parseInt(value);
        return true;

      case '開始日時':
        kifu['start_time'] = Kifu.Kif.toDate(value);
        return true;

      case '終了日時':
        kifu['end_time'] = Kifu.Kif.toDate(value);
        return true;

      case '表題':
        kifu['title'] = value;
        return true;

      case '棋戦':
        kifu['event'] = value;
        return true;

      case '持ち時間':
        if (value.match(/各([0-9]+)時間/)) {
          kifu['time_limit'] = kifu['time_limit'] || {};
          kifu['time_limit']['allotted'] = parseInt(RegExp.$1) * 60;
        }
        return true;

      case '消費時間':
        if (value.match(/[0-9]+▲([0-9]+)△([0-9]+)/)) {
          kifu['time_consumed'] = {
            black: parseInt(RegExp.$1),
            white: parseInt(RegExp.$2)
          };
        }
        return true;

      case '場所':
        kifu['site'] = value;
        return true;

      case '手合割':
        switch (value) {
        case '平手':
        default:
          kifu['board'].hirate();
          break;
        }
        return true;

      case '先手':
        kifu['black_player'] = value;
        return true;

      case '後手':
        kifu['white_player'] = value;
        return true;

      default:
        kifu[key] = value;
        return true;
      }
    }

    return false;
  },

  strip: function(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  toDate: function(str) {
    var date = new Date();
    date.setTime(Date.parse(str));
    return date;
  },

  toLines: function(source) {
    var lines = source.split("\r\n");
    if (lines.length > 1) {
      return lines;
    }

    lines = source.split("\n");
    if (lines.length > 1) {
      return lines;
    }

    return source.split("\r");
  }
};
})(Kifu);

/* vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2: */
