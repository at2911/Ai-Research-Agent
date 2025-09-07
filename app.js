// Configuration - Add your API keys here
// Authentication System
class NexoraAuth {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('nexora_users')) || {};
        this.initializeAuth();
    }

    initializeAuth() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('nexora_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainScreen();
        } else {
            this.showLoginScreen();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.currentTarget.dataset.tab;
                this.switchTab(tabType);
            });
        });

        // Demo access button
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.loginAsDemo();
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    switchTab(tabType) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabType}Form`).classList.add('active');

        // Clear any errors
        this.hideAuthError();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        this.setAuthLoading(true);

        // Simulate API delay
        await this.delay(1000);

        // Check credentials
        if (this.users[email] && this.users[email].password === password) {
            this.currentUser = {
                email: email,
                name: this.users[email].name,
                loginTime: new Date().toISOString()
            };

            if (rememberMe) {
                localStorage.setItem('nexora_current_user', JSON.stringify(this.currentUser));
            }

            this.showSuccessMessage('Login successful! Welcome back to Nexora.');
            setTimeout(() => {
                this.showMainScreen();
            }, 1000);
        } else {
            this.showAuthError('Invalid email or password. Try the demo access below!');
        }

        this.setAuthLoading(false);
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        if (this.users[email]) {
            this.showAuthError('Email already registered. Please login instead.');
            return;
        }

        this.setAuthLoading(true);

        // Simulate API delay
        await this.delay(1500);

        // Save new user
        this.users[email] = {
            name: name,
            password: password,
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem('nexora_users', JSON.stringify(this.users));

        this.currentUser = {
            email: email,
            name: name,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('nexora_current_user', JSON.stringify(this.currentUser));

        this.showSuccessMessage(`Welcome to Nexora, ${name}! Account created successfully.`);
        setTimeout(() => {
            this.showMainScreen();
        }, 1000);

        this.setAuthLoading(false);
    }

    loginAsDemo() {
        this.currentUser = {
            email: 'demo@nexora.ai',
            name: 'Demo User',
            loginTime: new Date().toISOString(),
            isDemo: true
        };

        this.showSuccessMessage('Welcome to Nexora Demo! Exploring full functionality...');
        setTimeout(() => {
            this.showMainScreen();
        }, 1000);
    }

    logout() {
        localStorage.removeItem('nexora_current_user');
        this.currentUser = null;
        this.showLoginScreen();
        this.showSuccessMessage('Logged out successfully. Come back soon!');
    }

    showMainScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');

        // Update user info in nav
        const userNameEl = document.getElementById('userName');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }

        // Initialize main app functionality
        this.initializeMainApp();
    }

    showLoginScreen() {
        document.getElementById('mainScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
    }

    setAuthLoading(loading) {
        const loginBtn = document.querySelector('#loginForm .auth-btn');
        const registerBtn = document.querySelector('#registerForm .auth-btn');
        const activeBtn = document.querySelector('.auth-form.active .auth-btn');

        if (activeBtn) {
            const btnContent = activeBtn.querySelector('.btn-content');
            const btnLoading = activeBtn.querySelector('.btn-loading');

            if (loading) {
                btnContent.style.opacity = '0';
                btnLoading.classList.remove('hidden');
                btnLoading.classList.add('active');
                activeBtn.disabled = true;
            } else {
                btnContent.style.opacity = '1';
                btnLoading.classList.add('hidden');
                btnLoading.classList.remove('active');
                activeBtn.disabled = false;
            }
        }
    }

    showAuthError(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }

    hideAuthError() {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    }

    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeMainApp() {
        // Initialize the main research functionality
        console.log('🚀 Nexora main application initialized for:', this.currentUser.name);
        
        // Update search stats
        this.updateSearchStats();
    }

    updateSearchStats() {
        const searchCount = localStorage.getItem('nexora_search_count') || '0';
        const totalSearches = document.getElementById('totalSearches');
        if (totalSearches) {
            totalSearches.textContent = searchCount;
        }
    }
}

// Initialize authentication when page loads
let nexoraAuth;
document.addEventListener('DOMContentLoaded', () => {
    nexoraAuth = new NexoraAuth();
});

// Your existing research functionality goes below...
// (Keep all your existing app.js code for research functionality)

const API_KEYS = {
    SERP_API: 'a67651251b9b0530a61493903c4c58f5b9631a169641ec585c379799e9d24332',  
    NEWS_API: '3bc62f5642254a21b8ea8c2e405842b1',  
    GOOGLE_API: 'AIzaSyDHp8wQWBBqF8HUtuRKrk__mWLfsDcUwCU',   
    SEARCH_ENGINE_ID: 'AIzaSyDHp8wQWBBqF8HUtuRKrk__mWLfsDcUwCU' 
};

// DOM elements
const researchTopicInput = document.getElementById('researchTopic');
const startResearchBtn = document.getElementById('startResearch');
const resultsDiv = document.getElementById('results');
const summaryContent = document.getElementById('summaryContent');
const citationsContent = document.getElementById('citationsContent');
const errorDiv = document.getElementById('error');
const timestampEl = document.getElementById('timestamp');
const nexoraInsights = document.getElementById('nexoraInsights');
const voiceBtn = document.querySelector('.voice-btn');
const btnContent = document.querySelector('.btn-content');
const btnLoading = document.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');

// Voice Recognition Setup
let recognition = null;
let isListening = false;

// Initialize voice recognition if supported
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        researchTopicInput.value = transcript;
        researchTopicInput.focus();
    };
    
    recognition.onend = () => {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
    };
}

// Event listeners
startResearchBtn.addEventListener('click', performResearch);
researchTopicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        performResearch();
    }
});

if (voiceBtn && recognition) {
    voiceBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
}

// Main research function - Multi-source intelligence
async function performResearch() {
    const topic = researchTopicInput.value.trim();
    
    if (!topic) {
        showError('Please enter a research topic to unlock the power of Nexora!');
        return;
    }
    
    setLoadingState(true);
    hideError();
    hideResults();
    
    try {
        console.log(`🚀 Nexora researching: ${topic}`);
        
        // Fetch from multiple sources simultaneously for maximum speed
        const [wikiData, newsData, googleData, redditData, ddgData] = await Promise.allSettled([
            fetchWikipedia(topic),
            fetchNews(topic),
            fetchGoogleSearch(topic),
            fetchReddit(topic),
            fetchDuckDuckGo(topic)
        ]);
        
        // Combine all results into comprehensive research
        const combinedResults = synthesizeResults({
            wikipedia: wikiData.status === 'fulfilled' ? wikiData.value : null,
            news: newsData.status === 'fulfilled' ? newsData.value : null,
            google: googleData.status === 'fulfilled' ? googleData.value : null,
            reddit: redditData.status === 'fulfilled' ? redditData.value : null,
            duckduckgo: ddgData.status === 'fulfilled' ? ddgData.value : null
        }, topic);
        
        displayResults(combinedResults);
        
    } catch (error) {
        console.error('🔥 Nexora research error:', error);
        showError('Research failed due to network issues. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Wikipedia API - Encyclopedia knowledge
async function fetchWikipedia(topic) {
    try {
        const cleanTopic = topic.replace(/\s+/g, '_');
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return {
            title: data.title,
            summary: data.extract,
            url: data.content_urls?.desktop?.page,
            source: 'Wikipedia',
            type: 'encyclopedia'
        };
    } catch (error) {
        console.error('Wikipedia API error:', error);
        return null;
    }
}

// News API - Latest news articles
async function fetchNews(topic) {
    if (!API_KEYS.NEWS_API || API_KEYS.NEWS_API === 'your_newsapi_key_here') {
        return null;
    }
    
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=relevancy&pageSize=5&apiKey=${API_KEYS.NEWS_API}`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.articles?.slice(0, 3).map(article => ({
            title: article.title,
            summary: article.description || article.content?.substring(0, 200) + '...',
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            type: 'news'
        }));
    } catch (error) {
        console.error('News API error:', error);
        return null;
    }
}

