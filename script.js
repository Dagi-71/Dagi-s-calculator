(function() {
  const previousOperandEl = document.getElementById('previousOperand');
  const currentOperandEl = document.getElementById('currentOperand');

  let current = '0';
  let previous = '';
  let operation = null;
  let resetCurrentOnNext = false;

  function formatDisplay(value) {
    if (value === '') return '';
    let num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    let str = num.toString();
    if (str.includes('.')) {
      let parts = str.split('.');
      if (parts[1].length > 8) {
        str = num.toFixed(8).replace(/\.?0+$/, '');
      }
    }
    if (str.endsWith('.0')) str = str.slice(0, -2);
    if (str === '-0') str = '0';
    return str;
  }

  function updateDisplay() {
    let displayValue = current === '' ? '0' : current;
    let formattedCurr = formatDisplay(displayValue);
    currentOperandEl.textContent = formattedCurr;
    
    if (previous !== '' && operation !== null) {
      let opSymbol = '';
      if (operation === '+') opSymbol = '+';
      else if (operation === '-') opSymbol = '−';
      else if (operation === '*') opSymbol = '×';
      else if (operation === '/') opSymbol = '÷';
      previousOperandEl.textContent = `${formatDisplay(previous)} ${opSymbol}`;
    } else {
      previousOperandEl.textContent = previous ? formatDisplay(previous) : '';
    }
    
    if (previous === '' && operation === null) {
      previousOperandEl.textContent = '';
    }
  }

  function computeResult() {
    if (previous === '' || operation === null || current === '') return null;
    
    const prevNum = parseFloat(previous);
    const currNum = parseFloat(current);
    
    if (isNaN(prevNum) || isNaN(currNum)) return null;
    
    let result;
    switch (operation) {
      case '+':
        result = prevNum + currNum;
        break;
      case '-':
        result = prevNum - currNum;
        break;
      case '*':
        result = prevNum * currNum;
        break;
      case '/':
        if (currNum === 0) return 'error';
        result = prevNum / currNum;
        break;
      default:
        return null;
    }
    
    if (Math.abs(result) < 1e-12 && result !== 0) result = 0;
    result = parseFloat(result.toFixed(10));
    
    return result.toString();
  }

  function setOperation(op) {
    if (operation !== null && previous !== '' && !resetCurrentOnNext) {
      const evalResult = computeResult();
      if (evalResult === 'error') {
        clearAll();
        currentOperandEl.textContent = 'Error';
        current = '0';
        previous = '';
        operation = null;
        resetCurrentOnNext = false;
        updateDisplay();
        return;
      }
      if (evalResult !== null) {
        current = evalResult;
        previous = '';
        operation = null;
        resetCurrentOnNext = false;
      }
    }
    
    if (current !== '') {
      previous = current;
      operation = op;
      current = '';
      resetCurrentOnNext = false;
      updateDisplay();
    }
  }

  function appendNumber(numStr) {
    if (resetCurrentOnNext) {
      current = '';
      resetCurrentOnNext = false;
    }
    
    if (numStr === '.') {
      if (current.includes('.')) return;
      if (current === '') {
        current = '0.';
      } else {
        current = current + '.';
      }
    } 
    else {
      if (current === '0' && !resetCurrentOnNext) {
        current = numStr;
      } else {
        current = current + numStr;
      }
    }
    
    if (current.length > 18) current = current.slice(0, 18);
    updateDisplay();
  }

  function clearAll() {
    current = '0';
    previous = '';
    operation = null;
    resetCurrentOnNext = false;
    updateDisplay();
  }

  function toggleSign() {
    if (current === '' || current === '0') return;
    let num = parseFloat(current);
    if (isNaN(num)) return;
    num = -num;
    current = num.toString();
    if (current === '-0') current = '0';
    updateDisplay();
  }

  function applyPercent() {
    if (current === '' || current === '0') return;
    let num = parseFloat(current);
    if (isNaN(num)) return;
    num = num / 100;
    current = num.toString();
    if (current.endsWith('.0')) current = current.slice(0, -2);
    updateDisplay();
  }

  function computeEquals() {
    if (previous === '' || operation === null) {
      resetCurrentOnNext = false;
      updateDisplay();
      return;
    }
    if (current === '' && previous !== '') {
      return;
    }
    
    const result = computeResult();
    if (result === 'error') {
      clearAll();
      currentOperandEl.textContent = 'Error';
      current = '0';
      previous = '';
      operation = null;
      updateDisplay();
      resetCurrentOnNext = true;
      return;
    }
    
    if (result !== null) {
      current = result;
      previous = '';
      operation = null;
      resetCurrentOnNext = true;
      updateDisplay();
    } else {
      resetCurrentOnNext = true;
      updateDisplay();
    }
  }

  const buttonsGrid = document.querySelector('.buttons-grid');
  if (buttonsGrid) {
    buttonsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      
      if (btn.classList.contains('btn-number')) {
        const numVal = btn.getAttribute('data-num');
        if (numVal !== null) {
          appendNumber(numVal);
        }
        return;
      }
      
      if (btn.classList.contains('btn-operator')) {
        const op = btn.getAttribute('data-op');
        if (op === '+') setOperation('+');
        else if (op === '-') setOperation('-');
        else if (op === '*') setOperation('*');
        else if (op === '/') setOperation('/');
        return;
      }
      
      if (btn.classList.contains('btn-clear')) {
        clearAll();
        return;
      }
      
      if (btn.classList.contains('btn-sign')) {
        toggleSign();
        return;
      }
      
      if (btn.classList.contains('btn-percent')) {
        applyPercent();
        return;
      }
      
      if (btn.classList.contains('btn-equals')) {
        computeEquals();
        return;
      }
    });
  }

  function handleKeyboard(e) {
    const key = e.key;
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      appendNumber(key);
    } else if (key === '.') {
      e.preventDefault();
      appendNumber('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      e.preventDefault();
      let opMap = { '+': '+', '-': '-', '*': '*', '/': '/' };
      setOperation(opMap[key]);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      computeEquals();
    } else if (key === 'Escape') {
      e.preventDefault();
      clearAll();
    } else if (key === 'Backspace') {
      e.preventDefault();
      if (resetCurrentOnNext) {
        if (current !== '0') {
          resetCurrentOnNext = false;
          current = '0';
        } else {
          clearAll();
        }
      } else {
        if (current.length > 1 && current !== '0') {
          current = current.slice(0, -1);
          if (current === '' || current === '-') current = '0';
        } else {
          current = '0';
        }
      }
      updateDisplay();
    } else if (key === '%') {
      e.preventDefault();
      applyPercent();
    }
  }
  
  window.addEventListener('keydown', handleKeyboard);
  
  updateDisplay();
})();