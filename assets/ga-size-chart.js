/**
 * Size chart: shows measurements in inches or centimetres.
 * Used on the Size guide page and in the size panel on product pages.
 * Every chart on the page switches together.
 */
class GaSizeChart extends HTMLElement {
  connectedCallback() {
    if (this.ready) return;
    this.ready = true;
    this.onUnits = (event) => this.show(event.detail.unit);
    document.addEventListener('ga:units', this.onUnits);
    for (const button of this.querySelectorAll('[data-unit]')) {
      button.addEventListener('click', () => {
        GaSizeChart.unit = button.dataset.unit;
        document.dispatchEvent(new CustomEvent('ga:units', { detail: { unit: button.dataset.unit } }));
      });
    }
    if (GaSizeChart.unit !== 'in') this.show(GaSizeChart.unit);
  }

  disconnectedCallback() {
    document.removeEventListener('ga:units', this.onUnits);
    this.ready = false;
  }

  /**
   * Reads "19 1/4", "7 1/4" or "24" as a number of inches.
   * @param {string} text
   * @returns {number | null}
   */
  static parse(text) {
    const match = text.trim().match(/^(\d+(?:\.\d+)?)?(?:\s*(\d+)\s*\/\s*(\d+))?$/);
    if (!match || (!match[1] && !match[2])) return null;
    const whole = match[1] ? parseFloat(match[1]) : 0;
    const fraction = match[2] ? parseInt(match[2], 10) / parseInt(match[3], 10) : 0;
    return whole + fraction;
  }

  /** @param {string} unit - "in" or "cm" */
  show(unit) {
    for (const cell of this.querySelectorAll('td[data-in]')) {
      const inches = GaSizeChart.parse(cell.dataset.in);
      if (unit === 'cm' && inches !== null) {
        cell.textContent = (Math.round(inches * 2.54 * 2) / 2).toString();
      } else {
        cell.textContent = cell.dataset.in;
      }
    }
    for (const button of this.querySelectorAll('[data-unit]')) {
      button.setAttribute('aria-pressed', String(button.dataset.unit === unit));
    }
    for (const note of this.querySelectorAll('[data-unit-note]')) {
      note.textContent = unit === 'cm' ? note.dataset.cm : note.dataset.in;
    }
  }
}

GaSizeChart.unit = 'in';

if (!customElements.get('ga-size-chart')) customElements.define('ga-size-chart', GaSizeChart);
