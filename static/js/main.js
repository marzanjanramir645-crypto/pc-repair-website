document.addEventListener('DOMContentLoaded', () => {
    const repairForm = document.getElementById('repair-form');
    const feedback = document.getElementById('form-feedback');

    repairForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        feedback.textContent = "Submitting details...";
        feedback.style.color = "#333";

        const payload = {
            name: document.getElementById('cust-name').value.trim(),
            email: document.getElementById('cust-email').value.trim(),
            device: document.getElementById('device-type').value,
            issue: document.getElementById('issue-desc').value.trim()
        };

        try {
            const res = await fetch('/api/book-repair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                feedback.textContent = "Success! Your request has been recorded. We'll be in touch shortly.";
                feedback.style.color = "green";
                repairForm.reset();
            } else {
                feedback.textContent = `Error: ${result.error || 'Failed to submit'}`;
                feedback.style.color = "red";
            }
        } catch (err) {
            feedback.textContent = "Network error. Please try again later.";
            feedback.style.color = "red";
        }
    });
});
