// ============================================
// TRADE DRAGON SNAKE TRADE - TRADING LOGIC
// Owner: Olawale Abdul-Ganiyu Embade
// ============================================

// Trading Engine
class TradingEngine {
    constructor() {
        this.positions = [];
        this.orders = [];
        this.balance = 10000;
        this.tradingProfits = 0;
        this.tradeBalance = 0;
    }

    // Execute Market Order
    executeMarketOrder(params) {
        const {
            symbol,
            side, // 'BUY' or 'SELL'
            quantity,
            leverage = 1,
            stopLoss = null,
            takeProfit = null
        } = params;

        // Calculate position value
        const currentPrice = this.getCurrentPrice(symbol);
        const positionValue = quantity * currentPrice * leverage;
        const margin = positionValue / leverage;

        // Check margin
        if (margin > this.balance) {
            throw new Error('Insufficient balance');
        }

        // Create position
        const position = {
            id: this.generateId(),
            symbol,
            side,
            quantity,
            entryPrice: currentPrice,
            currentPrice,
            leverage,
            margin,
            stopLoss,
            takeProfit,
            pnl: 0,
            pnlPercent: 0,
            openTime: new Date(),
            status: 'OPEN'
        };

        // Update balance
        this.balance -= margin;
        this.positions.push(position);

        return position;
    }

    // Execute Limit Order
    executeLimitOrder(params) {
        const {
            symbol,
            side,
            quantity,
            price,
            leverage = 1,
            stopLoss = null,
            takeProfit = null
        } = params;

        const order = {
            id: this.generateId(),
            type: 'LIMIT',
            symbol,
            side,
            quantity,
            price,
            leverage,
            stopLoss,
            takeProfit,
            status: 'PENDING',
            createTime: new Date()
        };

        this.orders.push(order);
        return order;
    }

    // Execute Stop Order
    executeStopOrder(params) {
        const {
            symbol,
            side,
            quantity,
            stopPrice,
            leverage = 1,
            stopLoss = null,
            takeProfit = null
        } = params;

        const order = {
            id: this.generateId(),
            type: 'STOP',
            symbol,
            side,
            quantity,
            stopPrice,
            leverage,
            stopLoss,
            takeProfit,
            status: 'PENDING',
            createTime: new Date()
        };

        this.orders.push(order);
        return order;
    }

    // Close Position
    closePosition(positionId) {
        const positionIndex = this.positions.findIndex(p => p.id === positionId);
        if (positionIndex === -1) {
            throw new Error('Position not found');
        }

        const position = this.positions[positionIndex];
        const currentPrice = this.getCurrentPrice(position.symbol);

        // Calculate P&L
        let pnl;
        if (position.side === 'BUY') {
            pnl = (currentPrice - position.entryPrice) * position.quantity * position.leverage;
        } else {
            pnl = (position.entryPrice - currentPrice) * position.quantity * position.leverage;
        }

        // Update balance
        this.balance += position.margin + pnl;
        this.tradingProfits += pnl;
        this.tradeBalance += pnl;

        // Remove position
        this.positions.splice(positionIndex, 1);

        return {
            position,
            pnl,
            balance: this.balance
        };
    }

    // Update Position
    updatePosition(positionId) {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return null;

        const currentPrice = this.getCurrentPrice(position.symbol);
        position.currentPrice = currentPrice;

        // Calculate P&L
        if (position.side === 'BUY') {
            position.pnl = (currentPrice - position.entryPrice) * position.quantity * position.leverage;
        } else {
            position.pnl = (position.entryPrice - currentPrice) * position.quantity * position.leverage;
        }

        // Calculate P&L percentage
        position.pnlPercent = (position.pnl / position.margin) * 100;

        // Check stop loss and take profit
        if (position.stopLoss && currentPrice <= position.stopLoss) {
            this.closePosition(positionId);
            return { status: 'CLOSED', reason: 'STOP_LOSS' };
        }

        if (position.takeProfit && currentPrice >= position.takeProfit) {
            this.closePosition(positionId);
            return { status: 'CLOSED', reason: 'TAKE_PROFIT' };
        }

        return { status: 'OPEN', position };
    }

    // Check Liquidation
    checkLiquidation(positionId) {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return false;

        const currentPrice = this.getCurrentPrice(position.symbol);
        const liquidationPrice = this.calculateLiquidationPrice(position);

        if (currentPrice <= liquidationPrice) {
            this.closePosition(positionId);
            return true;
        }

        return false;
    }

    // Calculate Liquidation Price
    calculateLiquidationPrice(position) {
        const maintenanceMargin = 0.005; // 0.5% maintenance margin
        if (position.side === 'BUY') {
            return position.entryPrice * (1 - maintenanceMargin);
        } else {
            return position.entryPrice * (1 + maintenanceMargin);
        }
    }

    // Get Current Price
    getCurrentPrice(symbol) {
        // In production, this would fetch from API
        const prices = {
            'BTC/USDT': 43250.00,
            'ETH/USDT': 2280.50,
            'BNB/USDT': 312.45,
            'XRP/USDT': 0.5234,
            'ADA/USDT': 0.4521,
            'SOL/USDT': 98.76,
            'DOGE/USDT': 0.0823,
            'EUR/USD': 1.0876,
            'GBP/USD': 1.2634,
            'USD/JPY': 149.82,
            'GOLD': 2034.50,
            'OIL': 78.45
        };
        return prices[symbol] || 0;
    }

    // Generate unique ID
    generateId() {
        return 'pos_' + Math.random().toString(36).substr(2, 9);
    }

