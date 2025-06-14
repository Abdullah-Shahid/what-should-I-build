// Main JavaScript for What Should I Build?

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeForm();
    initializeAnimations();
    initializeTooltips();
});

function initializeForm() {
    const form = document.getElementById('ideaForm');
    const submitBtn = document.getElementById('generateBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            // Show loading state
            showLoadingState(submitBtn, btnText, btnLoading);
            
            // Validate form
            if (!validateForm()) {
                e.preventDefault();
                hideLoadingState(submitBtn, btnText, btnLoading);
                return false;
            }
        });
    }
    
    // Add input validation
    const skillsInput = document.getElementById('skills');
    const interestsInput = document.getElementById('interests');
    
    if (skillsInput) {
        skillsInput.addEventListener('blur', function() {
            validateField(this, 'Please enter your skills');
        });
    }
    
    if (interestsInput) {
        interestsInput.addEventListener('blur', function() {
            validateField(this, 'Please enter your interests');
        });
    }
}

function validateForm() {
    const skills = document.getElementById('skills').value.trim();
    const interests = document.getElementById('interests').value.trim();
    
    let isValid = true;
    
    if (!skills) {
        showFieldError('skills', 'Please enter your skills');
        isValid = false;
    }
    
    if (!interests) {
        showFieldError('interests', 'Please enter your interests');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field, message) {
    if (!field.value.trim()) {
        showFieldError(field.id, message);
        return false;
    } else {
        clearFieldError(field.id);
        return true;
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const existingError = field.parentNode.querySelector('.field-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-danger small mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.parentNode.querySelector('.field-error');
    
    if (errorDiv) {
        errorDiv.remove();
    }
    
    field.classList.remove('is-invalid');
}

function showLoadingState(button, textElement, loadingElement) {
    button.disabled = true;
    textElement.classList.add('d-none');
    loadingElement.classList.remove('d-none');
}

function hideLoadingState(button, textElement, loadingElement) {
    button.disabled = false;
    textElement.classList.remove('d-none');
    loadingElement.classList.add('d-none');
}

function initializeAnimations() {
    // Add staggered animations to main cards
    const leftCard = document.querySelector('.col-lg-6:first-child .card');
    const rightCard = document.querySelector('.col-lg-6:last-child .card');
    
    if (leftCard) {
        setTimeout(() => {
            leftCard.classList.add('slide-in-left');
        }, 200);
    }
    
    if (rightCard) {
        setTimeout(() => {
            rightCard.classList.add('slide-in-right');
        }, 400);
    }
    
    // Add animation to idea cards when they appear
    const ideaCards = document.querySelectorAll('.idea-card');
    ideaCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 150 + 600);
    });
    
    // Add animation to recent ideas section
    const recentIdeasSection = document.querySelector('.recent-idea-card');
    if (recentIdeasSection) {
        setTimeout(() => {
            recentIdeasSection.classList.add('fade-in-up');
        }, 800);
    }
    
    // Animate empty state features
    const featureItems = document.querySelectorAll('.features-preview .d-flex');
    featureItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in-up');
        }, index * 100 + 1000);
    });
}

function initializeTooltips() {
    // Initialize Bootstrap tooltips if any
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length > 0 && typeof bootstrap !== 'undefined') {
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Utility function to show success messages
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i data-feather="check-circle" class="me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Re-initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Utility function to show error messages
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i data-feather="alert-circle" class="me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Re-initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle export button clicks with loading states
document.querySelectorAll('a[href*="/export/"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const originalText = this.innerHTML;
        this.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Exporting...';
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 3000);
    });
});

// Auto-resize textareas
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Apply auto-resize to textareas
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // Initial resize
    autoResizeTextarea(textarea);
});

// Form enhancement - character counter
function addCharacterCounter(fieldId, maxLength = 500) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const counter = document.createElement('div');
    counter.className = 'character-counter text-muted small text-end mt-1';
    counter.textContent = `0/${maxLength}`;
    
    field.parentNode.appendChild(counter);
    
    field.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = `${length}/${maxLength}`;
        
        if (length > maxLength * 0.9) {
            counter.classList.add('text-warning');
        } else {
            counter.classList.remove('text-warning');
        }
        
        if (length > maxLength) {
            counter.classList.add('text-danger');
            counter.classList.remove('text-warning');
        } else {
            counter.classList.remove('text-danger');
        }
    });
}

// Add character counters to main textareas
addCharacterCounter('skills', 500);
addCharacterCounter('interests', 500);

// Feedback functionality
function quickFeedback(rating) {
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Thank you!';
    button.disabled = true;
    
    // Simulate feedback submission
    setTimeout(() => {
        button.innerHTML = '<i data-feather="check" class="me-1"></i>Submitted';
        button.classList.remove('btn-outline-success', 'btn-outline-primary', 'btn-outline-warning', 'btn-outline-danger');
        button.classList.add('btn-success');
        
        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Show success message
        showSuccessMessage(`Thank you for rating your experience as "${rating}"!`);
    }, 1000);
}

// Handle feedback form submission
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.innerHTML = '<i data-feather="check" class="me-2"></i>Sent Successfully';
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-success');
                
                // Re-initialize feather icons
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
                
                // Show success message
                showSuccessMessage('Thank you for your feedback! We appreciate your input.');
                
                // Reset form after delay
                setTimeout(() => {
                    this.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.classList.remove('btn-success');
                    submitBtn.classList.add('btn-primary');
                    submitBtn.disabled = false;
                    
                    // Re-initialize feather icons
                    if (typeof feather !== 'undefined') {
                        feather.replace();
                    }
                }, 3000);
            }, 1500);
        });
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
