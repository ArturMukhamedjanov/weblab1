let isXValid = false;
let isYValid = false;
let isRValid = false;

function updateLocalStorageX() {
    const X = document.getElementById("X").value;
    localStorage.setItem("XValue", X);
}

// Функция для обновления значения Y в localStorage
function updateLocalStorageY() {
    const Y = document.getElementById("Y").value;
    localStorage.setItem("YValue", Y);
}

// Функция для обновления выбранных значений R в localStorage
function updateLocalStorageR() {
    const selectedR = document.querySelectorAll(".inputR:checked");
    const selectedRValues = Array.from(selectedR).map(checkbox => checkbox.value);
    localStorage.setItem("RValues", JSON.stringify(selectedRValues));
}

window.addEventListener("load", async () => {
    let X = document.getElementById("X");
    let Y = document.getElementById("Y");
    let result = document.getElementById("result");
    let rCheckboxes = document.querySelectorAll(".inputR");
    const savedX = localStorage.getItem("XValue");
    if (savedX) {
        document.getElementById("X").value = savedX;
        let parsedX = parseFloat(X.value.replace(",", "."));
        const regex = /^-?\d*\.?\d+$/;
    
        if (isNaN(parsedX) || parsedX < -3 || parsedX > 5 || !regex.test(X.value.replace(",", "."))) {
            document.getElementById("XError").innerText = "Введите корректное значение X.";
            isXValid = false;
            updateCheckButtonColor();
        } else {
            document.getElementById("XError").innerText = "";
            isXValid = true;
            updateCheckButtonColor();
        }
    }

    // Загрузка значения Y
    const savedY = localStorage.getItem("YValue");
    if (savedY) {
        document.getElementById("Y").value = savedY;
        let parsedY = parseFloat(Y.value.replace(",", "."));
        const regex = /^-?\d*\.?\d+$/;
    
        if (isNaN(parsedY) || parsedY < -3 || parsedY > 5 || !regex.test(X.value.replace(",", "."))) {
            document.getElementById("YError").innerText = "Введите корректное значение Y.";
            isYValid = false;
            updateCheckButtonColor();
        } else {
            document.getElementById("YError").innerText = "";
            isYValid = true;
            updateCheckButtonColor();
        }
    }

    // Загрузка выбранных значений R
    const savedRValues = localStorage.getItem("RValues");
    if (savedRValues) {
        const parsedRValues = JSON.parse(savedRValues);
        const checkboxes = document.querySelectorAll(".inputR");
        checkboxes.forEach(checkbox => {
            if (parsedRValues.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
        validateR();
    }

    updateCheckButtonColor();
    let form = document.getElementById("form");
    rCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            validateR();
        });
    });



    X.addEventListener("input", () => {
        updateLocalStorageX()
        let xvalue = X.value.replace(",", ".");
        let parsedX = parseFloat(xvalue);
        const regex = /^-?\d*\.?\d+$/;
    
        if (isNaN(parsedX) || parsedX < -3 || parsedX > 5 || !regex.test(xvalue)) {
            document.getElementById("XError").innerText = "Введите корректное значение X.";
            isXValid = false;
            updateCheckButtonColor();
        } else {
            document.getElementById("XError").innerText = "";
            isXValid = true;
            updateCheckButtonColor();
        }
    });
    
    // Обработчик события input для поля Y
    Y.addEventListener("input", () => {
        updateLocalStorageY();
        let yvalue = Y.value.replace(",", ".")
        let parsedY = parseFloat(Y.value.replace(",", "."));
        const regex = /^-?\d*\.?\d+$/;
    
        if (isNaN(parsedY) || parsedY < -3 || parsedY > 5 || !regex.test(yvalue)) {
            document.getElementById("YError").innerText = "Введите корректное значение Y.";
            isYValid = false;
            updateCheckButtonColor();
        } else {
            document.getElementById("YError").innerText = "";
            isYValid = true;
            updateCheckButtonColor();
        }
    });
    

    // Load session results when the page loads
    await loadSessionResults();

    form.addEventListener("submit", async event => {
        
        event.preventDefault();
        let parsedX = parseFloat(X.value.replace(",", "."));
        let parsedY = parseFloat(Y.value.replace(",", "."));
        const regex = /^-?\d*\.?\d+$/
        if(isNaN(X.value.replace(",", "."))|| parsedX < -3 || parsedX > 5 || !regex.test((X.value.replace(",", ".")))){
            document.getElementById("XError").innerText = "Введите корректное значение X.";
            return
        }else{
            document.getElementById("XError").innerText = "";
        }
        if(isNaN(Y.value.replace(",", ".")) || parsedY < -3 || parsedY > 5 || !regex.test((Y.value.replace(",", ".")))){
            document.getElementById("YError").innerText = "Введите корректное значение Y.";
            return
        }else{
            document.getElementById("YError").innerText = ""
        }
        
        document.getElementById("XError").innerText = "";
        document.getElementById("YError").innerText = "";

        let selectedR = document.querySelectorAll(".inputR:checked");
        if (selectedR.length == 0) {
            document.getElementById("RError").innerText = "Выберите значение R.";
            return;
        } else {
            document.getElementById("RError").innerText = "";
        }
        
        try {
            for (let i = 0; i < selectedR.length; i++) {
                let selectedRValue = selectedR[i].value;
                let response = await api(parsedX, parsedY, selectedRValue);
                insertResult(result, response.X, response.Y, response.R, response.Inside, response.time, response.executetime);
            }
        } catch (error) {
            console.log(error);
            alert(error); 
        } 
    });

    async function loadSessionResults() {
        try {
            let response = await fetch('./api/api.php', {
                method: 'get',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let data = await response.json(); // Parse the response as JSON

            if (data.length > 0) {
                data.forEach(res => {
                    insertResult(result, res.X, res.Y, res.R, res.Inside, res.time, res.executetime);
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
});

async function api(X, Y, R) {
    let form = new FormData();
    form.append("X", X);
    form.append("Y", Y);
    form.append("R", R);
    try {
        let response = await fetch('./api/api.php', {
            method: 'post',
            body: form
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json(); // Parse the response as JSON
        console.log(data);
        return data; // Return the parsed JSON data
    } catch (error) {
        console.error(error);
        alert(error);
        throw error; // Rethrow the error to be caught by the calling code
    }
}
function insertResult(table, x, y, r, inside, time, executetime) {
    try{
        let row = document.createElement("tr");
        let xCell = document.createElement("td");
        let yCell = document.createElement("td");
        let rCell = document.createElement("td");
        let insideCell = document.createElement("td");
        let timeCell = document.createElement("td");
        let execCell = document.createElement("td");
        xCell.innerText = parseFloat(parseFloat(x));
        yCell.innerText = parseFloat(parseFloat(y));
        rCell.innerText = r;
        insideCell.innerText = inside;
        timeCell.innerText = new Date(time*1000).toLocaleTimeString();
        execCell.innerText = executetime.toFixed(8);
        row.append(xCell, yCell, rCell, insideCell, timeCell, execCell);
        if (table.rows.length > 1) {
            table.insertBefore(row, table.rows[1]);
        } else {
            table.appendChild(row);
        }
    }catch (error) {
        //console.error(error);
        
    }
    
}

function validateR() {
    let selectedR = document.querySelectorAll(".inputR:checked");
    updateLocalStorageR();
    if (selectedR.length == 0) {
        document.getElementById("RError").innerText = "Выберите значение R.";
        isRValid = false;
        updateCheckButtonColor();
    } else {
        document.getElementById("RError").innerText = "";
        isRValid = true
        updateCheckButtonColor();
    }
}


function updateCheckButtonColor() {
    if(isRValid && isXValid && isYValid){
        document.querySelector(".button").style.backgroundColor = "#3399ff";
        document.querySelector(".button").disabled = false;
    }else{
        document.querySelector(".button").style.backgroundColor = "red";
        document.querySelector(".button").disabled = true;
    }
}