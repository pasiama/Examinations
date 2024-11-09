# Examinations

# Speech-to-Text Editor

This project is a **Speech-to-Text Editor** that allows users to dictate content, which is then automatically transcribed, structured, and displayed in a dynamic text editor interface resembling an A4 document. The editor also provides basic styling, such as headings and options, and allows for inline editing. The application utilizes the **Web Speech API** to capture voice commands and **local storage** to persist transcripts across sessions.

## Features

- **Speech Recognition**: Uses the Web Speech API to transcribe spoken commands into text.
- **Dynamic Formatting**:
  - **Headings**: Voice command `"Heading"` formats the text as a bold heading.
  - **Subheadings**: Voice command `"Subheading"` capitalizes the first letter of each word in the sentence.
  - **Questions**: Automatically numbers questions with each new entry.
  - **Options**: Evenly distributes multiple options (e.g., A to D) across the screen for clarity.
- **Inline Editing**: Allows the user to directly edit the transcribed text within the A4 paper-styled editor.
- **Local Storage Persistence**: Saves transcriptions to local storage so they remain accessible after page reloads.

## Tech Stack

- **React**: For component-based UI.
- **CSS Flexbox**: For responsive layout and styling.
- **Web Speech API**: For capturing and processing voice inputs.
- **Local Storage**: To persist transcript logs across sessions.


## Getting Started

### Prerequisites

- **Node.js** and **npm** (Node Package Manager)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/speech-to-text-editor.git
   cd speech-to-text-editor
   ```


### Usage

1. **Start Listening** : Click the **Start Listening** button to begin speech recognition.
2. **Voice Commands** :

* **"Heading"** : Adds a heading.
* **"Subheading"** : Adds a subheading with each word capitalized.
* **"Questions"** : Adds a numbered question.
* **"Options"** : Recognizes options (A, B, C, etc.) and distributes them evenly.

1. **Edit Text** : Double-click any text to edit it inline.
2. **Clear Text** : Click the **Clear Text** button to remove all entries from the editor and local storage.