// Google Search API - Web results
async function fetchGoogleSearch(topic) {
    if (!API_KEYS.SERP_API || API_KEYS.SERP_API === 'your_serpapi_key_here') {
        return fetchGoogleCustomSearch(topic); // Fallback to Google Custom Search
    }
    
    try {
        const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(topic)}&api_key=${API_KEYS.SERP_API}&num=5`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.organic_results?.slice(0, 3).map(result => ({
            title: result.title,
            summary: result.snippet,
            url: result.link,
            source: 'Google Search',
            type: 'web'
        }));
    } catch (error) {
        console.error('SerpAPI error:', error);
        return null;
    }
}

// Google Custom Search API (alternative)
async function fetchGoogleCustomSearch(topic) {
    if (!API_KEYS.GOOGLE_API || !API_KEYS.SEARCH_ENGINE_ID) {
        return null;
    }
    
    try {
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEYS.GOOGLE_API}&cx=${API_KEYS.SEARCH_ENGINE_ID}&q=${encodeURIComponent(topic)}&num=5`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.items?.slice(0, 3).map(item => ({
            title: item.title,
            summary: item.snippet,
            url: item.link,
            source: 'Google',
            type: 'web'
        }));
    } catch (error) {
        console.error('Google Custom Search error:', error);
        return null;
    }
}

