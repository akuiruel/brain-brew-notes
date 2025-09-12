# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dccafec3-d759-4b52-a398-3dbd59aed661

## How can I edit this code?

There are several ways of editing your application.

## Configuration

To run this project locally, you need to set up your own Firebase project and provide the necessary credentials.

1.  **Create a `.env.local` file:**
    Copy the `.env.example` file to a new file named `.env.local`:

    ```sh
    cp .env.example .env.local
    ```

2.  **Get your Firebase project credentials:**
    If you don't have a Firebase project, create one at [https://console.firebase.google.com/](https://console.firebase.google.com/).

    - Go to your Firebase project settings.
    - In the "General" tab, scroll down to "Your apps".
    - Click on the "Web" platform icon (`</>`).
    - Register your app and you will be provided with a `firebaseConfig` object.

3.  **Populate `.env.local`:**
    Open the `.env.local` file and replace the placeholder values with your actual Firebase credentials.

    ```
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    VITE_FIREBASE_MEASUREMENT_ID=...
    ```

4.  **Enable Anonymous Authentication:**
    For this application to work, you need to enable anonymous sign-in in your Firebase project.
    - Go to your Firebase project.
    - In the left menu, go to Authentication -> Sign-in method.
    - Enable the "Anonymous" provider.

Now, when you run `npm run dev`, the application will use your Firebase project.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dccafec3-d759-4b52-a398-3dbd59aed661) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase/Firestore (migrated from Supabase)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dccafec3-d759-4b52-a398-3dbd59aed661) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
