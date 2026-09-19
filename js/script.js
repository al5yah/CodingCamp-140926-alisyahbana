let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');

document.addEventListener('DOMContentLoaded', () => {
  renderUI();
  initChart();
  updateChart();
});

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!name || isNaN(amount) || amount <= 0 || !category) {
      alert('Mohon isi semua field dengan benar!');
      return;
    }

    const transaction = {
      id: Date.now(),
      name: name,
      amount: amount,
      category: category
    };

    transactions.push(transaction);
    saveToLocalStorage();
    renderUI();
    updateChart();

    form.reset();
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  renderUI();
  updateChart();
}

function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function renderUI() {
  if (!transactionList) return;
  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    transactionList.innerHTML = '<li style="text-align:center; color:#8d99ae; padding:15px;">Belum ada transaksi.</li>';
  } else {
    transactions.slice().reverse().forEach(t => {
      const li = document.createElement('li');
      li.className = 'transaction-item';
      li.innerHTML = `
        <div class="item-info">
          <h4>${t.name}</h4>
          <div class="item-amount">$${t.amount.toFixed(2)}</div>
          <span class="category-badge">${t.category}</span>
        </div>
        <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
      `;
      transactionList.appendChild(li);
    });
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  if (totalBalanceEl) {
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
  }
}

function initChart() {
  const chartEl = document.getElementById('expense-chart');
  if (!chartEl) return;
  
  const ctx = chartEl.getContext('2d');
  
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Food', 'Transport', 'Fun'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#2ecc71', '#3498db', '#e67e22']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function updateChart() {
  if (!myChart) return;

  const categoryTotals = { Food: 0, Transport: 0, Fun: 0 };

  transactions.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.amount;
    }
  });

  myChart.data.datasets[0].data = [
    categoryTotals.Food,
    categoryTotals.Transport,
    categoryTotals.Fun
  ];

  myChart.update();
}