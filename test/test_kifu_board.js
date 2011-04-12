(function() {


var kifu_board;

module('Kifu.Board', {
  setup: function() {
    kifu_board = Kifu.Board();
  }
});

test('boardEmpty', 1, function() {
  var board = {};
  for (var i = 1; i <= 9; i++) {
    board[i] = {}
    for (var j = 1; j <= 9; j++) {
      board[i][j] = null;
    }
  };
  same(Kifu.Board.boardEmpty(), board, 'boardEmpty');
});

test('piecesDefault', 1, function() {
  var pieces = {FU: 18, KY: 4, KE: 4, GI: 4, KI: 4, KA: 2, HI: 2, OU: 2};
  same(Kifu.Board.piecesDefault(), pieces, 'piecesDefault');
});

test('standEmpty', 1, function() {
  var stand = {FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0, OU: 0};
  same(Kifu.Board.standEmpty(), stand, 'standEmpty');
});

test('initialization', 3, function() {
  var stand = {black: Kifu.Board.standEmpty(), white: Kifu.Board.standEmpty()};
  same(kifu_board.board(),  Kifu.Board.boardEmpty(), 'board');
  same(kifu_board.pieces(), Kifu.Board.piecesDefault(), 'pieces');
  same(kifu_board.stand(),  stand, 'stand');
});

test('cellDeploy, cellRemove', 30, function() {
  var board  = Kifu.clone(kifu_board.board());
  var pieces = Kifu.clone(kifu_board.pieces());
  var stand  = Kifu.clone(kifu_board.stand());

  // deploy +18FU
  board[1][8] = {black: true, piece: 'FU'};
  pieces['FU'] = 17;
  ok(kifu_board.cellDeploy(1, 8, 'FU', true), 'deploy +18FU');
  same(kifu_board.board(),  board,  'deploy +18FU board');
  same(kifu_board.pieces(), pieces, 'deploy +18FU pieces');
  same(kifu_board.stand(),  stand,  'deploy +18FU stand');

  // deploy -73KA
  board[7][3] = {black: false, piece: 'KA'};
  pieces['KA'] = 1;
  ok(kifu_board.cellDeploy(7, 3, 'KA', false), 'deploy -73KA' );
  same(kifu_board.board(),  board,  'deploy -73KA board');
  same(kifu_board.pieces(), pieces, 'deploy -73KA pieces');
  same(kifu_board.stand(),  stand,  'deploy -73KA stand');

  // deploy +73KA fail
  same(kifu_board.cellDeploy(7, 3, 'KA', true), false, 'deploy +73KA');
  same(kifu_board.board(),  board,  'deploy +73KA board');
  same(kifu_board.pieces(), pieces, 'deploy +73KA pieces');
  same(kifu_board.stand(),  stand,  'deploy +73KA stand');

  // deploy +74KA: success, deploy +75KA: fail(lack of pieces)
  board[7][4] = {black: true, piece: 'KA'};
  pieces['KA'] = 0;
  ok(kifu_board.cellDeploy(7, 4, 'KA', true), 'deploy +74KA');
  same(kifu_board.cellDeploy(7, 5, 'KA', false), false, 'deploy +75KA');
  same(kifu_board.board(),  board,  'deploy +74KA board');
  same(kifu_board.pieces(), pieces, 'deploy +74KA pieces');
  same(kifu_board.stand(),  stand,  'deploy +74KA stand');

  // remove 18FU
  board[1][8] = null;
  pieces['FU'] = 18;
  ok(kifu_board.cellRemove(1, 8, 'FU'), 'remove 18FU');
  same(kifu_board.board(),  board,  'remove 18FU board');
  same(kifu_board.pieces(), pieces, 'remove 18FU pieces');
  same(kifu_board.stand(),  stand,  'remove 18FU stand');

  // remove 73: success, remove 73: fail
  board[7][3] = null;
  pieces['KA'] = 1;
  ok(kifu_board.cellRemove(7, 3), 'remove 73');
  same(kifu_board.cellRemove(7, 3), false, 'remove 73');
  same(kifu_board.board(),  board,  'remove 73 board');
  same(kifu_board.pieces(), pieces, 'remove 73 pieces');
  same(kifu_board.stand(),  stand,  'remove 73 stand');

  // remove 74HI: fail
  same(kifu_board.cellRemove(7, 4, 'HI'), false, 'remove 74HI');
  same(kifu_board.board(),  board,  'remove 74HI board');
  same(kifu_board.pieces(), pieces, 'remove 74HI pieces');
  same(kifu_board.stand(),  stand,  'remove 74HI stand');
});

test('cellGet, cellSet, cellTrash', 10, function() {
  // +26KY
  var piece = {black: true, piece: 'KY'};
  same(kifu_board.cellGet(2, 6), null, 'get 26');
  ok(kifu_board.cellSet(2, 6, 'KY', true), 'set +26KY');
  same(kifu_board.cellGet(2, 6), piece, 'get 26');

  // -26HI
  var piece = {black: false, piece: 'HI'};
  ok(kifu_board.cellSet(2, 6, 'HI', false), 'set -26HI');
  same(kifu_board.cellGet(2, 6), piece, 'get 26');
  same(kifu_board.cellTrash(2, 6, 'KA'), false, 'trash 26KA');
  same(kifu_board.cellGet(2, 6), piece, 'get 26');
  ok(kifu_board.cellTrash(2, 6), 'trash 26');
  same(kifu_board.cellGet(2, 6), null, 'get 26');
  same(kifu_board.cellTrash(2, 6), false, 'trash 26');
});

test('hirate', 4, function() {
  var board = {
    1: {
      1: {black: false, piece: 'KY'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'KY'}},
    2: {
      1: {black: false, piece: 'KE'},
      2: {black: false, piece: 'KA'},
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: {black: true, piece: 'HI'},
      9: {black: true, piece: 'KE'}},
    3: {
      1: {black: false, piece: 'GI'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'GI'}},
    4: {
      1: {black: false, piece: 'KI'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'KI'}},
    5: {
      1: {black: false, piece: 'OU'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'OU'}},
    6: {
      1: {black: false, piece: 'KI'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'KI'}},
    7: {
      1: {black: false, piece: 'GI'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'GI'}},
    8: {
      1: {black: false, piece: 'KE'},
      2: {black: false, piece: 'HI'},
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: {black: true, piece: 'KA'},
      9: {black: true, piece: 'KE'}},
    9: {
      1: {black: false, piece: 'KY'},
      2: null,
      3: {black: false, piece: 'FU'},
      4: null,
      5: null,
      6: null,
      7: {black: true, piece: 'FU'},
      8: null,
      9: {black: true, piece: 'KY'}},
  };

  var pieces = {
    FU: 0,
    KY: 0,
    KE: 0,
    GI: 0,
    KI: 0,
    KA: 0,
    HI: 0,
    OU: 0};

  var stand = Kifu.clone(kifu_board.stand());

  ok(kifu_board.hirate(), 'hirate');
  same(kifu_board.board(),  board,  'hirate board');
  same(kifu_board.pieces(), pieces, 'hirate pieces');
  same(kifu_board.stand(),  stand,  'hirate stand');
});

test('move, moveReverse', 36, function() {
  kifu_board.hirate();
  var board  = Kifu.clone(kifu_board.board());
  var pieces = Kifu.clone(kifu_board.pieces());
  var stand  = Kifu.clone(kifu_board.stand());
  var states = [];

  // +2726FU
  board[2][7] = null;
  board[2][6] = {black: true, piece: 'FU'};
  states.push({
    title:  '+2726FU',
    board:  Kifu.clone(board),
    pieces: Kifu.clone(pieces),
    stand:  Kifu.clone(stand),
    move1: {
      black: true,
      from:  {             x: 2, y: 7},
      to:    {piece: 'FU', x: 2, y: 6}},
    move2: {
      black: true,
      from:  {piece: 'FU', x: 2, y: 7},
      to:    {piece: 'FU', x: 2, y: 6}}});

  // -8288RY
  board[8][2] = null;
  board[8][8] = {black: false, piece: 'RY'};
  stand['white']['KA'] = 1;
  states.push({
    title:  '+8288RY',
    board:  Kifu.clone(board),
    pieces: Kifu.clone(pieces),
    stand:  Kifu.clone(stand),
    move1: {
      black: false,
      from:  {             x: 8, y: 2},
      to:    {piece: 'RY', x: 8, y: 8}},
    move2: {
      black: false,
      stand: {piece: 'KA', stand: 'KA'},
      from:  {piece: 'HI', x: 8, y: 2},
      to:    {piece: 'RY', x: 8, y: 8}}});

  // +7988GI
  board[7][9] = null;
  board[8][8] = {black: true, piece: 'GI'};
  stand['black']['HI'] = 1;
  states.push({
    title:  '+7988GI',
    board:  Kifu.clone(board),
    pieces: Kifu.clone(pieces),
    stand:  Kifu.clone(stand),
    move1: {
      black: true,
      from:  {             x: 7, y: 9},
      to:    {piece: 'GI', x: 8, y: 8}},
    move2: {
      black: true,
      stand: {piece: 'RY', stand: 'HI'},
      from:  {piece: 'GI', x: 7, y: 9},
      to:    {piece: 'GI', x: 8, y: 8}}});

  // -0055KA
  board[5][5] = {black: false, piece: 'KA'};
  stand['white']['KA'] = 0;
  states.push({
    title:  '-0055KA',
    board:  Kifu.clone(board),
    pieces: Kifu.clone(pieces),
    stand:  Kifu.clone(stand),
    move1: {
      black: false,
      from:  {             x: 0, y: 0},
      to:    {piece: 'KA', x: 5, y: 5}},
    move2: {
      black: false,
      from:  {piece: 'KA', x: 0, y: 0},
      to:    {piece: 'KA', x: 5, y: 5}}});

  for (var i in states) {
    var state = states[i];
    var title = state['title'];
    ok(kifu_board.move(state['move1']), title);
    same(kifu_board.board(),  state['board'],  title+' board');
    same(kifu_board.pieces(), state['pieces'], title+' pieces');
    same(kifu_board.stand(),  state['stand'],  title+' stand');
    same(state['move1'], state['move2'], title+' move');
  }

  for (var i = states.length-1; 0 <= i; i--) {
    var state      = states[i];
    var state_prev = states[i-1];
    var title      = state['title'];

    if (!state_prev) {
      var b = Kifu.Board().hirate();
      state_prev = {
        board:  b.board(),
        pieces: b.pieces(),
        stand:  b.stand()};
    }

    ok(kifu_board.moveReverse(state['move1']), 'reverse '+title);
    same(kifu_board.board(),  state_prev['board'],  'reverse '+title+' board');
    same(kifu_board.pieces(), state_prev['pieces'], 'reverse '+title+' pieces');
    same(kifu_board.stand(),  state_prev['stand'],  'reverse '+title+' stand');
  }
});

test('standDeploy, standRemove', 16, function() {
  var pieces = Kifu.clone(kifu_board.pieces());
  var stand  = Kifu.clone(kifu_board.stand());

  // +KA
  pieces['KA'] = 1;
  stand['black']['KA'] = 1;
  ok(kifu_board.standDeploy('KA', true), '+KA');
  same(kifu_board.pieces(), pieces, '+KA pieces');
  same(kifu_board.stand(),  stand,  '+KA stand');

  // -KA
  pieces['KA'] = 0;
  stand['white']['KA'] = 1;
  ok(kifu_board.standDeploy('KA', false), '-KA');
  same(kifu_board.standDeploy('KA', false), false, '-KA');
  same(kifu_board.pieces(), pieces, '-KA pieces');
  same(kifu_board.stand(),  stand,  '-KA stand');

  // +AL
  pieces = Kifu.Board.standEmpty();
  pieces['OU'] = 2;
  stand['black'] = Kifu.Board.piecesDefault();
  stand['black']['KA'] = 1;
  stand['black']['OU'] = 0;
  ok(kifu_board.standDeploy('AL', true), '+AL');
  same(kifu_board.pieces(), pieces, '+AL pieces');
  same(kifu_board.stand(),  stand,  '+AL stand');

  // remove -KA
  stand['white']['KA'] = 0;
  ok(kifu_board.standRemove('KA', false), 'remove -KA');
  same(kifu_board.stand(), stand, 'remove -KA stand');

  // remove +KA
  stand['black']['KA'] = 0;
  ok(kifu_board.standRemove('KA', true), 'remove +KA');
  same(kifu_board.standRemove('KA', true), false, 'remove +KA');
  same(kifu_board.stand(), stand, 'remove +KA stand');
  same(kifu_board.standRemove('KA', true), false, 'remove +KA');
});

test('standSet, standTrash', 9, function() {
  var stand = Kifu.clone(kifu_board.stand());

  // +FU
  stand['black']['FU'] = 1;
  ok(kifu_board.standSet('FU', true), '+FU');
  same(kifu_board.stand(), stand, '+FU stand');

  // -KY
  stand['white']['KY'] = 1;
  ok(kifu_board.standSet('KY', false), '-KY');
  same(kifu_board.stand(), stand, '-KY stand');

  // trash -KY
  stand['white']['KY'] = 0;
  ok(kifu_board.standTrash('KY', false), 'trash -KY');
  same(kifu_board.stand(), stand, 'trash -KY stand');

  // trash +FU
  stand['black']['FU'] = 0;
  ok(kifu_board.standTrash('FU', true), 'trash +FU');
  same(kifu_board.stand(), stand, 'trash +FU stand');
  same(kifu_board.standTrash('FU', true), false, 'trash +FU');
});


})();

/* vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2: */