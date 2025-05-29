# DevDiscovery AI 🧭

Your Compass to Open Source Innovation - An AI-powered tool for discovering, analyzing, and comparing open source projects.

## 🌟 Features

### 🔍 Smart Project Discovery
- AI-powered project search across multiple platforms (GitHub, GitLab, npm, etc.)
- Natural language processing to understand your project requirements
- Advanced filtering by language, stars, activity, and more

### 📊 Comprehensive Analytics
- **Project Health Score**: Evaluates repository health based on multiple factors
- **Activity Analysis**: 
  - Weekly commit activity visualization
  - Contribution trends
  - Issue and PR response times
- **Community Metrics**:
  - Active contributors
  - Response times
  - Community engagement

### 🔄 Project Comparisons
- Side-by-side project comparison
- Compare health scores, activity, and community metrics
- Make informed decisions about which projects to use

### 📈 Project Insights
- Detailed repository analytics
- Language distribution
- Dependency analysis
- Community profile evaluation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A GitHub personal access token (for API access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mosh3eb/DevDiscovery-AI.git
   cd DevDiscovery-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Technologies

- **Frontend**:
  - React 18 with TypeScript
  - Vite for fast development
  - TailwindCSS for styling
  - Chart.js for data visualization

- **Data & Analytics**:
  - GitHub API
  - GitLab API
  - NPM Registry API
  - Custom analytics algorithms

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔑 Environment Variables

Required environment variables:
- `VITE_GITHUB_TOKEN`: GitHub Personal Access Token (required for API access)
- `VITE_GITLAB_TOKEN`: GitLab Access Token (optional)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Note

The accuracy of analytics depends on the availability and accessibility of data from various platforms' APIs. Rate limiting and API restrictions may affect data completeness.
