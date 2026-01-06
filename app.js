// ============================================
// TRADE DRAGON SNAKE TRADE - MAIN APP
// Owner: Olawale Abdul-Ganiyu Embade
// ============================================

// App State
const AppState = {
    user: null,
    isLoggedIn: false,
    currentSection: 'home',
    tradingData: {
        selectedPair: null,
        positionType: 'long',
        lotSize: 0.01,
        leverage: 10,
        isAIBotEnabled: false
    }
};

// Trading Pairs Data
const tradingPairs = [
    { id: 1, symbol: 'BTC/USDT', name: 'Bitcoin', price: 43250.00, change: 2.45, type: 'CRYPTO' },
    { id: 2, symbol: 'ETH/USDT', name: 'Ethereum', price: 2280.50, change: 1.82, type: 'CRYPTO' },
    { id: 3, symbol: 'BNB/USDT', name: 'Binance Coin', price: 312.45, change: -0.56, type: 'CRYPTO' },
    { id: 4, symbol: 'XRP/USDT', name: 'Ripple', price: 0.5234, change: 3.21, type: 'CRYPTO' },
    { id: 5, symbol: 'ADA/USDT', name: 'Cardano', price: 0.4521, change: -1.23, type: 'CRYPTO' },
    { id: 6, symbol: 'SOL/USDT', name: 'Solana', price: 98.76, change: 4.56, type: 'CRYPTO' },
    { id: 7, symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.0823, change: 8.92, type: 'CRYPTO' },
    { id: 8, symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0876, change: 0.12, type: 'FOREX' },
    { id: 9, symbol: 'GBP/USD', name: 'Pound/US Dollar', price: 1.2634, change: -0.23, type: 'FOREX' },
    { id: 10, symbol: 'USD/JPY', name: 'US Dollar/Yen', price: 149.82, change: 0.45, type: 'FOREX' },
    { id: 11, symbol: 'GOLD', name: 'Gold', price: 2034.50, change: 0.78, type: 'COMMODITY' },
    { id: 12, symbol: 'OIL', name: 'Crude Oil', price: 78.45, change: -1.34, type: 'COMMODITY' }
];

// Sample Positions
const positions = [
    { id: 1, pair: 'BTC/USDT', type: 'LONG', size: 0.5, entry: 42500, current: 43250, pnl: 350 },
    { id: 2, pair: 'ETH/USDT', type: 'SHORT', size: 2, entry: 2300, current: 2280, pnl: 40 }
];

// Sample Trades
const trades = [
    { date: '2024-01-15', pair: 'BTC/USDT', type: 'LONG', amount: 0.3, price: 42800, pnl: 135 },
    { date: '2024-01-14', pair: 'ETH/USDT', type: 'SHORT', amount: 1.5, price: 2310, pnl: 45 },
    { date: '2024-01-13', pair: 'XRP/USDT', type: 'LONG', amount: 500, price: 0.51, pnl: -6.5 }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🐉 Trade Dragon Snake Trade - Initializing...');
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);

    // Initialize components
    initializeNavigation();
    initializeTradingPairs();
    initializeFormElements();
    initializePositions();
    initializeTrades();
    
    // Set default trading pair
    if (tradingPairs.length > 0) {
        selectTradingPair(tradingPairs[0].id);
    }

    // Start price updates
    startPriceUpdates();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href');
            navigateTo(targetSection);
        });
    });
}

function navigateTo(sectionId) {
    // Update active section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        AppState.currentSection = sectionId.replace('#', '');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === sectionId) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Trading Pairs
function initializeTradingPairs() {
    const pairsList = document.getElementById('tradingPairsList');
    if (!pairsList) return;

    tradingPairs.forEach(pair => {
        const pairElement = document.createElement('div');
        pairElement.className = 'trading-pair';
        pairElement.dataset.pairId = pair.id;
        pairElement.innerHTML = `
            <div class="pair-info">
                <div class="pair-symbol">${pair.symbol}</div>
                <div class="pair-price">$${pair.price.toLocaleString()}</div>
            </div>
            <div class="pair-change ${pair.change >= 0 ? 'profit' : 'loss'}">
                ${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%
            </div>
        `;

        pairElement.addEventListener('click', () => selectTradingPair(pair.id));
        pairsList.appendChild(pairElement);
    });
}

function selectTradingPair(pairId) {
    const pair = tradingPairs.find(p => p.id === pairId);
    if (!pair) return;

    AppState.tradingData.selectedPair = pair;

    // Update UI
    document.querySelectorAll('.trading-pair').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.pairId == pairId) {
            el.classList.add('active');
        }
    });

    // Update chart header
    const chartTitle = document.getElementById('chartTitle');
    const currentPrice = document.getElementById('currentPrice');
    const priceChange = document.getElementById('priceChange');

    if (chartTitle) chartTitle.textContent = pair.symbol;
    if (currentPrice) currentPrice.textContent = `$${pair.price.toLocaleString()}`;
    if (priceChange) {
        priceChange.textContent = `${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%`;
        priceChange.className = `price-change ${pair.change >= 0 ? 'profit' : 'loss'}`;
    }

    // Update position summary
    updatePositionSummary();

    console.log(`Selected trading pair: ${pair.symbol}`);
}

