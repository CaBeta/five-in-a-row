$(function () {
    //消失时间
    var FADE_TIME = 150; // ms
    //typing时间
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    //输入用户名
    var $usernameInput = $('.usernameInput'); // Input for username
    //显示的消息
    var $messages = $('.messages'); // Messages area
    //输入的消息
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $gamePage = $('.game.page'); // The chatroom page

    var $Player = $('.top');

    // Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    var socket = io();
    // Game
    var $chessBorad = $("#chessborad")[0]; // 获取第一个元素

    var EDGE = 14 * 30; // 棋盘边长
    var MARGIN = 15; // 棋盘边缘间隙
    var turn = "black"; // 轮到黑棋或白棋
    var playerColor = "black";
    var win = 0; // 是否胜利信息
    var gridBlack = new Array(15); // 黑棋网格
    var gridWhite = new Array(15); // 白棋网格
    for (var i = 0; i < gridWhite.length; i++) {
        gridWhite[i] = new Array(15);
        gridBlack[i] = new Array(15);
    };

    // 定义八个搜索方向
    var SEARCH = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

    // 初始化棋盘
    function initChessborad() {
        var borad = $chessBorad.getContext("2d");
        borad.fillStyle = "#ffc369";
        borad.fillRect(15, 15, EDGE, EDGE); // x,y,width,height

        var line = $chessBorad.getContext("2d");
        for (var i = 0; i < 15; i++) {
            line.moveTo(30 * i + 15, 15);//x,y
            line.lineTo(30 * i + 15, EDGE + 15);
            line.stroke();

            line.moveTo(15, 30 * i + 15);//x,y
            line.lineTo(EDGE + 15, 30 * i + 15);
            line.stroke();
        }
    }

    // 在画布上添加棋子
    function drawChessman(x, y, color) {
        var gradient = $chessBorad.getContext("2d");
        gradient.beginPath();
        gradient.arc(x, y, 13.5, 0, 2 * Math.PI); // x,y,r,起始，结束
        if (color == "white") {
            var my_gradient = gradient.createLinearGradient(x - 6, y - 6, x + 60, y + 60);
            my_gradient.addColorStop(0, "white");
            my_gradient.addColorStop(1, "black");
        } else {
            var my_gradient = gradient.createLinearGradient(x + 20, y + 20, x - 60, y - 60);
            my_gradient.addColorStop(0, "black");
            my_gradient.addColorStop(1, "white");
        }
        gradient.fillStyle = my_gradient;
        gradient.fill();
        gradient.closePath();
    }

    // 在网格中添加棋子
    function addChessman(x, y) {
        if (gridWhite[x][y] != 1 && gridBlack[x][y] != 1) {
            if (turn == "white") {
                gridWhite[x][y] = 1;
            } else {
                gridBlack[x][y] = 1;
            }
            drawChessman(x * 30 + MARGIN, y * 30 + MARGIN, turn);

            toWin(x, y);
            changeTurn();
            
        }
    }

    // 交换回合
    function changeTurn() {
        if (turn == "white") {
            turn = "black";
        } else {
            turn = "white";
        }
    }

    // 清空画布
    function clearCanvas() {
        $chessBorad.height = $chessBorad.height;  //canves的宽高改变时会清空画布
    }

    // 打印底部信息
    function showMessage(msg) {
        var show = document.getElementsByClassName('bottom')[0];
        show.innerHTML = "" + msg;
    }

    // 检查玩家落子的位置是否合适
    function checkMove(x, y) {
        var x_error = (x - MARGIN) % 30;
        var y_error = (y - MARGIN) % 30;
        if (turn == playerColor && (x_error < 8 || x_error > 22) && (y_error < 8 || y_error > 22) && win == 0) {
            // TODO:这里不知道发生了什么 可能不需要Math.round()
            if (x_error < 8) {
                x = Math.round((x - x_error) / 30) - 1;
            } else {
                x = Math.round((x - x_error) / 30);
            }
            if (y_error < 8) {
                y = Math.round((y - y_error) / 30) - 1;
            } else {
                y = Math.round((y - y_error) / 30);
            }
            addChessman(x, y);
            socket.emit("add chessman",{
                color:turn,
                x:x,
                y:y
            });
            //	console.log(x + "," + y);
        }
    }

    // 寻找一条线上可能连成的五子
    function searchLine(x, y, boradGrid) {
        for (var i = 0; i < SEARCH.length; i++) {
            //定义全局变量 前向搜索总和 反向搜索总和
            f_sum = 0;
            b_sum = 0;
            detect(x, y, boradGrid, SEARCH[i]);
            r_detect(x, y, boradGrid, SEARCH[i]);
            var sum = f_sum + b_sum + 1
            // console.log("sum:",sum);
            if (sum == 5) {
                win = 1;
                return;
            }
        }
    }

    // 检查是否连成五子
    function detect(x, y, boradGrid, search) {
        if (boradGrid[x + search[0]]==undefined) {
            return;
        }
        if (boradGrid[x + search[0]][y + search[1]]) {
            f_sum++;
            //console.log("forward",f_sum);
            if (f_sum == 4) {
                win = 1;
                return;
            }
            detect(x + search[0], y + search[1], boradGrid, search);
        } else {
            //console.log("f-sum",f_sum);
            return;
        }
    }

    // 反向检查是否连成五子
    function r_detect(x, y, boradGrid, search) {
        if (boradGrid[x - search[0]] == undefined) {
            return;
        }
        if (boradGrid[x - search[0]][y - search[1]]) {
            b_sum++;
            if (b_sum == 4) {
                win = 1;
                return;
            }
            r_detect(x - search[0], y - search[1], boradGrid, search);
        } else {
            //console.log("b-sum",b_sum);
            return;
        }

    }

    // 检查是否有一方胜利 胜利则结束游戏
    function toWin(x, y) {
        if (turn == "white") {
            searchLine(x, y, gridWhite);
            if (win == 1) {
                showMessage("白棋获胜!")
                gameOver();
                return;
            }
        } else {
            searchLine(x, y, gridBlack);
            if (win == 1) {
                showMessage("黑棋获胜!")
                gameOver();
                return;
            }
        }
    }

    function gameOver() {
    }

    $chessBorad.onclick = function (e) {
        var x = e.clientX;
        var y = e.clientY;
        var width = document.body.clientWidth;
        //console.log(x + "," + y);
        var xInborad = x - (width - EDGE - 30) / 2 - 1;
        var yInborad = y - 53;
        checkMove(xInborad, yInborad);
    }

    function addParticipantsMessage(data) {
        var message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    // 设置登录用户名登录
    function setUsername() {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $gamePage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username);
            // 顶部显示你的用户名
            var $el = $('<li>').addClass('username').text(username);
            $Player.append($el);
        }
    }

    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).html();
    }

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('input', function () {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
        $inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        connected = true;
        // Display the welcome message
        var message = "Welcome to Socket.IO Chat – ";
        // log(message, {
        //     prepend: true
        // });
        if (data.numUsers == 1) {
            playerColor = "black";
        }
        if (data.numUsers == 2) {
            initChessborad();
            playerColor = "white";
        }
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        console.log(data.username + ' joined');
        if (data.numUsers == 2) {
            initChessborad();
        }
    });
    socket.on('add and draw chessman',function(data){
        addChessman(data.x,data.y);
    })
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });

    socket.on('disconnect', function () {
        console.log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        console.log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', function () {
        console.log('attempt to reconnect has failed');
    });

});
