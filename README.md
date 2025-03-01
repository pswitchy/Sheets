# Sheets Clone

A powerful and responsive spreadsheet application built with Next.js, TypeScript, and Tailwind CSS. This project aims to provide a modern, web-based alternative to traditional spreadsheet software.

## Features

- 📊 Full spreadsheet functionality
- 📝 Real-time collaboration
- 📈 Chart creation and visualization
- 🎨 Rich text formatting
- 📑 Multiple sheets support 
- 🔄 Auto-saving
- ⌨️ Keyboard shortcuts
- 📱 Responsive design
- 🎯 Formula support
- 🔒 Data persistence

## Tech Stack

- **Frontend Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Charts:** Chart.js
- **Form Handling:** React Hook Form
- **Data Fetching:** Axios
- **Date Handling:** date-fns
- **Utilities:** clsx, tailwind-merge

## Data Structures

### Cell
- **Type:** Object
- **Usage:** Represents each cell in the spreadsheet. Contains properties for value, format, and formula.

### Sheet
- **Type:** Object
- **Usage:** Represents a sheet within the spreadsheet. Contains properties for cells, row and column count, and frozen rows/columns.

### SpreadsheetData
- **Type:** Object
- **Usage:** Represents the entire spreadsheet. Contains properties for sheets, charts, and other metadata.

### SelectionState
- **Type:** Object
- **Usage:** Represents the current selection state in the spreadsheet. Contains properties for start and end cell references and the sheet ID.

### Why These Data Structures?
- **Objects:** Provide a flexible way to manage complex structures like cells and sheets with various properties.
- **Arrays:** Efficiently manage lists of sheets and charts.
- **Strings:** Simplify referencing cells by their coordinates (e.g., "A1", "B2").

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pswitchy/sheets.git
cd sheets-clone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features in Detail

### Spreadsheet Operations

- Create, edit, and delete cells
- Format text (bold, italic, underline)
- Align text (left, center, right)
- Change font family and size
- Set background and text colors
- Copy and paste cells
- Undo/redo operations

### Sheet Management

- Create multiple sheets
- Switch between sheets
- Rename sheets
- Delete sheets
- Duplicate sheets

### Chart Support

- Create various chart types:
  - Line charts
  - Bar charts
  - Pie charts
  - Scatter plots
- Customize chart appearance
- Auto-update charts when data changes

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + B | Bold |
| Ctrl + I | Italic |
| Ctrl + U | Underline |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + C | Copy |
| Ctrl + V | Paste |
| Enter | Move down |
| Tab | Move right |

## Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

## Development Workflow

1. Write clean, maintainable code
2. Follow TypeScript best practices
3. Add proper comments and documentation
4. Include unit tests for new features
5. Ensure responsive design
6. Optimize performance
7. Follow accessibility guidelines

## Performance Optimization

### Grid Rendering
- Virtualized grid for handling large datasets
- Optimized cell rendering
- Efficient state management

### Data Management
- Debounced auto-saving
- Batch updates for multiple cells
- Optimized formula calculations

### UI Performance
- Memoized components
- Lazy loading of features
- Code splitting
- Asset optimization

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org)

## Support

If you find this project helpful, please give it a ⭐️!