// Form Elements
function initializeFormElements() {
    // Lot size
    const lotSizeInput = document.getElementById('lotSize');
    if (lotSizeInput) {
        lotSizeInput.addEventListener('input', function() {
            AppState.tradingData.lotSize = parseFloat(this.value) || 0.01;
            updatePositionSummary();
        });
    }

    // Leverage
    const leverageInput = document.getElementById('leverage');
    const leverageValue = document.getElementById('leverageValue');
    if (leverageInput && leverageValue) {
        leverageInput.addEventListener('input', function() {
            AppState.tradingData.leverage = parseInt(this.value);
            leverageValue.textContent = this.value;
            updatePositionSummary();
        });
    }

    // Stop loss and take profit
    const stopLossInput = document.getElementById('stopLoss');
    const takeProfitInput = document.getElementById('takeProfit');
    
    if (stopLossInput) {
        stopLossInput.addEventListener('input', updatePositionSummary);
    }
    if (takeProfitInput) {
        takeProfitInput.addEventListener('input', updatePositionSummary);
    }

    // Timeframe buttons
    const timeframeBtns = document.querySelectorAll('.timeframe-btn');
    timeframeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeframeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const timeframe = this.dataset.timeframe;
            console.log(`Timeframe changed to: ${timeframe}`);
            // Update chart timeframe here
        });
    });
}

function setLotSize(size) {
    const lotSizeInput = document.getElementById('lotSize');
    if (lotSizeInput) {
        lotSizeInput.value = size;
        AppState.tradingData.lotSize = size;
        updatePositionSummary();
    }
}

function setPositionType(type) {
    AppState.tradingData.positionType = type;
    
    const longBtn = document.getElementById('longBtn');
    const shortBtn = document.getElementById('shortBtn');
    const executeBtn = document.getElementById('executeTradeBtn');

    if (type === 'long') {
        longBtn.classList.add('active');
        shortBtn.classList.remove('active');
        if (executeBtn) {
            executeBtn.className = 'btn btn-trade btn-long';
            executeBtn.innerHTML = '🟢 Buy / Long';
        }
    } else {
        shortBtn.classList.add('active');
        longBtn.classList.remove('active');
        if (executeBtn) {
            executeBtn.className = 'btn btn-trade btn-short';
            executeBtn.innerHTML = '🔴 Sell / Short';
        }
    }
}

function updatePositionSummary() {
    const pair = AppState.tradingData.selectedPair;
    if (!pair) return;

    const lotSize = AppState.tradingData.lotSize;
    const leverage = AppState.tradingData.leverage;
    const price = pair.price;

    // Calculate values
    const positionValue = lotSize * price * leverage;
    const marginRequired = positionValue / leverage;
    const fees = positionValue * 0.0004;

    // Update UI
    const positionValueEl = document.getElementById('positionValue');
    const marginRequiredEl = document.getElementById('marginRequired');
    const feesEl = document.getElementById('fees');

    if (positionValueEl) positionValueEl.textContent = `$${positionValue.toFixed(2)}`;
    if (marginRequiredEl) marginRequiredEl.textContent = `$${marginRequired.toFixed(2)}`;
    if (feesEl) feesEl.textContent = `$${fees.toFixed(2)}`;
}

// AI Bot Toggle
function toggleAIBot() {
    const toggleBtn = document.getElementById('aiBotToggle');
    if (!toggleBtn) return;

    AppState.tradingData.isAIBotEnabled = !AppState.tradingData.isAIBotEnabled;
    toggleBtn.classList.toggle('active');

    const status = AppState.tradingData.isAIBotEnabled ? 'enabled' : 'disabled';
    console.log(`AI Trading Bot ${status}`);
    
    if (AppState.tradingData.isAIBotEnabled) {
        showToast('AI Trading Bot enabled', 'success');
    } else {
        showToast('AI Trading Bot disabled', 'info');
    }
}

// Execute Trade
function executeTrade() {
    if (!AppState.tradingData.selectedPair) {
        showToast('Please select a trading pair', 'error');
        return;
    }

    const pair = AppState.tradingData.selectedPair;
    const positionType = AppState.tradingData.positionType;
    const lotSize = AppState.tradingData.lotSize;
    const leverage = AppState.tradingData.leverage;

    console.log('Executing trade:', {
        pair: pair.symbol,
        type: positionType,
        size: lotSize,
        leverage: leverage,
        price: pair.price
    });

    // Simulate trade execution
    showToast(`${positionType === 'long' ? 'Buy' : 'Sell'} order executed successfully!`, 'success');

    // Add to positions (demo)
    const newPosition = {
        id: positions.length + 1,
        pair: pair.symbol,
        type: positionType.toUpperCase(),
        size: lotSize,
        entry: pair.price,
        current: pair.price,
        pnl: 0
    };
    positions.unshift(newPosition);
    renderPositions();
}

