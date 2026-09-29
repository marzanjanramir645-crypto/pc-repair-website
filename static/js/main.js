document.addEventListener('DOMContentLoaded', () => {
    const repairForm = document.getElementById('repair-form');
    const formFeedback = document.getElementById('form-feedback');

    // =====================================================================
    // MODERN SCROLL NAVBAR SCROLL LOGIC & HAMBURGER SYSTEM
    // =====================================================================
    const navContainer = document.querySelector('.nav-container');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('header nav a');
    
    let lastScrollY = window.scrollY;

    // Scroll Logic: Hide navbar on scroll down, show on scroll up
    window.addEventListener('scroll', () => {
        // Only hide the bar if the mobile side menu drawer isn't currently thrown open
        if (navMenu && !navMenu.classList.contains('open')) {
            if (window.scrollY > lastScrollY && window.scrollY > 80) {
                // Scrolling down - slide menu bar smoothly out of sight
                navContainer.classList.add('nav-hidden');
            } else {
                // Scrolling up - display menu bar cleanly
                navContainer.classList.remove('nav-hidden');
            }
        }
        lastScrollY = window.scrollY;
    }, { passive: true });

    // Hamburger Overlay Drawer trigger event handler
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close mobile drawer immediately if a navigation link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });

        // Close mobile menu if clicking anywhere outside the side drawer interface panel
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('open');
                navMenu.classList.remove('open');
            }
        });
    }

    // =====================================================================
    // AESTHETIC SCROLL TRANSITIONS & ACTIVE NAV TRACKING
    // =====================================================================
    const sections = document.querySelectorAll('section');

    // Intersection Observer configuration for scroll fade-in
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Sync active navigation link states dynamically on scroll
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            } else {
                // Drop visibility slightly when scrolled past to accentuate the active block
                entry.target.classList.remove('visible');
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Triggers when 15% of the item appears on viewport
        rootMargin: "-20px 0px -40px 0px"
    });

    // Attach observers to all layout sections
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // =====================================================================
    // INTAKE TICKET FORM HANDLER
    // =====================================================================
    if (repairForm) {
        repairForm.addEventListener('submit', async (e) => {
            // Prevent the browser from reloading the page
            e.preventDefault();

            // Extract values matching your backend API keys
            const payload = {
                name: document.getElementById('cust-name').value.trim(),
                email: document.getElementById('cust-email').value.trim(),
                device: document.getElementById('device-type').value,
                issue: document.getElementById('issue-desc').value.trim()
            };

            // Provide UI loading indicator state
            const submitBtn = repairForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing Ticket...';
            submitBtn.disabled = true;

            // Clear previous message states
            formFeedback.className = '';
            formFeedback.textContent = '';
            formFeedback.style.display = 'none';

            try {
                // Post form payload directly into your Flask backend endpoint
                const response = await fetch('/api/book-repair', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    // Success handling: update message UI and clean fields
                    formFeedback.textContent = result.message || 'Booking request received successfully!';
                    formFeedback.className = 'success';
                    formFeedback.style.display = 'block';
                    repairForm.reset();
                } else {
                    // API validation or submission server error handling
                    formFeedback.textContent = result.error || 'Failed to submit repair request.';
                    formFeedback.className = 'error';
                    formFeedback.style.display = 'block';
                }

            } catch (error) {
                // Connection or offline client network errors
                console.error('Submission breakdown:', error);
                formFeedback.textContent = 'Network error: Unable to connect to tech support server.';
                formFeedback.className = 'error';
                formFeedback.style.display = 'block';
            } finally {
                // Restore button submission state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
