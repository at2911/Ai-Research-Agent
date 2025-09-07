const researchTopicInput = document.getElementById('researchTopic');
const startResearchBtn = document.getElementById('startResearch');
const resultsDiv = document.getElementById('results');
const summaryContent = document.getElementById('summaryContent');
const citationsContent = document.getElementById('citationsContent');
const errorDiv = document.getElementById('error');
const timestampEl = document.getElementById('timestamp');
const btnText = document.querySelector('.btn-text');
const spinner = document.querySelector('.spinner');

startResearchBtn.addEventListener('click', performResearch);
researchTopicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        performResearch();
    }
});

async function performResearch() {
    const topic = researchTopicInput.value.trim();
    
    if (!topic) {
        showError('Please enter a research topic');
        return;
    }
    
    setLoadingState(true);
    hideError();
    hideResults();
    
    try {
        const cleanTopic = topic.replace(/\s+/g, '_');
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`);
        
        if (!response.ok) {
            throw new Error('Wikipedia API failed');
        }
        
        const data = await response.json();
        
        let summary = '';
        let citations = [];
        
        if (data && data.extract) {
            summary = `<h3>${data.title}</h3><p>${data.extract}</p>`;
            citations.push({
                title: data.title + " - Wikipedia",
                url: data.content_urls.desktop.page
            });
        } else {
            summary = `<p>No detailed information found for "${topic}". Try a different search term or check spelling.</p>`;
            citations = [
                { title: `Search "${topic}" on Wikipedia`, url: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(topic)}` }
            ];
        }
        
        displayResults({ summary, citations });
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch research data. The topic might not exist on Wikipedia or there might be a network issue.');
    } finally {
        setLoadingState(false);
    }
}

function displayResults(data) {
    summaryContent.innerHTML = data.summary;
    
    citationsContent.innerHTML = '';
    if (data.citations && data.citations.length > 0) {
        data.citations.forEach(citation => {
            const citationEl = document.createElement('div');
            citationEl.className = 'citation';
            citationEl.innerHTML = `<a href="${citation.url}" target="_blank">${citation.title}</a>`;
            citationsContent.appendChild(citationEl);
        });
    }
    
    timestampEl.textContent = `Research completed at ${new Date().toLocaleString()}`;
    showResults();
}

function setLoadingState(loading) {
    startResearchBtn.disabled = loading;
    if (loading) {
        btnText.textContent = 'Researching...';
        spinner.classList.remove('hidden');
    } else {
        btnText.textContent = 'Start Research';
        spinner.classList.add('hidden');
    }
}

function showResults() {
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function hideResults() {
    resultsDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}
