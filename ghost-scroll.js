class GhostScroller {
    constructor(iframeId, ghostId) {
        this.iframe = document.getElementById(iframeId);
        this.ghost = document.getElementById(ghostId);
        this.scrollPos = 0;
        this.scrollSpeed = 3;
        this.isRunning = false;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;

        this.init();
    }

    init() {
        // Set up ghost element
        this.ghost.style.display = 'none';
        this.ghost.style.willChange = 'transform';
        this.ghost.style.transform = 'translateZ(0)';

        // Set up iframe for capture
        this.iframe.style.willChange = 'transform';
        this.iframe.style.transform = 'translateZ(0)';

        // Event listeners
        document.getElementById('start-btn').addEventListener('click', () => this.toggle());
        document.getElementById('speed-control').addEventListener('input', (e) => {
            this.scrollSpeed = parseInt(e.target.value);
        });

        // Initial capture
        this.captureIframe();
    }

    captureIframe() {
        this.canvas.width = this.iframe.offsetWidth;
        this.canvas.height = this.iframe.offsetHeight * 2; // Double height for scrolling

        // Create visual capture
        setTimeout(() => {
            try {
                // Method 1: Canvas capture (best quality)
                this.ctx.drawImage(this.iframe, 0, 0, this.canvas.width, this.canvas.height);
                this.ghost.style.backgroundImage = `url(${this.canvas.toDataURL()})`;
                this.ghost.style.backgroundSize = `${this.canvas.width}px ${this.canvas.height}px`;
                this.ghost.style.display = 'block';
            } catch (e) {
                // Method 2: SVG fallback
                console.log("Canvas capture failed, using SVG fallback");
                this.ghost.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${this.iframe.offsetWidth}" 
                         height="${this.iframe.offsetHeight * 2}">
                        <foreignObject width="100%" height="100%">
                            <iframe xmlns="http://www.w3.org/1999/xhtml" 
                                    src="${this.iframe.src}" 
                                    style="width:100%;height:100%;border:none"/>
                        </foreignObject>
                    </svg>`;
            }
        }, 1000);
    }

    startScrolling() {
        this.isRunning = true;
        const scroll = () => {
            if (!this.isRunning) return;
            
            this.scrollPos += this.scrollSpeed;
            this.ghost.scrollTop = this.scrollPos;
            
            try {
                this.iframe.contentWindow.scrollTo(0, this.scrollPos);
            } catch (e) {
                // Silently fail for cross-origin
            }

            // Reset and recapture when reaching bottom
            if (this.scrollPos > this.canvas.height - window.innerHeight) {
                this.scrollPos = 0;
                this.captureIframe();
            }

            this.animationId = requestAnimationFrame(scroll);
        };
        scroll();
    }

    stopScrolling() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    toggle() {
        if (this.isRunning) {
            this.stopScrolling();
            document.getElementById('start-btn').textContent = 'Start Ghost Scrolling';
        } else {
            this.startScrolling();
            document.getElementById('start-btn').textContent = 'Stop Ghost Scrolling';
        }
    }
}

// Initialize when iframe loads
document.getElementById('original-iframe').addEventListener('load', () => {
    new GhostScroller('original-iframe', 'ghost-scroller');
});