// Reddit API - Community discussions
async function fetchReddit(topic) {
    try {
        const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=5&sort=relevance`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.data?.children?.slice(0, 3).map(post => ({
            title: post.data.title,
            summary: post.data.selftext?.substring(0, 300) + '...' || 'Community discussion thread',
            url: `https://reddit.com${post.data.permalink}`,
            source: `Reddit - r/${post.data.subreddit}`,
            score: post.data.score,
            type: 'discussion'
        }));
    } catch (error) {
        console.error('Reddit API error:', error);
        return null;
    }
}

// DuckDuckGo API - Alternative search
async function fetchDuckDuckGo(topic) {
    try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_html=1&skip_disambig=1`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        if (data.AbstractText) {
            return {
                title: data.Heading || topic,
                summary: data.AbstractText,
                url: data.AbstractURL,
                source: 'DuckDuckGo',
                type: 'knowledge'
            };
        }
        
        return null;
    } catch (error) {
        console.error('DuckDuckGo API error:', error);
        return null;
    }
}

// Synthesize results from all sources into comprehensive research
function synthesizeResults(sources, topic) {
    let summary = `<div class="research-overview"><h2>🧠 Comprehensive Research: ${topic}</h2></div>`;
    let citations = [];
    let insights = '';
    let sourceCount = 0;
    
    // Wikipedia - Encyclopedia knowledge
    if (sources.wikipedia) {
        sourceCount++;
        summary += `<div class="source-section">
            <h3>📚 Encyclopedia Knowledge</h3>
            <div class="knowledge-item">
                <strong>${sources.wikipedia.title}</strong>
                <p>${sources.wikipedia.summary}</p>
                <small>Source: ${sources.wikipedia.source}</small>
            </div>
        </div>`;
        
        citations.push({
            title: `${sources.wikipedia.title} - Wikipedia`,
            url: sources.wikipedia.url,
            type: 'encyclopedia'
        });
    }
    
    // News articles
    if (sources.news && sources.news.length > 0) {
        sourceCount++;
        summary += `<div class="source-section">
            <h3>📰 Latest News Coverage</h3>`;
        
        sources.news.forEach(article => {
            summary += `<div class="news-item">
                <strong>${article.title}</strong>
                <p>${article.summary}</p>
                <small>📅 ${new Date(article.publishedAt).toLocaleDateString()} | ${article.source}</small>
            </div>`;
            
            citations.push({
                title: article.title,
                url: article.url,
                type: 'news',
                source: article.source
            });
        });
        
        summary += `</div>`;
    }
    
    // Google web results
    if (sources.google && sources.google.length > 0) {
        sourceCount++;
        summary += `<div class="source-section">
            <h3>🌐 Web Search Results</h3>`;
        
        sources.google.forEach(result => {
            summary += `<div class="web-item">
                <strong>${result.title}</strong>
                <p>${result.summary}</p>
                <small>🔗 ${result.source}</small>
            </div>`;
            
            citations.push({
                title: result.title,
                url: result.url,
                type: 'web'
            });
        });
        
        summary += `</div>`;
    }
    
    // Reddit discussions
    if (sources.reddit && sources.reddit.length > 0) {
        sourceCount++;
        summary += `<div class="source-section">
            <h3>💬 Community Insights</h3>`;
        
        sources.reddit.forEach(post => {
            summary += `<div class="reddit-item">
                <strong>${post.title}</strong>
                <p>${post.summary}</p>
                <small>👍 ${post.score} votes | ${post.source}</small>
            </div>`;
            
            citations.push({
                title: post.title,
                url: post.url,
                type: 'discussion',
                source: post.source
            });
        });
        
        summary += `</div>`;
    }
    
    // DuckDuckGo knowledge
    if (sources.duckduckgo) {
        sourceCount++;
        summary += `<div class="source-section">
            <h3>🔍 Quick Facts</h3>
            <div class="knowledge-item">
                <strong>${sources.duckduckgo.title}</strong>
                <p>${sources.duckduckgo.summary}</p>
                <small>Source: ${sources.duckduckgo.source}</small>
            </div>
        </div>`;
        
        citations.push({
            title: `${sources.duckduckgo.title} - DuckDuckGo`,
            url: sources.duckduckgo.url,
            type: 'knowledge'
        });
    }
    
    // Generate AI insights
    if (sourceCount > 0) {
        insights = generateInsights(sources, topic, sourceCount);
    }
    
    // Fallback if no results
    if (citations.length === 0) {
        summary = `<div class="no-results">
            <h3>🔍 Limited Results Found</h3>
            <p>Nexora found limited information for "<strong>${topic}</strong>". This could be because:</p>
            <ul>
                <li>The topic is very recent or niche</li>
                <li>Try using different keywords or broader terms</li>
                <li>Check the spelling of your search terms</li>
                <li>Consider related topics or synonyms</li>
            </ul>
            <p><strong>Suggestion:</strong> Try searching for broader concepts related to your topic.</p>
        </div>`;
        
        citations = [
            { title: `Search "${topic}" on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(topic)}`, type: 'manual' },
            { title: `Explore "${topic}" on Wikipedia`, url: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(topic)}`, type: 'manual' }
        ];
        
        insights = `Unable to find comprehensive information about "${topic}". Try refining your search with more specific terms or exploring related concepts.`;
    }
    
    return { summary, citations, insights, sourceCount };
}

