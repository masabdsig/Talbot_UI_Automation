// pages/basictables.js
// Generic Playwright page object for table utilities
// Reusable across any dashboard tab or table

const { expect } = require('@playwright/test');

class BasicTables {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

/**
 * Get all column headers for a table
 * @param {string} tableSelector - CSS selector for the table
 * @returns {Promise<Array<string>>} - Array of column header texts
 */
async getColumnHeaders(tableSelector) {
  try {
    // Wait for the header row to be present
    await this.page.waitForSelector('#grid_212521791_2 > div.e-gridheader.e-lib.e-droppable > div > table > thead > tr', { timeout: 5000 });
    
    const headerRow = await this.page.$('#grid_212521791_2 > div.e-gridheader.e-lib.e-droppable > div > table > thead > tr');
    if (!headerRow) {
      console.log('Header row not found');
      return [];
    }
    
    const ths = await headerRow.$$('th');
    console.log(`Found ${ths.length} header cells`);
    
    const headers = [];
    for (const th of ths) {
      const div = await th.$('div');
      const text = div ? (await div.textContent())?.trim() : (await th.textContent())?.trim();
      if (text) {
        console.log(`Header found: "${text}"`);
        headers.push(text);
      }
    }
    
    console.log(`Total headers: ${headers.length}`);
    return headers;
  } catch (error) {
    console.error('Error getting column headers:', error);
    return [];
  }
}

/**
 * Get all row values for a given column index (0-based)
 * @param {string} tableSelector - CSS selector for the table
 * @param {number} colIndex - Column index (0-based)
 * @returns {Promise<Array<string>>}
 */
/**
/**
 * Get all row values for a given column index (0-based)
 * @param {string} tableSelector - CSS selector for the table
 * @param {number} colIndex - Column index (0-based)
 * @returns {Promise<Array<string>>}
 */
async getColumnValues(tableSelector, colIndex) {
  const rowSelector = 'div.e-content:visible tbody tr';
  
  return this.page.$$eval(
    rowSelector,
    (rows, colIndex) => {
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        const cell = cells[colIndex];
        return cell ? cell.innerText.trim() : '';
      }).filter(text => text !== '' && text !== 'No records to display');
    },
    colIndex
  );
}
  /**
   * Click a column header by name
   * @param {string} tableSelector - CSS selector for the table
   * @param {string} columnName - Visible column header text
   */
  async clickColumnHeader(tableSelector, columnName) {
    // Use the new, more specific selector for thead > tr > th > div[1]
    // Use the exact selector provided for the header row
    const headerRow = await this.page.$('#grid_212521791_2 > div.e-gridheader.e-lib.e-droppable > div > table > thead > tr');
    if (!headerRow) throw new Error('Header row not found');
    const ths = await headerRow.$$('th');
    for (const th of ths) {
      const div = await th.$('div');
      const text = div ? (await div.textContent())?.trim() : (await th.textContent())?.trim();
      if (text === columnName) {
        await (div || th).click();
        return;
      }
    }
    throw new Error(`Column header '${columnName}' not found`);
  }

  /**
   * Verify sorting for a column (ascending and descending)
   * @param {string} tableSelector - CSS selector for the table
   * @param {string} columnName - Visible column header text
   * @param {'string'|'number'|'date'} [type='string'] - Data type for sorting
   */
  async verifyColumnSorting(tableSelector, columnName, type = 'string') {
    // Get column index (case-insensitive, trimmed)
    const headers = await this.getColumnHeaders(tableSelector);
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const normalizedColumn = columnName.trim().toLowerCase();
    const colIndex = normalizedHeaders.findIndex(h => h === normalizedColumn);
    if (colIndex === -1) {
      throw new Error(`Column '${columnName}' not found. Available: [${headers.join(', ')}]`);
    }

    // Ascending
    await this.clickColumnHeader(tableSelector, columnName);
    await this.page.waitForTimeout(500); // Wait for sorting animation
    let valuesAsc = await this.getColumnValues(tableSelector, colIndex);
    let sortedAsc = this._sortValues(valuesAsc, type, 'asc');
    expect(valuesAsc).toEqual(sortedAsc);

    // Descending
    await this.clickColumnHeader(tableSelector, columnName);
    await this.page.waitForTimeout(500);
    let valuesDesc = await this.getColumnValues(tableSelector, colIndex);
    let sortedDesc = this._sortValues(valuesDesc, type, 'desc');
    expect(valuesDesc).toEqual(sortedDesc);
  }

  /**
   * Internal: Sort values by type and direction
   * @param {Array<string>} values
   * @param {'string'|'number'|'date'} type
   * @param {'asc'|'desc'} direction
   * @returns {Array<string>}
   */
  _sortValues(values, type, direction) {
    let arr = [...values];
    let compareFn;
    if (type === 'number') {
      compareFn = (a, b) => Number(a.replace(/[^\d.-]/g, '')) - Number(b.replace(/[^\d.-]/g, ''));
    } else if (type === 'date') {
      compareFn = (a, b) => new Date(a) - new Date(b);
    } else {
      compareFn = (a, b) => a.localeCompare(b);
    }
    arr.sort(compareFn);
    if (direction === 'desc') arr.reverse();
    return arr;
  }
}

module.exports = { BasicTables };