var c = document.getElementById("chessborad");

var EDGE = 14*30; // 棋盘边长
var MARGIN = 15; // 棋盘边缘间隙
var turn = "black"; // 轮到黑棋或白棋
var win = 0; // 是否胜利信息
var gridBlack = new Array(15); // 黑棋网格
var gridWhite = new Array(15); // 白棋网格
for (var i = 0; i < gridWhite.length; i++) {
	gridWhite[i] = new Array(15);
	gridBlack[i] = new Array(15);
};

// 定义八个搜索方向
var SEARCH = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];

// 初始化棋盘
function initChessborad() {
	var borad = c.getContext("2d");
	borad.fillStyle = "#ffc369";
	borad.fillRect(15,15,EDGE,EDGE);//x,y,width,height

	var line=c.getContext("2d");
		for (var i = 0; i < 15; i++) {
		line.moveTo(30*i+15,15);//x,y
		line.lineTo(30*i+15,EDGE+15);
		line.stroke();

		line.moveTo(15,30*i+15);//x,y
		line.lineTo(EDGE+15,30*i+15);
		line.stroke();
	}
}

//在画布上添加棋子
function drawChessman(x,y,color) {
	var gradient = c.getContext("2d");
	gradient.beginPath();
	gradient.arc(x,y,13.5,0,2*Math.PI);//x,y,r,起始，结束
	if (color == "white") {
		var my_gradient=gradient.createLinearGradient(x-6,y-6,x+60,y+60);
		my_gradient.addColorStop(0,"white");
		my_gradient.addColorStop(1,"black");
	}else{
		var my_gradient=gradient.createLinearGradient(x+20,y+20,x-60,y-60);
		my_gradient.addColorStop(0,"black");
		my_gradient.addColorStop(1,"white");
	}
	gradient.fillStyle=my_gradient;
	gradient.fill();
	gradient.closePath();
}

//在网格中添加棋子
function addChessman(x,y) {
	if (gridWhite[x][y] != 1 && gridBlack[x][y] != 1) {
		if (turn == "white") {
			gridWhite[x][y] = 1;
		} else {
			gridBlack[x][y] = 1;
		}
		drawChessman(x * 30 + MARGIN,y * 30 + MARGIN,turn);
		
		toWin(x,y);
		changeTurn();

	}
}

//交换回合
function changeTurn() {
	if (turn == "white") {
		turn = "black";
	} else {
		turn = "white";
	}
}

//清空画布
function clearCanvas()
{
    var c=document.getElementById("chessborad");
    c.height=c.height;  //canves的宽高改变时会清空画布
}

//打印底部信息
function showMessage(msg) {
	var show = document.getElementsByClassName('bottom')[0];
	show.innerHTML = "" + msg;
}

//检查玩家落子的位置是否合适
function checkMove(x,y) {
	var x_error = (x - MARGIN) % 30;
	var y_error = (y - MARGIN) % 30;
	if ((x_error<8||x_error>22)&& (y_error<8||y_error>22)&& win == 0) {
		// TODO:这里不知道发生了什么 可能不需要Math.round()
		if (x_error<8) {
			x = Math.round((x - x_error)/30)-1;
		} else {
			x = Math.round((x - x_error)/30);
		}
		if (y_error<8) {
			y = Math.round((y - y_error)/30)-1;
		} else {
			y = Math.round((y - y_error)/30);
		}
		addChessman(x,y);
	//	console.log(x + "," + y);
	}
}

//寻找一条线上可能连成的五子
function searchLine (x,y,grid) {

	for (var i = 0; i < SEARCH.length; i++) {
		//定义全局变量 前向搜索总和 反向搜索总和
		f_sum = 0;
 	 	b_sum = 0;
		detect(x,y,grid,SEARCH[i]);
		r_detect(x,y,grid,SEARCH[i]);
		var sum = f_sum+b_sum+1
		// console.log("sum:",sum);
		if (sum == 5) {
			win = 1;
			return;
		}
	}
}

//检查是否连成五子
function detect (x,y,grid,search) {
	if (grid[x+search[0]][y+search[1]]) {
		f_sum++;
		//console.log("forward",f_sum);
		if (f_sum == 4) {
			win = 1;
			return;
		}
		detect(x+search[0],y+search[1],grid,search);
	}else {
		//console.log("f-sum",f_sum);
		return;
	}
}

//反向检查是否连成五子
function r_detect (x,y,grid,search) {
	if (grid[x-search[0]][y-search[1]]) {
		b_sum++;
		if (b_sum == 4) {
			win = 1;
			return;
		}
		r_detect(x-search[0],y-search[1],grid,search);
	}else {
		//console.log("b-sum",b_sum);
		return;
	}

}

//检查是否有一方胜利 胜利则结束游戏
function toWin (x,y) {
	if (turn == "white") {
		searchLine(x,y,gridWhite);
		if(win == 1){
			showMessage("白棋获胜!")
			gameOver();
			return;
		}
	} else{
		searchLine(x,y,gridBlack);
		if (win == 1) {
			showMessage("黑棋获胜!")
			gameOver();
			return;
		}
	}
}

function gameOver() {

}

initChessborad();
c.onclick = function(e) {
	var x = e.clientX;
	var y = e.clientY;
	var width = document.body.clientWidth;
	//console.log(x + "," + y);
	var xInborad = x-(width - EDGE - 30)/2-1;
	var yInborad = y-53;
	checkMove(xInborad,yInborad);

}
// 用户登录 等待对手
// 有第二个用户登录 游戏开始
// 确定先行 
// 玩家点击 检查落子 发送落子信息 检查胜负
// 显示棋子 交换出手 -> 回到上一步
// 得到胜负游戏结束