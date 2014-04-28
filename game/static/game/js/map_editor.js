'use strict';

var ocargo = ocargo || {};

ocargo.MapEditor = function() {
	this.submittedPoints = [];
	this.map = initialiseVisited();
	this.grid = initialiseVisited();
	this.current = [];
	this.possibleNext = [];
}

ocargo.MapEditor.prototype.markPossible = function(point) {
	for (var i = 0; i < this.possibleNext.length; i++) {
		var curr = this.possibleNext[i];
		this.mark(curr, "white", 0, false);
	}
	this.possibleNext = getPossibleNextMoves(point, this.map);
	for (var i = 0; i < this.possibleNext.length; i++) {
		var curr = this.possibleNext[i];
		this.mark(this.possibleNext[i], "#a4a4a6", 1, undefined);
	}
};

ocargo.MapEditor.prototype.mark = function(point, colour, opacity, occupied) {
	var element = this.grid[point[0]][point[1]];
	if(occupied) {
		this.current = point;
		this.submittedPoints.push([point[0], point[1]]);
	}
	this.map[point[0]][point[1]] = occupied;
	element.attr({fill:colour, "fill-opacity": opacity,});
};

ocargo.MapEditor.prototype.createGrid = function(paper) {
    for (var i = 0; i < GRID_WIDTH; i++) {
        for (var j = 0; j < GRID_HEIGHT; j++) {
            var x = i * GRID_SPACE_WIDTH;
            var y = j * GRID_SPACE_HEIGHT;
            var segment = paper.rect(x, y, GRID_SPACE_WIDTH, GRID_SPACE_HEIGHT);
			segment.attr({stroke: '#777', fill:"white", "fill-opacity": 0,});

            segment.node.onclick = function () {
                var this_rect = segment;
                return function () {
                	var getBBox = this_rect.getBBox();
                	var point = [getBBox.x / 100, getBBox.y / 100];
                	if(ocargo.mapEditor.map[point[0]][point[1]] == undefined) {
	                    ocargo.mapEditor.markPossible(point);
	                    ocargo.mapEditor.mark(point, "grey", 1, true);
	                }
                }
            }();
            this.grid[i][j] = segment;
            this.map[i][j] = false;
        }
    }
    this.current = [0,4];
    this.mark(this.current, "grey", 1, true);
    this.markPossible(this.current);
};

// #A0A0A0 for the suggestion.
ocargo.MapEditor.prototype.trackCreation = function() {

	$('#up').click(function() {
		var point = ocargo.mapEditor.current.slice(0);
	 	point[1] -= 1;
		point = handle(point);
	});

	$('#down').click(function() {	
		var point = ocargo.mapEditor.current.slice(0);
		point[1] += 1;
		point = handle(point);
	});

	$('#left').click(function() {
		var point = ocargo.mapEditor.current.slice(0);
		point[0] -= 1;
		point = handle(point);
	});

	$('#right').click(function() {
		var point = ocargo.mapEditor.current.slice(0);
		point[0] += 1;
		point = handle(point);
	});


	function handle(point) {

		if (!isOutOfBounds(point) && isFree(point, ocargo.mapEditor.map)) {
			ocargo.mapEditor.markPossible(point);
			ocargo.mapEditor.mark(point, "grey", 1, true);
			ocargo.mapEditor.current = point;
		}
	}
};

ocargo.MapEditor.prototype.generateNodes = function(points) {
	var previousNode = null;
	var nodes = [];
	for (var i = 0; i < points.length; i++) {
	      var p = points[i];
	      var coordinate = new ocargo.Coordinate(p[0], GRID_HEIGHT -1 -p[1]);
	      var node = new ocargo.Node(coordinate);
	      if (previousNode) {
	          node.addConnectedNodeWithBacklink(previousNode);
	      }
	      previousNode = node;
	      nodes.push(node);
	}
	return nodes;
}

$(function() {
	paper.clear();
	ocargo.ui = new ocargo.SimpleUi();
	ocargo.mapEditor = new ocargo.MapEditor();
	ocargo.mapEditor.createGrid(paper);
	ocargo.mapEditor.trackCreation();
});

$('#undo').click(function() {
	if(ocargo.mapEditor.submittedPoints.length > 1) {
		var toChange = ocargo.mapEditor.submittedPoints.pop();
		ocargo.mapEditor.current 
			= ocargo.mapEditor.submittedPoints[ocargo.mapEditor.submittedPoints.length-1];
		ocargo.mapEditor.mark(toChange, "white", 0, false);
		ocargo.mapEditor.markPossible(ocargo.mapEditor.current, "white", 0, false);

	}
});

$('#clear').click(function() {
	paper.clear();
	ocargo.mapEditor = new ocargo.MapEditor();
	ocargo.mapEditor.createGrid(paper)
});

$('#createFromSelect').click(function() {
	//console.debug(ocargo.mapEditor.submittedPoints);
	ocargo.ui = new ocargo.SimpleUi();
	var nodes = ocargo.mapEditor.generateNodes(ocargo.mapEditor.submittedPoints);  
	var map = new ocargo.Map(nodes, ocargo.ui);
});

