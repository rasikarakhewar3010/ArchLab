# ArchLab 🚀

ArchLab is a highly interactive system architecture design and simulation tool. It provides a flexible drag-and-drop canvas for mapping out modern cloud infrastructure—including load balancers, microservices, and databases—and prepares designs for automated AI feedback on scalability, reliability, and security.

## ✨ Features

- **Interactive Canvas**: Drag and drop architecture components using a fluid React Flow interface.
- **Component Palette**: A rich library of computing, storage, networking, and security components ready to be deployed to the canvas.
- **Dynamic Configuration**: Configure properties for each node to simulate realistic system behaviors and metrics.
- **Real-time AI Analysis**: Prepare and score your architectural designs to receive instant feedback on your technical decisions.

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript
- **Build Tool**: Vite
- **Canvas Engine**: React Flow (`@xyflow/react`)
- **Iconography**: Lucide React
- **Styling**: Custom Vanilla CSS with CSS Variables for theming

## 🚀 Getting Started

Follow these step-by-step instructions to get the ArchLab project running locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation & Setup

1. **Navigate to the frontend directory** (if you aren't already there):
   ```bash
   cd d:/ArchLab/frontend
   ```

2. **Install all required dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Once the server starts, open your browser and navigate to the local URL provided in your terminal (usually `http://localhost:5173`). Any changes you make to the code will instantly reflect in the browser thanks to Hot Module Replacement (HMR).

### Building for Production

When you are ready to deploy ArchLab, create an optimized production build by running:
```bash
npm run build
```
The compiled, minified files will be output to the `dist/` directory. You can preview this production build locally by running:
```bash
npm run preview
```

## 📂 Project Structure

- `/src/components/Canvas` - Core React Flow canvas, node logic, and edge routing.
- `/src/components/Sidebar` - Draggable Component Palette and dynamic Properties Panel.
- `/src/components/Header` - Top navigation bar and action buttons.
- `/src/data` - Pre-defined architecture component definitions and library.
- `/src/types` - Centralized, strict TypeScript interfaces for application-wide type safety.

## 📜 License

This project is proprietary and confidential.
