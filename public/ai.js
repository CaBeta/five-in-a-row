var aiColor = "white";

var grid = new Array(15);
for (var i = 0; i < grid.length; i++) {
	grid[i] = new Array(15);
}

var tree = new Object();
tree.root = null;
tree.node = new Array();
//UCB
var C = 1.4;

//构造节点
function Node(x,y,parent,state) {
	this.x = x;		
	this.y = y;
	this.estimate = 0;
	this.parent = parent;
	this.child = new Array();
	this.state = state;
	this.n = 1;
}
Node.prototype.add = function(childNode) {
	child.parent = this;
	this.child.push(childNode);
};

//确定搜索范围 返回候选区域
function searchCandidate(grid) {
	for (var x = 0; x < grid.length; x++) {
		for (var y = 0; y < grid[x].length; y++) {
			if (grid[x][y] == 1) {
				//防止数组越界 没有考虑贴边的情况
				//可能需要修改
				if (x != 0 && y != 0 && x != 14 && y != 14) {
					for (var i = 0; i < SEARCH.length; i++) {
						if (grid[x+SEARCH[i][0]][y+SEARCH[y][1]] != 1) {
							grid[x+SEARCH[i][0]][y+SEARCH[y][1]] = 1;
						}
					}
				}
			}
		}
	}
	//返回的是候选区域 candidate
	return grid;
}

//返回当前需要扩建的节点
function selection() {
	//初始节点是现在的状态 即对手下了一步 需要解的状态
	//如果这时有父节点还有没扩建的动作 随机选择其中一个动作拓展
	//如果全都扩建了 计算UCB选择
	var nodeList = checkNode();
	var s = 0;
	for (var x = 0; x < nodeList.length; i++) {
		for (var y = 0; y < nodeList[x].length; i++) {
			if(nodeList[x][y] == 1){
				s = 1;
			}
		}
	}
	if (s == 1) {
		return detectedNode;
	} else {
		//从root下一层开始计算UCB
		var node = tree.root;
		var color = aiColor;
		while (node.child) {
			node = findMaxUCB(node.child,color);
			if (color == "white") {
				color = "black";
			} else {
				color = "white";
			}
		}
		detectedNode = node;
		return node;
	}


}
//检测该节点是否存在未拓展的动作
//返回所有未拓展的动作
function checkNode() {
	var unexpandNode = new Array(15);
	for (var i = 0; i < unexpandNode.length; i++) {
	unexpandNode[i] = new Array(15);
	}
	for (var x = 0; x < grid.length; x++) {
		for (var y = 0; y < grid[x].length; y++) {
			if (detectedNodeCandidate[x][y] == 1) {
				unexpandNode[x][y] = 1;
			}
		}
	}
	return unexpandNode;
}

//从候选中随机选取一个节点
function randomSelect(candidateNode,n) {
	for (var i = 0; i < 15*15; i++) {
		var x = Math.round(15 * Math.random());
		var y = Math.round(15 * Math.random());
		if (candidate[x][y] == 1) {
			//这就是我们选中需要拓展的节点

			return [x,y];
		}
	}
}

function abstractAddChessman(x,y) {
	if (virtualChessborad[x][y] != 1) {
		virtualChessborad[x][y] = 1;
	}else{
		Console.log("abstractAddChessman exception");
	}
}

function createChild(grid) {
	selection(searchMove(grid));
}

function calculateUCB(estimate,n_parent,n_child,color) {
	if (color == aiColor) {
		var score = estimate + C * Math.sqrt(Math.log(n_parent)/n_child);
	} else {
		var score = (1-estimate) + C * Math.sqrt(Math.log(n_parent)/n_child);
	}
	return score;
}
function findMaxUCB(nodeList,color) {
	var max = 0;
	var maxNode = null;
	for (var i = 0; i < nodeList.length; i++) {
		var estimate = nodeList[i].estimate;
		var n_parent = nodeList[i].parent.n;
		var n_child = nodeList[i].n;
		var ucb = calculateUCB(estimate,n_parent,n_child,color);
		if (ucb > max) {
			max = ucb;
			maxNode = nodeList[i];
		}
	}
	return maxNode;
}
function expansion() {
	var location = randomSelect(detectedNodeCandidate);
	abstractAddChessman(location[0],location[1]);
}

function simulation(argument) {
	// body...
}

function backUp(argument) {
	// body...
}

//Mente Carlo tree search
function MCTS() {
	//构建虚拟搜索棋盘 同步当前棋盘
	virtualChessborad = grid;
	candidate = searchCandidate(virtualChessborad);

	detectedNode = selection();
}

var detectedNode = tree.root;
detectedNode.state = grid;
var detectedNodeCandidate = searchCandidate(detectedNode.state);
while(i<10000){
	detectedNodeCandidate = searchCandidate(detectedNode.state);
	MCTS();//每次返回的是拓展的节点，和该节点模拟后的胜负
	i++;
}
//之后遍历root的child看哪个胜率高