// Generate AI insights based on research
function generateInsights(sources, topic, sourceCount) {
    let insights = `🧠 **Nexora AI Analysis:**\n\n`;
    
    insights += `Researched "${topic}" across ${sourceCount} different sources. `;
    
    if (sources.wikipedia) {
        insights += `Encyclopedia sources provide foundational knowledge. `;
    }
    
    if (sources.news && sources.news.length > 0) {
        insights += `Recent news coverage indicates active developments in this area. `;
    }
    
    if (sources.reddit && sources.reddit.length > 0) {
        insights += `Community discussions reveal public interest and diverse perspectives. `;
    }
    
    if (sources.google && sources.google.length > 0) {
        insights += `Web results show broader online presence and resources available. `;
    }
    
    insights += `\n\n**Key Takeaway:** This topic has multi-dimensional coverage across different information types, suggesting it's a well-researched and currently relevant subject.`;
    
    return insights;
}

// Enhanced display function with animations
function displayResults(data) {
    // Display comprehensive summary
    summaryContent.innerHTML = data.summary;
    
    // Display organized citations
    citationsContent.innerHTML = '';
    if (data.citations && data.citations.length > 0) {
        const groupedCitations = groupBy(data.citations, 'type');
        
        Object.keys(groupedCitations).forEach(type => {
            const typeHeader = document.createElement('div');
            typeHeader.className = 'citation-type-header';
            typeHeader.innerHTML = `${getTypeIcon(type)} ${getTypeLabel(type)}`;
            citationsContent.appendChild(typeHeader);
            
            groupedCitations[type].forEach(citation => {
                const citationEl = document.createElement('div');
                citationEl.className = `source-item citation-${type}`;
                citationEl.innerHTML = `
                    <a href="${citation.url}" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i>
                        ${citation.title}
                    </a>
                    ${citation.source ? `<small>📌 ${citation.source}</small>` : ''}
                `;
                citationsContent.appendChild(citationEl);
            });
        });
    }
    
    // Display Nexora AI insights
    if (nexoraInsights && data.insights) {
        nexoraInsights.innerHTML = data.insights.replace(/\n/g, '<br>');
    }
    
    // Update timestamp with source count
    timestampEl.textContent = `Research completed at ${new Date().toLocaleString()} | ${data.citations.length} sources found`;
    
    // Show results with smooth animation
    showResults();
    
    console.log(`✅ Nexora research complete: ${data.citations.length} sources synthesized`);
}