    // Get Account Summary
    getAccountSummary() {
        const totalPnL = this.positions.reduce((sum, p) => sum + p.pnl, 0);
        const openPositionsValue = this.positions.reduce((sum, p) => sum + p.margin, 0);

        return {
            balance: this.balance,
            tradingProfits: this.tradingProfits,
            tradeBalance: this.tradeBalance,
            openPositions: this.positions.length,
            openPositionsValue,
            totalPnL,
            availableBalance: this.balance - openPositionsValue
        };
    }

    // Get Position History
    getPositionHistory() {
        // In production, this would fetch from database
        return [];
    }
}

// AI Trading Bot
class AITradingBot {
    constructor(tradingEngine) {
        this.tradingEngine = tradingEngine;
        this.enabled = false;
        this.strategies = [];
        this.signals = [];
    }

    // Enable/Disable Bot
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    // Start Bot
    start() {
        console.log('🤖 AI Trading Bot started');
        this.interval = setInterval(() => {
            this.analyzeAndTrade();
        }, 60000); // Analyze every minute
    }

    // Stop Bot
    stop() {
        console.log('🤖 AI Trading Bot stopped');
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    // Analyze and Trade
    async analyzeAndTrade() {
        if (!this.enabled) return;

        console.log('🤖 Analyzing market...');

        // Analyze each symbol
        const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'];
        
        for (const symbol of symbols) {
            const signal = await this.generateSignal(symbol);
            if (signal) {
                this.executeSignal(signal);
            }
        }
    }

    // Generate Trading Signal
    async generateSignal(symbol) {
        // Simulate AI analysis
        const currentPrice = this.tradingEngine.getCurrentPrice(symbol);
        const rsi = this.calculateRSI(symbol);
        const macd = this.calculateMACD(symbol);
        const ma = this.calculateMA(symbol);

        let signal = null;
        let confidence = 0;

        // Buy signals
        if (rsi < 30 && macd > 0 && currentPrice > ma) {
            signal = {
                type: 'BUY',
                symbol,
                price: currentPrice,
                confidence: 0.85,
                reason: 'RSI oversold, MACD bullish, price above MA'
            };
        }
        // Sell signals
        else if (rsi > 70 && macd < 0 && currentPrice < ma) {
            signal = {
                type: 'SELL',
                symbol,
                price: currentPrice,
                confidence: 0.85,
                reason: 'RSI overbought, MACD bearish, price below MA'
            };
        }

        if (signal) {
            console.log(`🤖 Signal generated: ${signal.type} ${symbol} at $${signal.price} (confidence: ${signal.confidence})`);
        }

        return signal;
    }

    // Execute Signal
    executeSignal(signal) {
        try {
            const params = {
                symbol: signal.symbol,
                side: signal.type,
                quantity: 0.01, // Default lot size
                leverage: 10
            };

            const position = this.tradingEngine.executeMarketOrder(params);
            console.log(`🤖 Executed ${signal.type} order for ${signal.symbol}`);
            
            this.signals.push({
                ...signal,
                executedAt: new Date(),
                positionId: position.id
            });

        } catch (error) {
            console.error('🤖 Failed to execute signal:', error.message);
        }
    }

    // Calculate RSI (Relative Strength Index)
    calculateRSI(symbol) {
        // Simulated RSI calculation
        return 30 + Math.random() * 40;
    }

    // Calculate MACD (Moving Average Convergence Divergence)
    calculateMACD(symbol) {
        // Simulated MACD calculation
        return (Math.random() - 0.5) * 2;
    }

    // Calculate Moving Average
    calculateMA(symbol) {
        const currentPrice = this.tradingEngine.getCurrentPrice(symbol);
        return currentPrice * (0.95 + Math.random() * 0.1);
    }

    // Get Bot Status
    getStatus() {
        return {
            enabled: this.enabled,
            signalsGenerated: this.signals.length,
            lastActivity: this.signals.length > 0 ? this.signals[this.signals.length - 1].executedAt : null
        };
    }
}

// Risk Management
class RiskManager {
    constructor() {
        this.maxPositionSize = 1000; // Max position value
        this.maxLeverage = 100;
        this.maxPositionsPerSymbol = 3;
        this.maxDailyLoss = 500;
        this.dailyLoss = 0;
    }

    // Validate Order
    validateOrder(params) {
        const errors = [];

        // Check position size
        if (params.quantity * params.price * params.leverage > this.maxPositionSize) {
            errors.push('Position size exceeds maximum');
        }

        // Check leverage
        if (params.leverage > this.maxLeverage) {
            errors.push('Leverage exceeds maximum');
        }

        // Check daily loss
        if (this.dailyLoss >= this.maxDailyLoss) {
            errors.push('Daily loss limit reached');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Update Daily Loss
    updateDailyLoss(pnl) {
        if (pnl < 0) {
            this.dailyLoss += Math.abs(pnl);
        }
    }

    // Reset Daily Loss
    resetDailyLoss() {
        this.dailyLoss = 0;
    }
}

// Initialize Trading Components
const tradingEngine = new TradingEngine();
const aiTradingBot = new AITradingBot(tradingEngine);
const riskManager = new RiskManager();

// Export for use in other modules
window.TradingEngine = TradingEngine;
window.AITradingBot = AITradingBot;
window.RiskManager = RiskManager;
window.tradingEngine = tradingEngine;
window.aiTradingBot = aiTradingBot;
window.riskManager = riskManager;

console.log('🐉 Trade Dragon Snake Trade - Trading Engine Initialized!');