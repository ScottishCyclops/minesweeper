(()=>{
    "use strict"
    const body = document.getElementsByTagName("body")[0];

    let menu, mineInfos, messages;

    const cells = [];
    const borderWidth = 1;
    const menuHeight = 100;
    let gameStarted = false;

    const hiddenColor = "#bdc3c7";
    const revealedColor = "#ecf0f1";
    const mineColor = "#c0392b";
    const flagColor = "#2980b9";
    const borderColor = "#7f8c8d";

    const easyColor = "#27ae60";
    const mediumColor = "#d35400";

    const cols = parseInt(prompt("x", "16"));
    const rows = parseInt(prompt("y", "16"));
    const numMines = parseInt(prompt("mines", "40"));
    let minesLeft = numMines;
    let realMinesLeft = numMines;

    const size = window.innerHeight - menuHeight <  window.innerWidth ? (window.innerHeight - menuHeight) / rows : window.innerWidth / cols;

    setup();

    function setup()
    {
        menu = document.createElement("div");
        menu.style.left = 0;
        menu.style.top = rows * size + "px";
        menu.style.width = cols * size + "px";
        menu.style.height = menuHeight + "px";
        menu.style.display = "flex";
        menu.style.alignItems = "center";
        menu.style.justifyContent = "center";
        body.appendChild(menu);

        mineInfos = document.createElement("div");
        mineInfos.style.width = "50%";
        mineInfos.style.textAlign = "center";
        menu.appendChild(mineInfos);

        messages = document.createElement("div");
        messages.style.width = "50%";
        messages.style.textAlign = "center";
        menu.appendChild(messages);

        if(cols < 2 || rows < 2)
        {
            messages.innerText = "Invalid dimensions";
        }
        else if(numMines >= cols * rows || numMines < 1)
        {
            messages.innerText = "Invalid mine amount";
        }
        else
        {
            let i = 0;
            for(let x = 0; x < cols; x++)
            {
                for(let y = 0; y < rows; y++)
                {
                    const cell = document.createElement("div");
                    cell.style.left = x * size + "px";
                    cell.style.top = y * size + "px";
                    cell.style.width = size + "px";
                    cell.style.height = size + "px";
                    cell.style.background = hiddenColor;

                    cell.style.borderColor = borderColor;
                    cell.style.borderStyle = "solid";
                    cell.style.borderWidth = borderWidth + "px";
                    cell.style.display = "flex";
                    cell.style.justifyContent = "center";
                    cell.style.alignItems = "center";
                    cell.style.fontWeight = "bold";
                    cell.index = i;
                    i++;
                    cell.revealed = false;
                    cell.flaged = false;
                    cell.mine = false;
                    
                    const span = document.createElement("span");
                    cell.appendChild(span);

                    cell.oncontextmenu = e =>
                    {
                        if(gameStarted)
                        {
                            if(!cell.revealed)
                            {
                                if(!cell.flaged)
                                {
                                    if(minesLeft > 0)
                                    {
                                        cell.flaged = true;
                                        cell.style.background = flagColor;
                                        minesLeft--;
                                        if(cell.mine)
                                        {
                                            realMinesLeft--;
                                        }
                                    }

                                    if(realMinesLeft === 0)
                                    {
                                        messages.innerText = "YOU WON!";
                                        endGame();
                                    }
                                }
                                else
                                {
                                    cell.flaged = false;
                                    cell.style.background = hiddenColor;
                                    minesLeft++;
                                    if(cell.mine)
                                    {
                                        realMinesLeft++;
                                    }
                                }

                                showMinesLeft();
                            }
                        }
                        return false;
                    }

                    cell.onclick = e =>
                    {
                        if(!cell.revealed)
                        {
                            if(!cell.flaged)
                            {
                                update(cell);
                            }
                        }
                    }
                    
                    body.appendChild(cell);
                    cells.push(cell);
                }
            }
        }
    }

    function showMinesLeft()
    { 
        mineInfos.innerText = "Mines left: " + minesLeft;
    }

    function revealCell(cell)
    {
        const atTop = cell.index % rows === 0;
        const atBottom = cell.index % rows === rows - 1;

        let minesAround = 0;

        cell.revealed = true;
        cell.style.background = revealedColor;

        const toReveal = [];

        cells.forEach(c =>
        {
            const isAbove = c.index === cell.index - 1 && !atTop;
            const isBelow = c.index === cell.index + 1 && !atBottom;
            const isRight = c.index === cell.index + rows;
            const isLeft  = c.index === cell.index - rows;
            const isAboveLeftCorner  = c.index === cell.index - rows - 1 && !atTop;
            const isAboveRightCorner = c.index === cell.index + rows - 1 && !atTop;
            const isBelowLeftCorner  = c.index === cell.index - rows + 1 && !atBottom;
            const isBelowRightCorner = c.index === cell.index + rows + 1 && !atBottom;

            if(isAbove || isBelow || isRight || isLeft || isAboveLeftCorner || isAboveRightCorner || isBelowLeftCorner || isBelowRightCorner)
            {
                if(c.mine)
                {
                    minesAround++;
                }
                else if(!c.revealed && !c.flaged)
                {
                    toReveal.push(c);
                }    
            }
        });

        if(minesAround === 0)
        {
            toReveal.forEach(c =>
            {
                revealCell(c);
            });
        }
        else
        {
            cell.firstElementChild.innerText = minesAround;
            cell.style.color = colorFromNumMines(minesAround);
        }
    }

    function placeMines(firstCell)
    {
        let cellsLeft = cells.slice();
        cellsLeft.splice(cellsLeft.indexOf(firstCell), 1);

        for(let i = 0; i < numMines; i++)
        {
            let mineIndex = Math.floor(Math.random() * cellsLeft.length);
            cells[cells.indexOf(cellsLeft[mineIndex])].mine = true;
            cellsLeft.splice(mineIndex, 1);
        }

        showMinesLeft();
    }

    function update(clickedCell)
    {
        if(!gameStarted)
        {
            placeMines(clickedCell);
            gameStarted = true;
        }

        if(clickedCell.mine)
        {
            messages.innerText = "GAME OVER!";
            endGame();
        }
        else
        {
            revealCell(clickedCell);
        }
    }

    function endGame()
    {
        cells.forEach(cell =>
        {
            cell.onclick = null;
            cell.oncontextmenu = null;
            if(cell.mine)
            {
                if(cell.flaged && cell.mine)
                {
                    cell.style.background = easyColor;
                }
                else if(cell.mine)
                {
                    cell.style.background = mineColor;
                }
            }
        });
    }

    function colorFromNumMines(mines)
    {
        if(mines <= 2)
        {
            return easyColor;
        }
        else if(mines <= 4)
        {
            return mediumColor;
        }
        else
        {
            return mineColor;
        }
    }
})();