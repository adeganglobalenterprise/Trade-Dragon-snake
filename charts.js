// ============================================
// TRADE DRAGON SNAKE TRADE - CHARTS
// Owner: Olawale Abdul-Ganiyu Embade
// ============================================

// Chart Manager
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartData = {};
    }

    // Initialize Trading Chart
    initTradingChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;

        // Generate sample candlestick data
        const data = this.generateCandlestickData(100);

        // Draw chart
        this.drawCandlestickChart(ctx, data, canvas.width, canvas.height);

        return {
            canvas,
            data,
            ctx
        };
    }

    // Generate Candlestick Data
    generateCandlestickData(count) {
        const data = [];
        let price = 43250;
        const now = new Date();

        for (let i = count; i >= 0; i--) {
            const time = new Date(now - i * 60000); // 1-minute intervals
            const volatility = 50 + Math.random() * 100;
            
            const open = price;
            const close = price + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * (volatility / 2);
            const low = Math.min(open, close) - Math.random() * (volatility / 2);
            const volume = Math.random() * 1000;

            data.push({
                time: time,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume
            });

            price = close;
        }

        return data;
    }

    // Draw Candlestick Chart
    drawCandlestickChart(ctx, data, width, height) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart dimensions
        const padding = { top: 20, right: 60, bottom: 30, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Calculate price range
        const prices = data.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price labels
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#94A3B8';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`$${price.toFixed(2)}`, width - padding.right + 5, y + 4);
        }

        // Draw candlesticks
        const candleWidth = chartWidth / data.length - 2;

        data.forEach((candle, index) => {
            const x = padding.left + index * (candleWidth + 2);
            
            // Calculate Y positions
            const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
            const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
            const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
            const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;

            // Determine color
            const isGreen = candle.close >= candle.open;
            ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';
            ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';

            // Draw wick
            ctx.beginPath();
            ctx.moveTo(x + candleWidth / 2, highY);
            ctx.lineTo(x + candleWidth / 2, lowY);
            ctx.stroke();

            // Draw body
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY) || 1;
            ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
        });

        // Draw current price line
        const lastCandle = data[data.length - 1];
        const currentPriceY = padding.top + ((maxPrice - lastCandle.close) / priceRange) * chartHeight;
        
        ctx.strokeStyle = '#8B5CF6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, currentPriceY);
        ctx.lineTo(width - padding.right, currentPriceY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current price label
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(width - padding.right, currentPriceY - 12, 55, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`$${lastCandle.close.toFixed(2)}`, width - padding.right + 27.5, currentPriceY + 4);
    }

    // Initialize Portfolio Chart
    initPortfolioChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;

        // Generate portfolio data
        const data = this.generatePortfolioData(30);

        // Draw line chart
        this.drawLineChart(ctx, data, canvas.width, canvas.height);

        return {
            canvas,
            data,
            ctx
        };
    }

    // Generate Portfolio Data
    generatePortfolioData(days) {
        const data = [];
        let value = 10000;
        const now = new Date();

        for (let i = days; i >= 0; i--) {
            const date = new Date(now - i * 86400000);
            const change = (Math.random() - 0.45) * 500; // Slight upward trend
            value += change;

            data.push({
                date: date,
                value: value
            });
        }

        return data;
    }

    // Draw Line Chart
    drawLineChart(ctx, data, width, height) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart dimensions
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Calculate value range
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        // Draw area under line
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        data.forEach((point, index) => {
            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            const y = padding.top + ((maxValue - point.value) / valueRange) * chartHeight;
            ctx.lineTo(x, y);
        });

        ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        data.forEach((point, index) => {
            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            const y = padding.top + ((maxValue - point.value) / valueRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw grid and labels
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const value = maxValue - (valueRange / 5) * i;

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Label
            ctx.fillText(`$${value.toFixed(0)}`, padding.left - 10, y + 4);
        }

        // X-axis labels
        ctx.textAlign = 'center';
        const labelInterval = Math.floor(data.length / 6);

        data.forEach((point, index) => {
            if (index % labelInterval === 0) {
                const x = padding.left + (index / (data.length - 1)) * chartWidth;
                const date = point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                ctx.fillText(date, x, height - padding.bottom + 20);
            }
        });

        // Draw final value
        const lastPoint = data[data.length - 1];
        const lastY = padding.top + ((maxValue - lastPoint.value) / valueRange) * chartHeight;
        const lastX = padding.left + chartWidth;

        // Draw dot
        ctx.beginPath();
        ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`$${lastPoint.value.toFixed(2)}`, lastX - 10, lastY + 5);
    }

    // Update Chart
    updateChart(canvasId, newData) {
        if (!this.charts[canvasId]) return;

        const { canvas, ctx } = this.charts[canvasId];
        this.drawCandlestickChart(ctx, newData, canvas.width, canvas.height);
    }
}

// Initialize Charts
const chartManager = new ChartManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Initialize trading chart
        const tradingChart = chartManager.initTradingChart('tradingChart');
        if (tradingChart) {
            chartManager.charts['tradingChart'] = tradingChart;
        }

        // Initialize portfolio chart
        const portfolioChart = chartManager.initPortfolioChart('portfolioChart');
        if (portfolioChart) {
            chartManager.charts['portfolioChart'] = portfolioChart;
        }

        console.log('📊 Charts initialized successfully');
    }, 2500);
});

// Handle window resize
window.addEventListener('resize', function() {
    Object.keys(chartManager.charts).forEach(chartId => {
        const chart = chartManager.charts[chartId];
        if (chartId === 'tradingChart') {
            chart.canvas.width = chart.canvas.parentElement.clientWidth;
            chart.data = chartManager.generateCandlestickData(100);
            chartManager.drawCandlestickChart(chart.ctx, chart.data, chart.canvas.width, chart.canvas.height);
        } else if (chartId === 'portfolioChart') {
            chart.canvas.width = chart.canvas.parentElement.clientWidth;
            chart.data = chartManager.generatePortfolioData(30);
            chartManager.drawLineChart(chart.ctx, chart.data, chart.canvas.width, chart.canvas.height);
        }
    });
});

// Export for use in other modules
window.ChartManager = ChartManager;
window.chartManager = chartManager;

console.log('🐉 Trade Dragon Snake Trade - Chart Manager Initialized!');