// Positions
function initializePositions() {
    renderPositions();
}

function renderPositions() {
    const tbody = document.getElementById('positionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    positions.forEach(position => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${position.pair}</td>
            <td><span class="${position.type === 'LONG' ? 'profit' : 'loss'}">${position.type}</span></td>
            <td>${position.size}</td>
            <td>$${position.entry.toLocaleString()}</td>
            <td>$${position.current.toLocaleString()}</td>
            <td class="${position.pnl >= 0 ? 'profit' : 'loss'}">${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}</td>
            <td>
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="closePosition(${position.id})">
                    Close
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function closePosition(positionId) {
    const index = positions.findIndex(p => p.id === positionId);
    if (index !== -1) {
        const position = positions[index];
        positions.splice(index, 1);
        renderPositions();
        showToast(`Position closed: ${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}`, position.pnl >= 0 ? 'success' : 'error');
    }
}

// Trades
function initializeTrades() {
    const tbody = document.getElementById('tradesTableBody');
    if (!tbody) return;

    trades.forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.pair}</td>
            <td><span class="${trade.type === 'LONG' ? 'profit' : 'loss'}">${trade.type}</span></td>
            <td>${trade.amount}</td>
            <td>$${trade.price.toLocaleString()}</td>
            <td class="${trade.pnl >= 0 ? 'profit' : 'loss'}">${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Price Updates
function startPriceUpdates() {
    setInterval(() => {
        updatePrices();
    }, 3000); // Update every 3 seconds
}

function updatePrices() {
    tradingPairs.forEach(pair => {
        // Simulate price movement
        const change = (Math.random() - 0.5) * 0.5; // Small random change
        pair.price = pair.price * (1 + change / 100);
        pair.change = pair.change + (Math.random() - 0.5) * 0.1;
    });

    // Update UI
    updateTradingPairsUI();
    updateCurrentPriceUI();
    updatePositionsUI();
}

function updateTradingPairsUI() {
    const pairElements = document.querySelectorAll('.trading-pair');
    pairElements.forEach(el => {
        const pairId = parseInt(el.dataset.pairId);
        const pair = tradingPairs.find(p => p.id === pairId);
        if (pair) {
            const priceEl = el.querySelector('.pair-price');
            const changeEl = el.querySelector('.pair-change');
            if (priceEl) priceEl.textContent = `$${pair.price.toLocaleString()}`;
            if (changeEl) {
                changeEl.textContent = `${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%`;
                changeEl.className = `pair-change ${pair.change >= 0 ? 'profit' : 'loss'}`;
            }
        }
    });
}

function updateCurrentPriceUI() {
    const pair = AppState.tradingData.selectedPair;
    if (!pair) return;

    const currentPrice = document.getElementById('currentPrice');
    const priceChange = document.getElementById('priceChange');

    if (currentPrice) currentPrice.textContent = `$${pair.price.toLocaleString()}`;
    if (priceChange) {
        priceChange.textContent = `${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%`;
        priceChange.className = `price-change ${pair.change >= 0 ? 'profit' : 'loss'}`;
    }
}

function updatePositionsUI() {
    positions.forEach(position => {
        const pair = tradingPairs.find(p => p.symbol === position.pair);
        if (pair) {
            position.current = pair.price;
            if (position.type === 'LONG') {
                position.pnl = (pair.price - position.entry) * position.size;
            } else {
                position.pnl = (position.entry - pair.price) * position.size;
            }
        }
    });
    renderPositions();
}

// Modals
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active');
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.add('active');
}

function showDepositModal() {
    showToast('Deposit feature coming soon!', 'info');
}

function showWithdrawModal() {
    showToast('Withdrawal feature coming soon!', 'info');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt...');
    showToast('Login successful!', 'success');
    closeModal('loginModal');
    AppState.isLoggedIn = true;
    navigateTo('#dashboard');
}

function handleRegister(event) {
    event.preventDefault();
    console.log('Registration attempt...');
    showToast('Account created successfully!', 'success');
    closeModal('registerModal');
    AppState.isLoggedIn = true;
    navigateTo('#dashboard');
}

function showDemo() {
    showToast('Demo mode activated!', 'info');
    navigateTo('#trading');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
            }
            .toast-success {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            }
            .toast-error {
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            }
            .toast-info {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Quick trade shortcuts (when in trading section)
    if (AppState.currentSection === 'trading') {
        if (e.key === 'b' || e.key === 'B') {
            setPositionType('long');
        }
        if (e.key === 's' || e.key === 'S') {
            setPositionType('short');
        }
    }
});

// Export functions for global access
window.selectTradingPair = selectTradingPair;
window.setLotSize = setLotSize;
window.setPositionType = setPositionType;
window.toggleAIBot = toggleAIBot;
window.executeTrade = executeTrade;
window.closePosition = closePosition;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showDemo = showDemo;
window.navigateTo = navigateTo;

console.log('🐉 Trade Dragon Snake Trade - App Initialized!');
console.log('👤 Owner: Olawale Abdul-Ganiyu Embade');