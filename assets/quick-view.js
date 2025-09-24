class QuickView extends HTMLElement {
  constructor() {
    super();
    this.modal = document.getElementById('quick-view-modal');
    this.closeButton = document.getElementById('quick-view-close');
    this.productContent = document.getElementById('quick-view-product');
    this.prevButton = document.getElementById('quick-view-prev');
    this.nextButton = document.getElementById('quick-view-next');

    this.productHandles = [];
    this.currentIndex = -1;

    this.closeButton.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });
    this.prevButton.addEventListener('click', () => this.showPreviousProduct());
    this.nextButton.addEventListener('click', () => this.showNextProduct());
  }

  openModal(productHandle) {
    const productCardButtons = document.querySelectorAll('button[is="quick-view-button"]');
    this.productHandles = Array.from(productCardButtons).map(button => button.dataset.productHandle);
    this.currentIndex = this.productHandles.indexOf(productHandle);
    
    this.modal.style.display = 'flex';
    this.fetchProduct(productHandle);
    this.updateNavButtons();
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.productContent.innerHTML = '';
  }

  fetchProduct(productHandle) {
    this.productContent.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';
    
    fetch(`/products/${productHandle}?view=quick-view`)
      .then(response => response.text())
      .then(text => {
        this.productContent.innerHTML = text;
        this.executeScripts(this.productContent);
      })
      .catch(error => {
        this.productContent.innerHTML = '<p>Error: Could not fetch product details.</p>';
        console.error('Error fetching quick view:', error);
      });
  }

  executeScripts(container) {
    container.querySelectorAll('script').forEach(script => {
      const newScript = document.createElement('script');
      script.getAttributeNames().forEach(attr => newScript.setAttribute(attr, script.getAttribute(attr)));
      if (script.innerHTML) {
        newScript.appendChild(document.createTextNode(script.innerHTML));
      }
      script.parentNode.replaceChild(newScript, script);
    });
  }

  showPreviousProduct() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.fetchProduct(this.productHandles[this.currentIndex]);
      this.updateNavButtons();
    }
  }

  showNextProduct() {
    if (this.currentIndex < this.productHandles.length - 1) {
      this.currentIndex++;
      this.fetchProduct(this.productHandles[this.currentIndex]);
      this.updateNavButtons();
    }
  }

  updateNavButtons() {
    // THE FIX: Use 'visibility' instead of 'display' to keep the layout stable.
    this.prevButton.style.visibility = this.currentIndex === 0 ? 'hidden' : 'visible';
    this.nextButton.style.visibility = this.currentIndex === this.productHandles.length - 1 ? 'hidden' : 'visible';
  }
}

customElements.define('quick-view', QuickView);

class QuickViewButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const quickView = document.querySelector('quick-view');
      if (quickView) {
        quickView.openModal(this.dataset.productHandle);
      }
    });
  }
}

customElements.define('quick-view-button', QuickViewButton, { extends: 'button' });