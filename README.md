# English Vocabulary Booster v1.0 🚀

A modern, interactive web application designed to help users master English vocabulary. Built with Next.js, React, Tailwind CSS, and Firebase.

## Features

- **10,000+ Vocabulary Words**: A comprehensive list of English words with translations and examples.
- **Interactive Learning**:
  - **Text-to-Speech**: Listen to the pronunciation of words.
  - **Examples**: View example sentences for context.
  - **Translations**: Toggle translations on/off for self-testing.
- **Personalization**:
  - **Favorites**: Save words to your personal collection (requires Google Login).
  - **Settings**: Customize your learning experience (toggle examples, speaker, translation, auto-scroll).
- **Search & Filter**:
  - **Search**: Find words by English or translation.
  - **Alphabet Filter**: Browse words by starting letter.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Dark Mode Support**: Automatically adapts to your system's theme.
- **Offline Persistence**: Favorites are cached locally for offline access.

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / Auth**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **State Management**: React Context + Custom Hooks
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project with Authentication (Google Provider) and Firestore enabled.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/english-vocabulary-booster.git
    cd english-vocabulary-booster
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Firebase:**

    - Create a file named `app/lib/firebase.ts` (if not already present, though it should be in the repo structure, you might need to update the config).
    - Replace the configuration object with your Firebase project credentials.

    ```typescript
    // app/lib/firebase.ts
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
    };
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── components/         # Reusable UI components (Header, Footer, VocabularyCard, etc.)
├── context/            # React Context providers (AuthContext)
├── data/               # Static data (vocabulary list)
├── hooks/              # Custom React hooks (useFavorites, useVocabulary, etc.)
├── lib/                # Library configurations (Firebase)
├── types/              # TypeScript type definitions
├── layout.tsx          # Root layout
├── page.tsx            # Main application page
└── globals.css         # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Created by **Hafiz Amrullah**
- Vocabulary data sourced from [WordNet](https://wordnet.princeton.edu/) and other open resources.
