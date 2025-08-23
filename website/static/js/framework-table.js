// Framework Stats Table using AG Grid
class FrameworkTable {
  constructor(containerId, frameworksData) {
    this.containerId = containerId;
    this.frameworksData = frameworksData;
    this.gridApi = null;
    this.isDark = document.documentElement.classList.contains('dark-theme');
  }

  formatNumber(value, type = 'default') {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'stars':
      case 'downloads':
      case 'forks':
        return value.toLocaleString();
      case 'size':
        return `${value.toFixed(1)} MB`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      default:
        return value.toLocaleString();
    }
  }

  createProgressBar(value, maxValue, color = '#2196f3') {
    const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
    return `
      <div class="progress-bar">
        <div class="progress-bg">
          <div class="progress-fill" style="width: ${percentage}%; background: ${color}"></div>
        </div>
        <div class="progress-text">${this.formatNumber(value)}</div>
      </div>
    `;
  }

  createLicenseBadge(license) {
    if (!license) return '-';
    let className = 'license-other';
    if (license === 'MIT') className = 'license-mit';
    else if (license.includes('BSD')) className = 'license-bsd';
    
    return `<span class="license-badge ${className}">${license}</span>`;
  }

  getColumnDefs() {
    // Calculate max values for progress bars
    const maxStars = Math.max(...this.frameworksData.map(f => f.stars || 0));
    const maxDownloads = Math.max(...this.frameworksData.map(f => f.downloads || 0));
    const maxContributors = Math.max(...this.frameworksData.map(f => f.contributors || 0));

    return [
      {
        headerName: 'Framework',
        field: 'name',
        width: 160,
        pinned: 'left',
        cellRenderer: (params) => {
          const framework = params.data;
          const iconUrl = `https://cdn.simpleicons.org/${framework.id}`;
          return `
            <div class="framework-logo-cell">
              <img src="${iconUrl}" alt="${framework.name}" onerror="this.style.display='none'">
              <span class="framework-name">${framework.name}</span>
            </div>
          `;
        },
        sortable: true,
        filter: true
      },
      {
        headerName: '⭐ Stars',
        field: 'stars',
        width: 120,
        type: 'numericColumn',
        cellRenderer: (params) => {
          const value = params.value || 0;
          return this.createProgressBar(value, maxStars, '#ffd700');
        },
        comparator: (a, b) => (a || 0) - (b || 0),
        sortable: true,
        tooltipField: 'stars',
        tooltipValueGetter: (params) => `${this.formatNumber(params.value, 'stars')} GitHub stars`
      },
      {
        headerName: '📥 Downloads',
        field: 'downloads',
        width: 130,
        type: 'numericColumn',
        cellRenderer: (params) => {
          const value = params.value || 0;
          return this.createProgressBar(value, maxDownloads, '#4caf50');
        },
        comparator: (a, b) => (a || 0) - (b || 0),
        sortable: true,
        tooltipField: 'downloads',
        tooltipValueGetter: (params) => `${this.formatNumber(params.value, 'downloads')} weekly npm downloads`
      },
      {
        headerName: '👥 Contributors',
        field: 'contributors',
        width: 120,
        type: 'numericColumn',
        cellRenderer: (params) => {
          const value = params.value || 0;
          return this.createProgressBar(value, maxContributors, '#9c27b0');
        },
        sortable: true,
        tooltipValueGetter: (params) => `${params.value} total contributors`
      },
      {
        headerName: '📦 Size',
        field: 'size_mb',
        width: 100,
        type: 'numericColumn',
        cellRenderer: (params) => `<span class="number-cell">${this.formatNumber(params.value, 'size')}</span>`,
        sortable: true,
        tooltipValueGetter: (params) => `Repository size: ${this.formatNumber(params.value, 'size')}`
      },
      {
        headerName: '🔗 Forks',
        field: 'forks',
        width: 100,
        type: 'numericColumn',
        cellRenderer: (params) => `<span class="number-cell">${this.formatNumber(params.value)}</span>`,
        sortable: true
      },
      {
        headerName: '🐛 Issues',
        field: 'open_issues',
        width: 100,
        type: 'numericColumn',
        cellRenderer: (params) => {
          const open = params.value || 0;
          const color = open > 400 ? '#f44336' : open > 200 ? '#ff9800' : '#4caf50';
          return `<span class="number-cell" style="color: ${color}">${open}</span>`;
        },
        sortable: true,
        tooltipValueGetter: (params) => {
          const open = params.value || 0;
          const closed = params.data.closed_issues || 0;
          return `${open} open issues, ${closed} closed`;
        }
      },
      {
        headerName: '📄 License',
        field: 'license',
        width: 100,
        cellRenderer: (params) => this.createLicenseBadge(params.value),
        sortable: true,
        filter: true
      },
      {
        headerName: '💻 Language',
        field: 'language',
        width: 110,
        cellRenderer: (params) => `<span class="language-tag">${params.value || '-'}</span>`,
        sortable: true,
        filter: true,
        hide: true
      },
      {
        headerName: '🚀 Latest',
        field: 'npm_latest',
        width: 100,
        cellRenderer: (params) => `<span class="number-cell">${params.value || '-'}</span>`,
        sortable: true,
        tooltipValueGetter: (params) => {
          const version = params.value;
          const date = params.data.npm_latest_date;
          return version ? `v${version} (${this.formatNumber(date, 'date')})` : 'No npm package';
        },
        hide: true
      },
      {
        headerName: '📅 Last Commit',
        field: 'last_commit',
        width: 120,
        cellRenderer: (params) => `<span class="date-cell">${this.formatNumber(params.value, 'date')}</span>`,
        sortable: true,
        sort: 'desc'
      }
    ];
  }

  init() {
    const gridOptions = {
      columnDefs: this.getColumnDefs(),
      rowData: this.frameworksData,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: false,
        floatingFilter: false
      },
      animateRows: true,
      rowSelection: 'multiple',
      suppressCellFocus: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
      },
      onGridSizeChanged: (params) => {
        params.api.sizeColumnsToFit();
      },
      tooltipShowDelay: 500,
      tooltipHideDelay: 2000,
      rowHeight: 52,
      headerHeight: 48
    };

    // Apply theme based on current mode
    const themeClass = this.isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    document.getElementById(this.containerId).className = `stats-table-container ${themeClass}`;

    // Initialize the grid
    new agGrid.Grid(document.getElementById(this.containerId), gridOptions);
  }

  // Method to update theme when dark mode toggles
  updateTheme(isDark) {
    this.isDark = isDark;
    const container = document.getElementById(this.containerId);
    const themeClass = isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    container.className = `stats-table-container ${themeClass}`;
  }
}

// Initialize table when frameworks data is available
function initFrameworkTable() {
  fetch('/static/framework-stats.json')
    .then(response => response.json())
    .then(data => {
      const table = new FrameworkTable('framework-stats-grid', data.items);
      table.init();
      
      // Store reference for theme updates
      window.frameworkTable = table;
    })
    .catch(error => {
      console.error('Error loading framework stats:', error);
      document.getElementById('framework-stats-grid').innerHTML = 
        '<div style="padding: 2rem; text-align: center; color: #666;">Unable to load framework statistics</div>';
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFrameworkTable);
} else {
  initFrameworkTable();
}
