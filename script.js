
const result = document.getElementById("result");
const expression = document.getElementById("expression");
const buttons = document.querySelector(".buttons");

let currentExpression = "";
let justCalculated = false;

// Safe arithmetic expression evaluator
function calculate(expressionText) {

    const tokens = expressionText.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/%]/g
    );

    if (!tokens || tokens.join("") !== expressionText.replace(/\s/g, "")) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseExpression() {
        let value = parseTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            const operator = tokens[position++];

            const next = parseTerm();

            value = operator === "+"
                ? value + next
                : value - next;
        }

        return value;
    }

    function parseTerm() {
        let value = parseNumber();

        while (
            ["*", "/", "%"].includes(tokens[position])
        ) {
            const operator = tokens[position++];
            const next = parseNumber();

            if (operator === "*") {
                value *= next;
            } else if (operator === "/") {
                if (next === 0) {
                    throw new Error("Cannot divide by zero");
                }
                value /= next;
            } else {
                if (next === 0) {
                    throw new Error("Cannot divide by zero");
                }
                value %= next;
            }
        }

        return value;
    }

    function parseNumber() {
        if (tokens[position] === "-") {
            position++;
            return -parseNumber();
        }

        if (tokens[position] === "+") {
            position++;
            return parseNumber();
        }

        const token = tokens[position++];

        if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid number");
        }

        return Number(token);
    }

    const answer = parseExpression();

    if (position !== tokens.length || !Number.isFinite(answer)) {
        throw new Error("Invalid calculation");
    }

    return Number(answer.toPrecision(12));
}

// Update display and preview
function updateDisplay() {

    expression.textContent = currentExpression;

    if (!currentExpression) {
        result.value = "0";
        return;
    }

    try {
        result.value = calculate(currentExpression);
    } catch {
        result.value = " ";
    }
}

// Add number or operator
function addValue(value) {

    const operators = ["+", "-", "*", "/", "%"];

    if (justCalculated) {
        if (!operators.includes(value)) {
            currentExpression = "";
        }
        justCalculated = false;
    }

    if (operators.includes(value)) {
        if (!currentExpression && value !== "-") return;

        const last = currentExpression.slice(-1);

        if (operators.includes(last)) {
            if (value === "-" && last !== "-") {
                currentExpression += value;
            } else {
                currentExpression =
                    currentExpression.slice(0, -1) + value;
            }
        } else {
            currentExpression += value;
        }

    } else if (value === ".") {

        const parts = currentExpression.split(/[+\-*/%]/);
        const lastNumber = parts[parts.length - 1];

        if (lastNumber.includes(".")) return;

        currentExpression += lastNumber === "" ? "0." : ".";

    } else {
        currentExpression += value;
    }

    updateDisplay();
}

// Calculate final result
function showResult() {
    if (!currentExpression) return;

    try {
        const answer = calculate(currentExpression);

        expression.textContent = currentExpression + " =";
        result.value = answer;

        currentExpression = String(answer);
        justCalculated = true;

    } catch (error) {
        result.value = error.message;
        currentExpression = "";
        justCalculated = false;
    }
}

// Clear everything
function clearCalculator() {
    currentExpression = "";
    justCalculated = false;
    updateDisplay();
}

// Delete last character
function deleteLast() {
    if (justCalculated) {
        clearCalculator();
        return;
    }

    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

// Button click events
buttons.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        clearCalculator();
    } else if (action === "delete") {
        deleteLast();
    } else if (action === "calculate") {
        showResult();
    } else if (value !== undefined) {
        addValue(value);
    }
});

// Keyboard support
document.addEventListener("keydown", (event) => {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        showResult();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});
