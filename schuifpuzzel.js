(function () {
  function PieceDeterminer() {
    //defines the overlay at the beginning of the puzzle where you determine the number of pieces
    this.image = 'url(images/image' + Math.floor(Math.random() * 10 + 1) + '.jpg)';
    this.game = new Puzzle();
    this.rowSize = 4;
    this.rowNumbers = document.getElementById('total');
    this.createExample();
    this.continueButton = document.getElementById('continue');
    this.continueButton.onclick = this.startPuzzle.bind(this);

    document.getElementById('sum').onclick = function () {
      //adds 1 to the number of rows and updates the example
      if (this.rowSize < 8) //8 is the max number of rows
        this.rowNumbers.innerHTML = (this.rowSize += 1) + ' x ' + this.rowSize;
      this.createExample();
    }.bind(this);

    document.getElementById('subtract').onclick = function () {
      //subtracts 1 from the number of rows and updates the example
      if (this.rowSize > 3) //3 is the minimum number of rows
        this.rowNumbers.innerHTML = (this.rowSize -= 1) + ' x ' + this.rowSize;
      this.createExample();
    }.bind(this);
  }

  PieceDeterminer.prototype.createExample = function () {
    //create a table wich represents the puzzle.
    var zone = document.getElementById('overlay');
    zone.style.backgroundImage = this.image;

    var table = document.createElement('table');

    zone.innerHTML = "";

    for (var Y = 0; Y < this.rowSize; Y++) {
      var row = document.createElement('tr');

      table.className = 'table';
      table.appendChild(row);
      for (var X = 0; X < this.rowSize; X++) {
        var cell = document.createElement('td');

        cell.style.width = 300 / this.rowSize + 'px';
        cell.style.height = 200 / this.rowSize + 'px';
        row.appendChild(cell);
      }
    }
    zone.appendChild(table);
  };

  PieceDeterminer.prototype.startPuzzle = function () {
    //the overlay slides away and the puzzle begins
    document.getElementById('overlay').style.opacity = 0;
    this.game = new Puzzle(this.rowSize, this.image);
    this.continueButton.onclick = null;
    document.getElementById('sum').onclick = null;
    document.getElementById('subtracts').onclick = null;
  };


  function Puzzle(rowSize, image) {
    //Defines the puzzle object.
    this.container = document.getElementById('puzzle');
    this.defaultwidth = 914;
    this.defaultheight = 688;
    this.rowSize = rowSize;
    this.width = this.defaultwidth;
    this.height = this.defaultheight;
    this.image = image;
    this.movesCounter = 0;
    this.pieceArray = [];
    this.open = (rowSize * rowSize) - 1;
    document.getElementById('shuffleButton').onclick = function () {
      if (this.compare(this.pieceArray)) {
        this.movesCounter = 0;
        document.getElementById('movesCounter').innerHTML = 'Moves: ' + this.movesCounter;
        this.shuffle();
      }
    }.bind(this);
    this.createPieces();
    this.sizeSlider = new Slider(this);
  }

  Puzzle.prototype.createPieces = function () {
    //generates all the pieces and puts them in the pieceArray
    for (var x = 0; x < this.open; x++ ) {
      var offsetX = (x % this.rowSize) * (-this.width / this.rowSize);
      var offsetY = Math.floor(x / this.rowSize) * (-this.height / this.rowSize);
      this.pieceArray.push(new ImagePiece(x, offsetX, offsetY, this));
    }
  };

  Puzzle.prototype.incrementMovesCounter = function () {
    //Updates the movementcounter
    this.movesCounter += 1;
    document.getElementById('movesCounter').innerHTML = 'Moves: ' + this.movesCounter;
  };

  Puzzle.prototype.compare = function (pieceArray) {
    //compares the current state of the puzzle with the 
    var counter = 0;
    for (var index = 0; index < pieceArray.length; index++) {
      var follow = pieceArray[index].pieceNumber;

      if ((pieceArray[index].positionX === -pieceArray[index].offsetX) &&
         (pieceArray[index].positionY === -pieceArray[index].offsetY))
        counter++;
    }
      return (counter === this.rowSize * this.rowSize - 1);
  };

  Puzzle.prototype.calculateNewPosition = function (ImagePiece) {
    //calculate the new positions of the piece that is given as parameter
    ImagePiece.gridX = ImagePiece.pieceNumber % this.rowSize;
    ImagePiece.gridY = Math.floor(ImagePiece.pieceNumber / this.rowSize);
    ImagePiece.positionX = ImagePiece.gridX * ImagePiece.width;
    ImagePiece.positionY = ImagePiece.gridY * ImagePiece.height;
  };

  Puzzle.prototype.planMovement = function (ImagePiece) {
    //Checks the position of the clicked piece and returns the new positions op de piece.
    var width = ImagePiece.width;
    var height = ImagePiece.height;
    var openX = this.open % this.rowSize;
    var openY = Math.floor(this.open / this.rowSize);

    if (ImagePiece.gridX + 1 === openX && ImagePiece.gridY === openY ||
        ImagePiece.gridX - 1 === openX && ImagePiece.gridY === openY ||
        ImagePiece.gridX === openX && ImagePiece.gridY - 1 === openY ||
        ImagePiece.gridX === openX && ImagePiece.gridY + 1 === openY) {
        var temp = this.open;
        this.open = ImagePiece.pieceNumber;
        ImagePiece.pieceNumber = temp;
        this.calculateNewPosition(ImagePiece);
        return true;
    }
  };

  Puzzle.prototype.shuffle = function () {
    //shuffles the puzzlepieces
    var tempArray = [];
    var resetTransition = function (piece) {
      this.piece.style.transitionDuration = 0 + 's,' + 0 + 's';
    };

    document.getElementById('overlay').style.zIndex = 0;
    for (var i = 0; i < this.pieceArray.length; i++) {
      tempArray[i] = this.pieceArray[i].pieceNumber;
    }

    tempArray = this.shuffleArray(tempArray);
    
    for (var each in this.pieceArray) {
      var piece = this.pieceArray[each];

      piece.pieceNumber = tempArray[each];
      this.calculateNewPosition(piece);
      piece.piece.style.transitionDuration = 1 + 's,' + 1 + 's';
      piece.piece.style.left = piece.positionX + 'px';
      piece.piece.style.top = piece.positionY + 'px';
      setTimeout(resetTransition.bind(piece), 1000);
      document.getElementById('achievement').style.visibility = 'hidden';
    }
  };

  Puzzle.prototype.shuffleArray = function (tempArray) {
    //shuffles an array and checks if its valid
    var remaining = tempArray.length, temp, index;
    var count = 0;

    while (remaining) {
      index = Math.floor(Math.random() * remaining--);
      temp = tempArray[remaining];
      tempArray[remaining] = tempArray[index];
      tempArray[index] = temp;
    }
    count += (tempArray[0] - 1);

    for (var i = 1; i < this.open; i++) {
      for (var previousIndex = i; previousIndex < this.open; previousIndex++) {
        if (tempArray[index] >= tempArray[previousIndex])
          count += 1;
      }
    }
    if (count % 2 === 1)
      return this.shuffleArray(tempArray);
    else
      return tempArray;
  };

  function ImagePiece(n, offsetX, offsetY, puzzle) {
    //Defines the piece objects of the puzzle object.
    this.puzzle = puzzle;
    this.pieceNumber = n;
    this.positionNumber = n;
    this.gridX = n % this.puzzle.rowSize; //x-position in the grid
    this.gridY = Math.floor(n / this.puzzle.rowSize); //y-position in the grid
    this.offsetX = offsetX; //x-position of the background
    this.offsetY = offsetY; //y-position of the background
    this.positionX = -offsetX; //x-position of the piece
    this.positionY = -offsetY; //y-position of the piece
    this.width = puzzle.width / this.puzzle.rowSize; //in px
    this.height = puzzle.height / this.puzzle.rowSize; //in px

    //Creates a div which is used as a puzzlepiece
    piece = document.createElement('div');
    piece.className = 'piece';
    piece.style.backgroundImage = this.puzzle.image;
    piece.style.backgroundPosition = this.offsetX + 'px ' + this.offsetY + 'px';
    piece.style.width = this.width + 'px';
    piece.style.height = this.height + 'px';
    piece.style.left = this.positionX + 'px';
    piece.style.top = this.positionY + 'px';

    puzzle.container.appendChild(piece);
    this.piece = piece;
    piece.onclick = this.move.bind(this);
  }

  ImagePiece.prototype.move = function () {
    //Moves a piece from one place to another and updates the positions
    var resetTransition = function (piece) {
      this.piece.style.transitionDuration = 0 + 's,' + 0 + 's';
    };

    if (!this.currentAnimation && this.puzzle.planMovement(this)) {
      this.piece.style.transitionDuration = 1 + 's,' + 1 + 's';
      this.piece.style.left = this.positionX + 'px';
      this.piece.style.top = this.positionY + 'px';
      setTimeout(resetTransition.bind(this), 1000);
      this.puzzle.incrementMovesCounter();
      this.checkPositions();
    }
  };

  ImagePiece.prototype.checkPositions = function () {
    var removePuzzle = function () {
      for (var p = 0; p < this.puzzle.pieceArray.length; p++) {
        this.puzzle.container.removeChild(this.puzzle.pieceArray[p].piece);
      }
    };

      //document.getElementById('achievement').style.visibility = 'visible';
      //document.getElementById('audio').play();
      window.setTimeout(removePuzzle, 3000);

  
  };

  function Slider(puzzle) {
    //defines the slider object
    this.puzzle = puzzle;
    this.container = document.getElementById('sizeBar');
    this.width = parseInt(getComputedStyle(this.container, null).getPropertyValue('width'), 10);
    this.value = 150;
    this.drag = false;
    this.handle = document.getElementById('sizeSlider');

    this.handle.style.marginLeft = (this.value) + 'px';

    this.handle.onmousedown = this.startDrag.bind(this);
    window.onmouseup = this.stopDrag.bind(this);
    window.onmousemove = function (event) {
      this.slide(event);
    }.bind(this);
    this.resize();
  }

  Slider.prototype.startDrag = function () {
    //turn on this.drag
    this.drag = true;
  };

  Slider.prototype.stopDrag = function () {
    //turn of this.drag
    this.drag = false;
  };

  Slider.prototype.resize = function () {
    //resize the puzzle when the user is sliding the slider
    var defaultheight = this.puzzle.defaultheight;
    var defaultwidth = this.puzzle.defaultwidth;
    var pieceArray = this.puzzle.pieceArray;

    //reconfiguring the sizes of the puzzle
    this.puzzle.width = Math.floor(defaultwidth + this.value);
    this.puzzle.height = Math.floor(defaultheight + ((defaultheight / defaultwidth) * this.value));

    //reconfiguring the puzzle elements
    for(var each in pieceArray) {
      var ImagePiece = pieceArray[each];
      var piece = pieceArray[each].piece;
      piece.style.transitionDuration = 0 + 's,' + 0 + 's';

      //calculating the new puzzlepieceproperties
      ImagePiece.width = Math.floor(this.puzzle.width / this.puzzle.rowSize);
      ImagePiece.height = Math.floor(this.puzzle.height / this.puzzle.rowSize);
      ImagePiece.positionX = ImagePiece.gridX * ImagePiece.width;
      ImagePiece.positionY = Math.floor(ImagePiece.gridY) * ImagePiece.height;
      ImagePiece.offsetX = -ImagePiece.positionNumber % this.puzzle.rowSize * ImagePiece.width;
      ImagePiece.offsetY = -Math.floor(ImagePiece.positionNumber / this.puzzle.rowSize) * ImagePiece.height;

      //update the style of the puzzle pieces
      piece.style.backgroundSize = this.puzzle.width + 'px ' + this.puzzle.height + 'px';
      piece.style.backgroundPosition = ImagePiece.offsetX + 'px ' + ImagePiece.offsetY + 'px';
      piece.style.width = ImagePiece.width + 'px';
      piece.style.height = ImagePiece.height + 'px';
      piece.style.left = ImagePiece.positionX + 'px';
      piece.style.top = ImagePiece.positionY + 'px';
    }
    //update the style of the puzzlesize
    this.puzzle.container.style.width = this.puzzle.width + 'px';
    this.puzzle.container.style.height = this.puzzle.height + 'px';
  };

  Slider.prototype.slide = function (event) {
    //calculate the new value given by the slider
    if (this.drag) {
        this.value = event.pageX - (window.innerWidth / 2) + (this.width / 2);
        if (this.value < 0)
          this.value = 0;
        else if (this.value > this.width)
          this.value = this.width;
        this.handle.style.marginLeft = this.value + 'px';

        this.resize();
    }
  };

  new PieceDeterminer();
  
}());