// Helper functions
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key] || 'other';
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
}

function getTypeLabel(type) {
    const labels = {
        'encyclopedia': 'Encyclopedia Sources',
        'news': 'News Articles',
        'web': 'Web Results',
        'discussion': 'Community Discussions',
        'knowledge': 'Knowledge Base',
        'manual': 'Suggested Searches'
    };
    return labels[type] || 'Other Sources';
}

function getTypeIcon(type) {
    const icons = {
        'encyclopedia': '📚',
        'news': '📰',
        'web': '🌐',
        'discussion': '💬',
        'knowledge': '🧠',
        'manual': '🔍'
    };
    return icons[type] || '📄';
}

function setLoadingState(loading) {
    startResearchBtn.disabled = loading;
    if (loading) {
        btnContent.style.opacity = '0';
        btnLoading.classList.remove('hidden');
        btnLoading.classList.add('active');
    } else {
        btnContent.style.opacity = '1';
        btnLoading.classList.add('hidden');
        btnLoading.classList.remove('active');
    }
}

function showResults() {
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    resultsDiv.classList.add('hidden');
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    errorDiv.classList.remove('hidden');
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// Retry functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('retry-btn')) {
        hideError();
        performResearch();
    }
});

// Auto-focus and keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    researchTopicInput?.focus();
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement === researchTopicInput) {
        e.preventDefault();
        performResearch();
    }
    
    if (e.key === 'Escape') {
        if (researchTopicInput.value) {
            researchTopicInput.value = '';
        }
        researchTopicInput.focus();
    }
});

// Enhanced visual feedback
researchTopicInput.addEventListener('input', function() {
    const hasContent = this.value.trim().length > 0;
    const inputWrapper = this.closest('.input-wrapper');
    
    if (hasContent) {
        inputWrapper.style.borderColor = 'rgba(0, 255, 255, 0.5)';
        inputWrapper.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.2)';
    } else {
        inputWrapper.style.borderColor = 'rgba(0, 255, 255, 0.3)';
        inputWrapper.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    }
});

console.log('🚀 Nexora Multi-Source Research Engine initialized');

